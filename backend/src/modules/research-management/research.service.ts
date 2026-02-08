import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { deleteFile } from 'src/common/utils/file-upload.utils';

@Injectable()
export class ResearchService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ✅ Create research
  async create(data: any, adminId: string) {
    try {
      return await this.prisma.research.create({
        data: {
          ...data,
          owner: { connect: { id: adminId } },
          createdAt: new Date(),
        },
      });
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
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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
  async update(id: string, data: any) {
    const research = await this.prisma.research.findUnique({ where: { id } });
    if (!research) throw new BadRequestException('Research not found');

    // If new attachments, delete old ones from storage
    if (data.attachments && research.attachments) {
      for (const oldFile of research.attachments as any) {
        if (oldFile.url) deleteFile(oldFile.url);
      }
    }

    return this.prisma.research.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  // ✅ Delete research
  async remove(id: string) {
    const research = await this.prisma.research.findUnique({ where: { id } });
    if (!research) throw new BadRequestException('Research not found');

    // Delete attached files
    if (research.attachments) {
      for (const file of research.attachments as any) {
        if (file.url) deleteFile(file.url);
      }
    }

    return this.prisma.research.delete({ where: { id } });
  }
}
