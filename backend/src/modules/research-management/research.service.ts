import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { deleteFile } from 'src/common/utils/file-upload.utils';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ResearchService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private notificationService: NotificationService,
  ) { }

  // Helper: Get research admins for notifications
  private async getResearchAdminIds(): Promise<string[]> {
    const admins = await this.prisma.admin.findMany({
      where: {
        OR: [
          { isSuperAdmin: true },
          { permissions: { some: { permission: { name: 'research_management' } } } }
        ]
      },
      select: { id: true },
    });
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

  // ✅ Create research
  async create(data: any, adminId: string) {
    try {
      const research = await this.prisma.research.create({
        data: {
          ...data,
          owner: { connect: { id: adminId } },
          createdAt: new Date(),
        },
      });

      // Send notification to all admins
      const adminIds = await this.getResearchAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(id => ({
          id,
          type: 'ADMIN' as const,
          read: id === adminId,
          link: `/admin/dashboard/research/view/${research.id}`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'New Research Created',
        message: `${senderName} created a new research: "${research.title}"`,
      }).catch(err => console.error('Failed to send notification:', err));

      return research;
    } catch (error) {
      throw new BadRequestException('Failed to create research: ' + error.message);
    }
  }

  // ✅ Get all researches
  async findAll(page = 1, limit = 10, search = '', status?: string, type?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.research.findMany({
        where,
        include: { owner: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.research.count({ where }),
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

  // ✅ Get one research
  async findOne(id: string) {
    const research = await this.prisma.research.findUnique({
      where: { id },
      include: { owner: true },
    });
    if (!research) throw new BadRequestException('Research not found');
    return research;
  }

  // ✅ Update research
  async update(id: string, data: any, adminId?: string) {
    const research = await this.prisma.research.findUnique({ where: { id } });
    if (!research) throw new BadRequestException('Research not found');

    // If new attachments, delete old ones from storage
    if (data.attachments && research.attachments) {
      for (const oldFile of research.attachments as any) {
        if (oldFile.url) deleteFile(oldFile.url);
      }
    }

    const updatedResearch = await this.prisma.research.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });

    // Send notification to all admins
    if (adminId) {
      const adminIds = await this.getResearchAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/research/view/${id}`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'Research Updated',
        message: `${senderName} updated the research: "${updatedResearch.title}"`,
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return updatedResearch;
  }

  // ✅ Delete research
  async remove(id: string, adminId?: string) {
    const research = await this.prisma.research.findUnique({ where: { id } });
    if (!research) throw new BadRequestException('Research not found');

    const researchTitle = research.title;

    // Delete attached files
    if (research.attachments) {
      for (const file of research.attachments as any) {
        if (file.url) deleteFile(file.url);
      }
    }

    const deleted = await this.prisma.research.delete({ where: { id } });

    // Send notification to all admins
    if (adminId) {
      const adminIds = await this.getResearchAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/research`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'Research Deleted',
        message: `${senderName} deleted the research: "${researchTitle}"`,
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return deleted;
  }
}
