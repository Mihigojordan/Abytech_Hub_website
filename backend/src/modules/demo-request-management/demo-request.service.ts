import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DemoRequestStatus, DemoType } from '../../../generated/prisma';

@Injectable()
export class DemoRequestService {
  constructor(private prisma: PrismaService) {}

  // Create demo request (public - no auth required)
  async create(data: any) {
    try {
      const preferredDate = data.preferredDate ? new Date(data.preferredDate) : null;

      return await this.prisma.demoRequest.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          message: data.message,
          product: data.product,
          demoType: data.demoType,
          preferredDate,
          preferredTime: data.preferredTime,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to submit demo request: ' + error.message);
    }
  }

  // Get all demo requests with pagination and filters
  async findAll(
    page = 1,
    limit = 10,
    search = '',
    status?: DemoRequestStatus,
    demoType?: DemoType,
    assignedToId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
        { product: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (demoType) where.demoType = demoType;
    if (assignedToId) where.assignedToId = assignedToId;

    const [data, total] = await Promise.all([
      this.prisma.demoRequest.findMany({
        where,
        include: { assignedTo: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demoRequest.count({ where }),
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

  // Get pending requests
  async findPending(limit = 10) {
    return this.prisma.demoRequest.findMany({
      where: { status: 'PENDING' },
      include: { assignedTo: true },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Get scheduled demos
  async findScheduled(limit = 10) {
    return this.prisma.demoRequest.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      include: { assignedTo: true },
      take: limit,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // Get one demo request by ID
  async findOne(id: string) {
    const request = await this.prisma.demoRequest.findUnique({
      where: { id },
      include: { assignedTo: true },
    });

    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return request;
  }

  // Update demo request
  async update(id: string, data: any) {
    const request = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    const updateData: any = { ...data };

    if (data.preferredDate) {
      updateData.preferredDate = new Date(data.preferredDate);
    }
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    return this.prisma.demoRequest.update({
      where: { id },
      data: updateData,
      include: { assignedTo: true },
    });
  }

  // Update status
  async updateStatus(id: string, status: DemoRequestStatus) {
    const request = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return this.prisma.demoRequest.update({
      where: { id },
      data: { status },
      include: { assignedTo: true },
    });
  }

  // Assign to admin
  async assign(id: string, adminId: string) {
    const request = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return this.prisma.demoRequest.update({
      where: { id },
      data: {
        assignedToId: adminId,
        status: 'CONTACTED',
      },
      include: { assignedTo: true },
    });
  }

  // Schedule demo
  async schedule(id: string, scheduledAt: string, meetingLink?: string) {
    const request = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return this.prisma.demoRequest.update({
      where: { id },
      data: {
        scheduledAt: new Date(scheduledAt),
        meetingLink,
        status: 'SCHEDULED',
      },
      include: { assignedTo: true },
    });
  }

  // Mark as completed
  async complete(id: string, internalNotes?: string) {
    const request = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return this.prisma.demoRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        internalNotes,
      },
      include: { assignedTo: true },
    });
  }

  // Cancel demo request
  async cancel(id: string, internalNotes?: string) {
    const request = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return this.prisma.demoRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        internalNotes,
      },
      include: { assignedTo: true },
    });
  }

  // Delete demo request
  async remove(id: string) {
    const request = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return this.prisma.demoRequest.delete({ where: { id } });
  }

  // Get statistics
  async getStats() {
    const [total, pending, contacted, scheduled, completed, cancelled] = await Promise.all([
      this.prisma.demoRequest.count(),
      this.prisma.demoRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.demoRequest.count({ where: { status: 'CONTACTED' } }),
      this.prisma.demoRequest.count({ where: { status: 'SCHEDULED' } }),
      this.prisma.demoRequest.count({ where: { status: 'COMPLETED' } }),
      this.prisma.demoRequest.count({ where: { status: 'CANCELLED' } }),
    ]);

    const byType = await this.prisma.demoRequest.groupBy({
      by: ['demoType'],
      _count: { id: true },
    });

    return {
      total,
      pending,
      contacted,
      scheduled,
      completed,
      cancelled,
      byType: byType.reduce((acc, item) => {
        acc[item.demoType] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
