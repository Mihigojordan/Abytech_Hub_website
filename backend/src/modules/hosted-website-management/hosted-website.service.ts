import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebsiteStatus } from '../../../generated/prisma';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class HostedWebsiteService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

  // Helper: Get all admins for notifications
  private async getAllAdminIds(): Promise<string[]> {
    const admins = await this.prisma.admin.findMany({ select: { id: true } });
    return admins.map(a => a.id);
  }

  // Create hosted website
  async create(data: any) {
    try {
      // Check if domain already exists
      const existing = await this.prisma.hostedWebsite.findUnique({
        where: { domain: data.domain },
      });

      if (existing) {
        throw new ConflictException('Domain already registered');
      }

      const website = await this.prisma.hostedWebsite.create({
        data: {
          name: data.name,
          domain: data.domain,
          description: data.description,
          status: data.status || 'ACTIVE',
        },
      });

      try {
        const adminIds = await this.getAllAdminIds();

        await this.notificationService.createNotification({
          recipients: adminIds.map(aid => ({
            id: aid,
            type: 'ADMIN' as const,
            read: false,
            link: `/admin/dashboard/websites/hosted`,
          })),
          title: 'New Hosted Website Added',
          message: `The website "${website.name}" (${website.domain}) has been added`,
        });
      } catch (e) {
        console.error('Failed to send notification:', e.message);
      }

      return website;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new BadRequestException('Failed to create website: ' + error.message);
    }
  }

  // Get all websites with pagination and filters
  async findAll(
    page = 1,
    limit = 10,
    search = '',
    status?: WebsiteStatus,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Search in name, domain, description
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { domain: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.hostedWebsite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hostedWebsite.count({ where }),
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

  // Get active websites
  async findActive() {
    return this.prisma.hostedWebsite.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  // Get one website by ID
  async findOne(id: string) {
    const website = await this.prisma.hostedWebsite.findUnique({
      where: { id },
    });

    if (!website) {
      throw new NotFoundException('Website not found');
    }

    return website;
  }

  // Get website by domain
  async findByDomain(domain: string) {
    const website = await this.prisma.hostedWebsite.findUnique({
      where: { domain },
    });

    if (!website) {
      throw new NotFoundException('Website not found');
    }

    return website;
  }

  // Update website
  async update(id: string, data: any) {
    const website = await this.prisma.hostedWebsite.findUnique({ where: { id } });
    if (!website) {
      throw new NotFoundException('Website not found');
    }

    // If changing domain, check it doesn't already exist
    if (data.domain && data.domain !== website.domain) {
      const existing = await this.prisma.hostedWebsite.findUnique({
        where: { domain: data.domain },
      });

      if (existing) {
        throw new ConflictException('Domain already registered');
      }
    }

    const updated = await this.prisma.hostedWebsite.update({
      where: { id },
      data: {
        name: data.name,
        domain: data.domain,
        description: data.description,
        status: data.status,
      },
    });

    try {
      const adminIds = await this.getAllAdminIds();

      await this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: false,
          link: `/admin/dashboard/websites/hosted`,
        })),
        title: 'Hosted Website Updated',
        message: `The website "${updated.name}" has been updated`,
      });
    } catch (e) {
      console.error('Failed to send notification:', e.message);
    }

    return updated;
  }

  // Update website status
  async updateStatus(id: string, status: WebsiteStatus) {
    const website = await this.prisma.hostedWebsite.findUnique({ where: { id } });
    if (!website) {
      throw new NotFoundException('Website not found');
    }

    const updated = await this.prisma.hostedWebsite.update({
      where: { id },
      data: { status },
    });

    try {
      const adminIds = await this.getAllAdminIds();

      await this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: false,
          link: `/admin/dashboard/websites/hosted`,
        })),
        title: 'Website Status Changed',
        message: `The website "${updated.name}" status changed to ${status}`,
      });
    } catch (e) {
      console.error('Failed to send notification:', e.message);
    }

    return updated;
  }

  // Suspend website
  async suspend(id: string) {
    return this.updateStatus(id, 'SUSPENDED');
  }

  // Activate website
  async activate(id: string) {
    return this.updateStatus(id, 'ACTIVE');
  }

  // Mark as expired
  async expire(id: string) {
    return this.updateStatus(id, 'EXPIRED');
  }

  // Delete website
  async remove(id: string) {
    const website = await this.prisma.hostedWebsite.findUnique({ where: { id } });
    if (!website) {
      throw new NotFoundException('Website not found');
    }

    const deleted = await this.prisma.hostedWebsite.delete({ where: { id } });

    try {
      const adminIds = await this.getAllAdminIds();

      await this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: false,
          link: `/admin/dashboard/websites/hosted`,
        })),
        title: 'Hosted Website Deleted',
        message: `The website "${deleted.name}" has been deleted`,
      });
    } catch (e) {
      console.error('Failed to send notification:', e.message);
    }

    return deleted;
  }

  // Get website statistics
  async getStats() {
    const [total, active, suspended, expired] = await Promise.all([
      this.prisma.hostedWebsite.count(),
      this.prisma.hostedWebsite.count({ where: { status: 'ACTIVE' } }),
      this.prisma.hostedWebsite.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.hostedWebsite.count({ where: { status: 'EXPIRED' } }),
    ]);

    return {
      total,
      active,
      suspended,
      expired,
    };
  }

  // Check domain availability
  async checkDomainAvailability(domain: string) {
    const existing = await this.prisma.hostedWebsite.findUnique({
      where: { domain },
    });

    return {
      domain,
      available: !existing,
    };
  }
}
