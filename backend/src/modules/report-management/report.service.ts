import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { deleteFile } from 'src/common/utils/file-upload.utils';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportGateway } from './report.gateway';
import { NotificationService } from '../notification/notification.service';
import { PermissionService, PERMISSIONS } from '../permission-management/permission.service';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
    private readonly reportGateway: ReportGateway,
    private readonly permissionService: PermissionService,
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

  // ✅ Fetch all reports (permission-based filtering)
  async findAll(
    adminId: string,
    page = 1,
    limit = 10,
    search = '',
    filter?: string,
    from?: string,
    to?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Check if admin has report_management permission
      const hasReportPermission = await this.permissionService.hasPermission(
        adminId,
        PERMISSIONS.REPORT_MANAGEMENT,
      );

      const where: any = {};
      const andConditions: any[] = [];

      // base search filter
      if (search) {
        andConditions.push({
          OR: [
            { title: { contains: search } },
            { admin: { is: { adminName: { contains: search } } } },
          ],
        });
      }

      if (!hasReportPermission) {
        // Admins without report_management permission only ever see their own reports
        where.adminId = adminId;
      } else {
        // Otherwise, hide reports scheduled for the future from everyone but their owner
        andConditions.push({
          OR: [{ createdAt: { lte: new Date() } }, { adminId }],
        });
      }

      if (andConditions.length) {
        where.AND = andConditions;
      }

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
          include: { admin: true, replies: true },
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
        hasReportPermission, // Let frontend know if admin can see all reports
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

      // Reports scheduled for the future are only accessible to their owner
      if (report.createdAt > new Date() && report.adminId !== adminId) {
        throw new ForbiddenException('This report is not yet available');
      }

      const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
      if (!admin) throw new BadRequestException('Admin not found');



      // Create the reply, snapshotting the replier's current name so
      // displaying it later never needs to join/fetch the Admin.
      const reply = await this.prisma.replyReport.create({
        data: {
          content,
          replyName: admin.adminName,
          report: { connect: { id: reportId } },
          admin: { connect: { id: adminId } },
        },
        include: {
          admin: true,
          report: true,
        },
      });


      // Creates the in-app notification-center entry, pushes to every device the
      // report owner is subscribed on, and emits it over the socket in real time.
      await this.notificationService.createNotification({
        recipients: [{
          id: report.adminId,
          type: 'ADMIN',
          read: false,
          link: `/admin/dashboard/report/view/${reportId}`,
        }],
        senderId: adminId,
        senderType: 'ADMIN',
        title: `${admin.adminName} just replied to your report`,
        message: content,
      });

      // Never broadcast the report's own title/content over the (unscoped) socket
      // channel, so a still-scheduled report can't leak to other admins via a reply.
      const { report: _omittedReport, ...broadcastReply } = reply;
      this.reportGateway.emitReplyCreated(broadcastReply)

      return reply;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new BadRequestException('Failed to reply to report: ' + error.message);
    }
  }



  // ✅ Fetch one report by ID
  async findOne(id: string, adminId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { admin: true, replies: true },
    });
    if (!report) throw new BadRequestException('Report not found');

    // Reports scheduled for the future are only visible to their owner
    if (report.createdAt > new Date() && report.adminId !== adminId) {
      throw new ForbiddenException('This report is not yet available');
    }

    return report;
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
