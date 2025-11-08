import { Injectable, BadRequestException } from '@nestjs/common';
import { deleteFile } from 'src/common/utils/file-upload.utils';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,

  ) { }

  // ✅ Create report with adminId
async create(data: any, adminId: string) {
  try {
    let cloudinaryResult: any = null;

    // Upload file to Cloudinary if present
    if (data.reportUrl) {
      cloudinaryResult = await this.cloudinaryService.uploadImage(data.reportUrl);
      data.reportUrl = cloudinaryResult.secure_url;
      data.publicId = cloudinaryResult.public_id;
    }

    return await this.prisma.report.create({
      data: {
        ...data,
        admin: { connect: { id: adminId } },
        createdAt: data.createdAt || new Date(),
      },
    });
  } catch (error) {
    throw new BadRequestException('Failed to create report: ' + error.message);
  }
}

  // ✅ Fetch all reports
async findAll(
  page = 1,
  limit = 10,
  search = '',
  filter?: string,
  from?: string,
  to?: string,
) {
  try {
    const skip = (page - 1) * limit;

    // base search filter
    const where: any = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              admin: {
                is: {
                  adminName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        }
      : {};

    // apply time filters if provided
    if (filter) {
      const now = new Date();
      let startDate: Date | undefined;
      let endDate: Date | undefined = now;

      switch (filter.toLowerCase()) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;

        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay()); // start of week (Sunday)
          startDate.setHours(0, 0, 0, 0);
          break;

        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;

        case 'custom':
          if (from && to) {
            startDate = new Date(from);
            endDate = new Date(to);
          }
          break;

        default:
          break;
      }

      if (startDate) {
        where.createdAt = { gte: startDate };
      }
      if (endDate) {
        where.createdAt = { ...(where.createdAt || {}), lte: endDate };
      }
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: { admin: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filter: filter || 'all',
    };
  } catch (error) {
    throw new BadRequestException('Failed to fetch reports: ' + error.message);
  }
}

// ✅ Create a reply for a report
async replyToReport(reportId: string, adminId: string, content: string) {
  try {
    // Check if report exists
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new BadRequestException('Report not found');

    // Create the reply
    const reply = await this.prisma.replyReport.create({
      data: {
        content,
        report: { connect: { id: reportId } },
        admin: { connect: { id: adminId } },
      },
      include: {
        admin: true,
        report: true,
      },
    });

    return reply;
  } catch (error) {
    throw new BadRequestException('Failed to reply to report: ' + error.message);
  }
}



  // ✅ Fetch one report by ID
  async findOne(id: string) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id },
        include: { admin: true },
      });
      if (!report) throw new BadRequestException('Report not found');
      return report;
    } catch (error) {
      throw new BadRequestException('Failed to fetch report: ' + error.message);
    }
  }

  // ✅ Update report
async update(id: string, data: any) {
  try {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new BadRequestException('Report not found');

    let cloudinaryResult: any = null;

    // If there is a new report file or URL, upload it to Cloudinary
    if (data.reportUrl) {
      cloudinaryResult = await this.cloudinaryService.uploadImage(data.reportUrl);
      data.reportUrl = cloudinaryResult.secure_url;
      data.publicId = cloudinaryResult.public_id;
    }

    // Update report in DB
    const updatedData = await this.prisma.report.update({
      where: { id },
      data: {
        ...data,
        createdAt: data.createdAt || new Date(),
      },
    });

    // Clean up old file if new one uploaded
    if (cloudinaryResult && report.reportUrl) {
      if (report.publicId) {
        await this.cloudinaryService.deleteImage(report.publicId);
      } else {
        deleteFile(report.reportUrl); // local file fallback
      }
    }

    return updatedData;
  } catch (error) {
    throw new BadRequestException('Failed to update report: ' + error.message);
  }
}

  // ✅ Delete report
  async remove(id: string) {
    try {
      return await this.prisma.report.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete report: ' + error.message);
    }
  }
}
