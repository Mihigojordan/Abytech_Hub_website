import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GlobalSocketGateway } from 'src/global/socket/socket.gateway';
import { PushNotificationsService } from '../push-notification/push-notification.service';
import { RequestWithAdminOrUser } from 'src/guards/admin-user-dual-auth.guard';

export type Recipient = {
  id: string;
  type: 'ADMIN' | 'USER';
  read: boolean;
  link?: string | null;
};

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socket: GlobalSocketGateway,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  // ────────────────────────────────
  // HELPER: GET SENDER AVATAR/ICON
  // ────────────────────────────────
 private async getSenderIcon(
  senderId: string,
  senderType: 'ADMIN' | 'USER',
  req?: RequestWithAdminOrUser,
): Promise<string | null> {
  let avatarPath: string | null = null;

  if (senderType === 'ADMIN') {
    const admin = await this.prisma.admin.findUnique({
      where: { id: senderId },
    });
    avatarPath = admin?.profileImage ?? null;
  }

  if (senderType === 'USER') {
    const user = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    avatarPath = user?.avatar ?? null;
  }

  if (!avatarPath) return null;

  // Return as-is if already a full URL
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  const normalizedPath = avatarPath.replace(/\\/g, '/');
  const origin = req
    ? `${req.protocol}://${req.get('host')}`
    : process.env.APP_URL;

  return `${origin}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
}

  // ────────────────────────────────
  // CREATE NOTIFICATION
  // ────────────────────────────────
  async createNotification(
    data: {
      recipients: Recipient[];
      senderId?: string;
      senderType?: 'ADMIN' | 'USER';
      title: string;
      message: string;
    },
    req?: RequestWithAdminOrUser,
  ) {
    if (!data.recipients || !data.recipients.length) {
      throw new BadRequestException('At least one recipient is required');
    }

    // 1️⃣ SAVE NOTIFICATION
    const notification = await this.prisma.notification.create({
      data: {
        recipients: data.recipients as any,
        senderId: data.senderId,
        senderType: data.senderType as any,
        title: data.title,
        message: data.message,
      },
    });

    // 2️⃣ GET SENDER ICON
    const icon =
      data.senderId && data.senderType
        ? await this.getSenderIcon(data.senderId, data.senderType, req)
        : null;

    console.log('url icon =>', icon);

    // 3️⃣ SEND PUSH NOTIFICATIONS TO ALL RECIPIENTS
    const pushPromises = data.recipients.map(async (recipient) => {
      try {
        await this.pushNotificationsService.sendToUser(
          recipient.id,
          recipient.type as any,
          {
            title: data.title,
            message: data.message,
            url: recipient.link ?? null,
            tag: notification.id,
            icon,
            data: {
              url: recipient.link ?? null,
              notificationId: notification.id,
            },
          },
        );
      } catch (error) {
        console.error(
          `❌ Failed to send push to recipient ${recipient.id}:`,
          error,
        );
      }
    });

    await Promise.all(pushPromises);

    // 4️⃣ SOCKET EMIT
    this.socket.emitToRecipients(
      data.recipients,
      'new-notification',
      notification,
    );

    console.log('new notification emitted');

    return notification;
  }

  // ────────────────────────────────
  // GET NOTIFICATIONS FOR A SPECIFIC RECIPIENT
  // ────────────────────────────────
  async getNotificationsForRecipient(
    recipientId: string,
    recipientType: 'ADMIN' | 'USER',
    page: number = 1,
    limit: number = 10,
    searchQuery?: string,
  ) {
    const skip = (page - 1) * limit;

    let notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Filter by recipient
    notifications = notifications.filter((notif) =>
      (notif.recipients as Recipient[]).some(
        (r) => r.id === recipientId && r.type === recipientType,
      ),
    );

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      notifications = notifications.filter(
        (notif) =>
          notif.title.toLowerCase().includes(query) ||
          notif.message.toLowerCase().includes(query),
      );
    }

    const total = notifications.length;
    const paginated = notifications.slice(skip, skip + limit);

    // Expose only the current recipient's slice of the recipients array
    const data = paginated.map((notif) => {
      const recipientEntry = (notif.recipients as Recipient[]).find(
        (r) => r.id === recipientId && r.type === recipientType,
      );
      return {
        ...notif,
        read: recipientEntry?.read ?? false,
        link: recipientEntry?.link ?? null,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ────────────────────────────────
  // MARK AS READ
  // ────────────────────────────────
  async markAsRead(notificationId: string, recipientId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    const recipients = (notification.recipients as Recipient[]).map((r) => {
      if (r.id === recipientId) return { ...r, read: true };
      return r;
    });

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { recipients: recipients as any },
    });

    const recipient = (notification.recipients as Recipient[]).find(
      (r) => r.id === recipientId,
    );

    if (recipient) {
      this.socket.emitToRecipients(
        [{ ...recipient }],
        'notification-read',
        { notificationId, recipientId },
      );
    }

    return updated;
  }

  // ────────────────────────────────
  // GET UNREAD COUNT FOR A RECIPIENT
  // ────────────────────────────────
  async getUnreadCount(recipientId: string, recipientType: 'ADMIN' | 'USER') {
    const notifications = await this.prisma.notification.findMany();

    const unread = notifications.filter((notif) =>
      (notif.recipients as Recipient[]).some(
        (r) =>
          r.id === recipientId &&
          r.type === recipientType &&
          r.read === false,
      ),
    );

    return { unreadCount: unread.length };
  }

  // ────────────────────────────────
  // MARK ALL AS READ FOR A RECIPIENT
  // ────────────────────────────────
  async markAllAsRead(recipientId: string, recipientType: 'ADMIN' | 'USER') {
    const notifications = await this.prisma.notification.findMany();

    const toUpdate = notifications.filter((notif) =>
      (notif.recipients as Recipient[]).some(
        (r) =>
          r.id === recipientId &&
          r.type === recipientType &&
          r.read === false,
      ),
    );

    await Promise.all(
      toUpdate.map((notif) => {
        const updatedRecipients = (notif.recipients as Recipient[]).map((r) => {
          if (r.id === recipientId && r.type === recipientType) {
            return { ...r, read: true };
          }
          return r;
        });

        return this.prisma.notification.update({
          where: { id: notif.id },
          data: { recipients: updatedRecipients as any },
        });
      }),
    );

    return { success: true, updated: toUpdate.length };
  }
}