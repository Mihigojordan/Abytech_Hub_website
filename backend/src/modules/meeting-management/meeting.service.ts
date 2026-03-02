import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { deleteFile } from 'src/common/utils/file-upload.utils';
import { MeetingStatus } from '../../../generated/prisma';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MeetingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  // Helper: Get all admins for notifications
  private async getAllAdminIds(): Promise<string[]> {
    const admins = await this.prisma.admin.findMany({ select: { id: true } });
    return admins.map(a => a.id);
  }

  // Helper: Get admin name by ID
  private async getAdminName(adminId: string): Promise<string> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { adminName: true },
    });
    return admin?.adminName || 'Unknown';
  }


  // Create meeting
  async create(data: any, adminId: string) {
    try {
      // Parse dates
      const startTime = new Date(data.startTime);
      const endTime = data.endTime ? new Date(data.endTime) : null;

      // Validate dates
      if (endTime && endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }

      const meeting = await this.prisma.meeting.create({
        data: {
          title: data.title,
          description: data.description,
          startTime,
          endTime,
          status: data.status || 'SCHEDULED',
          location: data.location,
          meetingLink: data.meetingLink,
          participants: data.participants || [],
          keyPoints: data.keyPoints || [],
          actionItems: data.actionItems || [],
          attachments: data.attachments || [],
          createdBy: { connect: { id: adminId } },
        },
        include: { createdBy: true },
      });

      // Send notification to all admins
      const adminIds = await this.getAllAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(id => ({
          id,
          type: 'ADMIN' as const,
          read: id === adminId,
          link: `/admin/dashboard/meetings`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'New Meeting Scheduled',
        message: `${senderName} scheduled a new meeting: "${meeting.title}"`,
      }).catch(err => console.error('Failed to send notification:', err));

      return meeting;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to create meeting: ' + error.message);
    }
  }

  // Get all meetings with pagination and filters
  async findAll(
    page = 1,
    limit = 10,
    search = '',
    status?: MeetingStatus,
    startDate?: string,
    endDate?: string,
    createdById?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    // Filter by creator
    if (createdById) {
      where.createdById = createdById;
    }

    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        include: { createdBy: true },
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get upcoming meetings
  async findUpcoming(limit = 5, adminId?: string) {
    const where: any = {
      startTime: { gte: new Date() },
      status: { in: ['SCHEDULED', 'ONGOING'] },
    };

    if (adminId) {
      where.createdById = adminId;
    }

    return this.prisma.meeting.findMany({
      where,
      include: { createdBy: true },
      take: limit,
      orderBy: { startTime: 'asc' },
    });
  }

  // Get one meeting by ID
  async findOne(id: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  // Update meeting
  async update(id: string, data: any, adminId?: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Parse dates if provided
    const updateData: any = { ...data };
    if (data.startTime) {
      updateData.startTime = new Date(data.startTime);
    }
    if (data.endTime) {
      updateData.endTime = new Date(data.endTime);
    }

    // Validate dates
    const startTime = updateData.startTime || meeting.startTime;
    const endTime = updateData.endTime || meeting.endTime;
    if (endTime && endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // If new attachments, delete old ones from storage
    if (data.attachments && meeting.attachments) {
      for (const oldFile of meeting.attachments as any[]) {
        if (oldFile.fileUrl) deleteFile(oldFile.fileUrl);
      }
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: { id },
      data: updateData,
      include: { createdBy: true },
    });

    // Send notification to all admins
    if (adminId) {
      const adminIds = await this.getAllAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/meetings`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'Meeting Updated',
        message: `${senderName} updated the meeting: "${updatedMeeting.title}"`,
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return updatedMeeting;
  }

  // Update meeting status
  async updateStatus(id: string, status: MeetingStatus, adminId?: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: { id },
      data: { status },
      include: { createdBy: true },
    });

    // Send notification to participants and all admins
    if (adminId) {
      const adminIds = await this.getAllAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/meetings`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'Meeting Status Changed',
        message: `${senderName} changed meeting "${updatedMeeting.title}" status to ${status}`,
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return updatedMeeting;
  }

  // Add participant to meeting
  async addParticipant(id: string, participant: { adminId: string; name: string; attended?: boolean }) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const participants = (meeting.participants as any[]) || [];

    // Check if participant already exists
    const exists = participants.some(p => p.adminId === participant.adminId);
    if (exists) {
      throw new BadRequestException('Participant already added to this meeting');
    }

    participants.push({
      adminId: participant.adminId,
      name: participant.name,
      attended: participant.attended ?? false,
    });

    return this.prisma.meeting.update({
      where: { id },
      data: { participants },
      include: { createdBy: true },
    });
  }

  // Remove participant from meeting
  async removeParticipant(id: string, adminId: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const participants = (meeting.participants as any[]) || [];
    const filtered = participants.filter(p => p.adminId !== adminId);

    return this.prisma.meeting.update({
      where: { id },
      data: { participants: filtered },
      include: { createdBy: true },
    });
  }

  // Update participant attendance
  async updateParticipantAttendance(id: string, adminId: string, attended: boolean) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const participants = (meeting.participants as any[]) || [];
    const updated = participants.map(p =>
      p.adminId === adminId ? { ...p, attended } : p
    );

    return this.prisma.meeting.update({
      where: { id },
      data: { participants: updated },
      include: { createdBy: true },
    });
  }

  // Add action item
  async addActionItem(id: string, actionItem: { task: string; assignedToId?: string; dueDate?: string; completed?: boolean }) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const actionItems = (meeting.actionItems as any[]) || [];
    actionItems.push({
      id: Date.now().toString(), // Simple unique ID
      task: actionItem.task,
      assignedToId: actionItem.assignedToId,
      dueDate: actionItem.dueDate,
      completed: actionItem.completed ?? false,
      createdAt: new Date().toISOString(),
    });

    return this.prisma.meeting.update({
      where: { id },
      data: { actionItems },
      include: { createdBy: true },
    });
  }

  // Update action item completion status
  async updateActionItemStatus(id: string, actionItemId: string, completed: boolean) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const actionItems = (meeting.actionItems as any[]) || [];
    const updated = actionItems.map(item =>
      item.id === actionItemId ? { ...item, completed } : item
    );

    return this.prisma.meeting.update({
      where: { id },
      data: { actionItems: updated },
      include: { createdBy: true },
    });
  }

  // Add key point
  async addKeyPoint(id: string, keyPoint: { title: string; notes?: string; actionItems?: string[] }) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const keyPoints = (meeting.keyPoints as any[]) || [];
    keyPoints.push({
      id: Date.now().toString(),
      title: keyPoint.title,
      notes: keyPoint.notes || '',
      actionItems: keyPoint.actionItems || [],
      createdAt: new Date().toISOString(),
    });

    return this.prisma.meeting.update({
      where: { id },
      data: { keyPoints },
      include: { createdBy: true },
    });
  }

  // Delete meeting
  async remove(id: string, adminId?: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const meetingTitle = meeting.title;

    // Delete attached files
    if (meeting.attachments) {
      for (const file of meeting.attachments as any[]) {
        if (file.fileUrl) deleteFile(file.fileUrl);
      }
    }

    const deleted = await this.prisma.meeting.delete({ where: { id } });

    // Send notification to all admins
    if (adminId) {
      const adminIds = await this.getAllAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/meetings`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'Meeting Deleted',
        message: `${senderName} deleted the meeting: "${meetingTitle}"`,
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return deleted;
  }

  // Get meeting statistics
  async getStats(adminId?: string) {
    const where: any = {};
    if (adminId) {
      where.createdById = adminId;
    }

    const [total, scheduled, ongoing, completed, cancelled] = await Promise.all([
      this.prisma.meeting.count({ where }),
      this.prisma.meeting.count({ where: { ...where, status: 'SCHEDULED' } }),
      this.prisma.meeting.count({ where: { ...where, status: 'ONGOING' } }),
      this.prisma.meeting.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.meeting.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    return {
      total,
      scheduled,
      ongoing,
      completed,
      cancelled,
    };
  }
}
