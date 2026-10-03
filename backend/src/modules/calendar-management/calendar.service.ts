import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

const REMINDER_CHECK_INTERVAL_MS = 30 * 1000;
// Reminders older than this (e.g. the server was down) are skipped instead of sent late
const MAX_REMINDER_DELAY_MS = 60 * 60 * 1000;
const CALENDAR_LINK = '/admin/dashboard/calendar';

@Injectable()
export class CalendarService implements OnModuleInit, OnModuleDestroy {
  private reminderInterval: ReturnType<typeof setInterval> | null = null;
  private checking = false;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.reminderInterval = setInterval(() => {
      this.sendDueReminders().catch((e) =>
        console.error('Calendar reminder check failed:', e.message),
      );
    }, REMINDER_CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.reminderInterval) clearInterval(this.reminderInterval);
  }

  // Helper: Validate input and compute startTime / endTime / remindAt
  private normalizeEventData(
    data: any,
    existing?: { startTime: Date; endTime: Date | null; reminderMinutes: number },
  ) {
    const result: any = {};

    if (data.title !== undefined) {
      if (!String(data.title).trim()) throw new BadRequestException('Title is required');
      result.title = String(data.title).trim();
    }
    if (data.description !== undefined) result.description = data.description || null;
    if (data.color !== undefined) result.color = data.color || null;

    const startTime = data.startTime !== undefined ? new Date(data.startTime) : existing?.startTime;
    if (!startTime || isNaN(startTime.getTime())) {
      throw new BadRequestException('A valid start date and time is required');
    }

    let endTime = existing?.endTime ?? null;
    if (data.endTime !== undefined) {
      endTime = data.endTime ? new Date(data.endTime) : null;
      if (endTime && isNaN(endTime.getTime())) throw new BadRequestException('Invalid end time');
    }
    if (endTime && endTime < startTime) {
      throw new BadRequestException('End time cannot be before start time');
    }

    const reminderMinutes =
      data.reminderMinutes !== undefined
        ? parseInt(data.reminderMinutes, 10)
        : (existing?.reminderMinutes ?? 0);
    if (isNaN(reminderMinutes) || reminderMinutes < 0) {
      throw new BadRequestException('Reminder must be 0 or more minutes before the event');
    }

    const remindAt = new Date(startTime.getTime() - reminderMinutes * 60 * 1000);

    result.startTime = startTime;
    result.endTime = endTime;
    result.reminderMinutes = reminderMinutes;
    result.remindAt = remindAt;
    // (Re)arm the reminder on every save unless it is already too old to send
    result.notified = remindAt.getTime() < Date.now() - MAX_REMINDER_DELAY_MS;

    return result;
  }

  async findAll(adminId: string, from?: string, to?: string) {
    const where: any = { adminId };
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    if ((fromDate && isNaN(fromDate.getTime())) || (toDate && isNaN(toDate.getTime()))) {
      throw new BadRequestException('Invalid date range');
    }
    if (fromDate || toDate) {
      where.startTime = {
        ...(fromDate && { gte: fromDate }),
        ...(toDate && { lte: toDate }),
      };
    }
    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  private async findOwned(id: string, adminId: string) {
    const event = await this.prisma.calendarEvent.findFirst({ where: { id, adminId } });
    if (!event) throw new NotFoundException('Calendar event not found');
    return event;
  }

  async create(data: any, adminId: string) {
    if (!data.title) throw new BadRequestException('Title is required');
    const event = await this.prisma.calendarEvent.create({
      data: {
        ...this.normalizeEventData(data),
        admin: { connect: { id: adminId } },
      },
    });
    return { message: 'Event created successfully', event };
  }

  async update(id: string, data: any, adminId: string) {
    const existing = await this.findOwned(id, adminId);
    const event = await this.prisma.calendarEvent.update({
      where: { id },
      data: this.normalizeEventData(data, existing),
    });
    return { message: 'Event updated successfully', event };
  }

  async remove(id: string, adminId: string) {
    await this.findOwned(id, adminId);
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { message: 'Event deleted successfully' };
  }

  // Runs every 30s: notify owners of events whose reminder time has arrived
  async sendDueReminders() {
    if (this.checking) return;
    this.checking = true;
    try {
      const now = new Date();
      const due = await this.prisma.calendarEvent.findMany({
        where: {
          notified: false,
          remindAt: { lte: now, gte: new Date(now.getTime() - MAX_REMINDER_DELAY_MS) },
        },
        take: 100,
      });

      for (const event of due) {
        // Claim the event first so a reminder is never sent twice
        const claimed = await this.prisma.calendarEvent.updateMany({
          where: { id: event.id, notified: false },
          data: { notified: true },
        });
        if (claimed.count === 0) continue;

        const time = event.startTime.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: process.env.APP_TIMEZONE || 'Africa/Kigali',
        });
        const message =
          event.reminderMinutes > 0
            ? `"${event.title}" starts in ${this.formatMinutes(event.reminderMinutes)} (at ${time})`
            : `"${event.title}" is starting now (${time})`;

        try {
          await this.notificationService.createNotification({
            recipients: [{ id: event.adminId, type: 'ADMIN', read: false, link: CALENDAR_LINK }],
            title: 'Schedule Reminder',
            message,
          });
        } catch (e) {
          console.error('Failed to send calendar reminder:', e.message);
        }
      }
    } finally {
      this.checking = false;
    }
  }

  private formatMinutes(minutes: number) {
    if (minutes % 1440 === 0) return `${minutes / 1440} day${minutes === 1440 ? '' : 's'}`;
    if (minutes % 60 === 0) return `${minutes / 60} hour${minutes === 60 ? '' : 's'}`;
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
}
