import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { deleteFile } from 'src/common/utils/file-upload.utils';
import { MeetingStatus } from '../../../generated/prisma';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  // Create meeting
  async create(data: any, adminId: string) {
    try {
      // Parse dates
      const startTime = new Date(data.startTime);
      const endTime = data.endTime ? new Date(data.endTime) : null;
      console.log(data);
      

      // Validate dates
      if (endTime && endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }

      return await this.prisma.meeting.create({
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
  async update(id: string, data: any) {
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

    return this.prisma.meeting.update({
      where: { id },
      data: updateData,
      include: { createdBy: true },
    });
  }

  // Update meeting status
  async updateStatus(id: string, status: MeetingStatus) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return this.prisma.meeting.update({
      where: { id },
      data: { status },
      include: { createdBy: true },
    });
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
  async remove(id: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Delete attached files
    if (meeting.attachments) {
      for (const file of meeting.attachments as any[]) {
        if (file.fileUrl) deleteFile(file.fileUrl);
      }
    }

    return this.prisma.meeting.delete({ where: { id } });
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
