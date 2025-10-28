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
  async findAll() {
    try {
      return await this.prisma.report.findMany({
        include: { admin: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch reports: ' + error.message);
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
