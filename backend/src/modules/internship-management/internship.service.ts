import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InternshipStatus, InternshipType, InternshipPeriod } from '../../../generated/prisma';
import { NotificationService } from '../notification/notification.service';
import { AdminService } from '../admin-management/admin.service';
import { EmailService } from 'src/global/email/email.service';

@Injectable()
export class InternshipService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private adminService: AdminService,
    private emailService: EmailService,
  ) { }

  // Helper: Generate random password
  private generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Helper: Format internship type for display
  private formatInternshipType(type: InternshipType): string {
    const typeMap: Record<InternshipType, string> = {
      SOFTWARE_DEVELOPMENT: 'Software Development',
      UI_UX: 'UI/UX Design',
      DATA: 'Data & Analytics',
      MARKETING: 'Digital Marketing',
      IT_SUPPORT: 'IT Support',
      OTHER: 'General',
    };
    return typeMap[type] || type;
  }

  // Helper: Get HR admins for notifications
  private async getHrAdminIds(): Promise<string[]> {
    const admins = await this.prisma.admin.findMany({
      where: {
        OR: [
          { isSuperAdmin: true },
          { permissions: { some: { permission: { name: 'internship_management' } } } }
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

  // Create internship application (public - no auth required)
  async create(data: any) {
    try {
      // Parse dates if provided
      const preferredStart = data.preferredStart ? new Date(data.preferredStart) : null;
      const preferredEnd = data.preferredEnd ? new Date(data.preferredEnd) : null;

      // Parse skills if it's a string
      let skills = data.skills;
      if (typeof skills === 'string') {
        skills = JSON.parse(skills);
      }

      const application = await this.prisma.internshipApplication.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          institution: data.institution,
          fieldOfStudy: data.fieldOfStudy,
          level: data.level,
          country: data.country,
          city: data.city,
          internshipType: data.internshipType,
          period: data.period,
          preferredStart,
          preferredEnd,
          coverLetter: data.coverLetter,
          skills,
          cvUrl: data.cvUrl,
          portfolioUrl: data.portfolioUrl,
          githubUrl: data.githubUrl,
          linkedinUrl: data.linkedinUrl,
        },
      });

      // Send notification to HR admins about new application
      const adminIds = await this.getHrAdminIds();

      this.notificationService.createNotification({
        recipients: adminIds.map(id => ({
          id,
          type: 'ADMIN' as const,
          read: false,
          link: `/admin/dashboard/internships`,
        })),
        title: 'New Internship Application',
        message: `${application.fullName} submitted an internship application for ${application.internshipType}`,
      }).catch(err => console.error('Failed to send notification:', err));

      return application;
    } catch (error) {
      throw new BadRequestException('Failed to submit application: ' + error.message);
    }
  }

  // Get all applications with pagination and filters
  async findAll(
    page = 1,
    limit = 10,
    search = '',
    status?: InternshipStatus,
    internshipType?: InternshipType,
    period?: InternshipPeriod,
    isShortlisted?: boolean,
    isContacted?: boolean,
    country?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Search in name, email, institution
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { institution: { contains: search } },
        { fieldOfStudy: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (internshipType) where.internshipType = internshipType;
    if (period) where.period = period;
    if (isShortlisted !== undefined) where.isShortlisted = isShortlisted;
    if (isContacted !== undefined) where.isContacted = isContacted;
    if (country) where.country = country;

    const [data, total] = await Promise.all([
      this.prisma.internshipApplication.findMany({
        where,
        include: { reviewedBy: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.internshipApplication.count({ where }),
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

  // Get shortlisted applications
  async findShortlisted(limit = 10) {
    return this.prisma.internshipApplication.findMany({
      where: { isShortlisted: true },
      include: { reviewedBy: true },
      take: limit,
      orderBy: { score: 'desc' },
    });
  }

  // Get one application by ID
  async findOne(id: string) {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id },
      include: { reviewedBy: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  // Update application
  async update(id: string, data: any) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updateData: any = { ...data };

    // Parse dates if provided
    if (data.preferredStart) {
      updateData.preferredStart = new Date(data.preferredStart);
    }
    if (data.preferredEnd) {
      updateData.preferredEnd = new Date(data.preferredEnd);
    }

    // Parse skills if it's a string
    if (typeof data.skills === 'string') {
      updateData.skills = JSON.parse(data.skills);
    }

    return this.prisma.internshipApplication.update({
      where: { id },
      data: updateData,
      include: { reviewedBy: true },
    });
  }

  // Update application status
  async updateStatus(id: string, status: InternshipStatus, adminId?: string) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updatedApplication = await this.prisma.internshipApplication.update({
      where: { id },
      data: { status },
      include: { reviewedBy: true },
    });

    // If status is ACCEPTED, create admin account and send credentials email
    if (status === 'ACCEPTED') {
      try {
        // Check if admin already exists with this email
        const existingAdmin = await this.adminService.findAdminByEmail(application.email);

        if (!existingAdmin) {
          // Generate random password
          const tempPassword = this.generatePassword();

          // Create admin account for the intern
          await this.adminService.registerAdmin({
            adminName: application.fullName,
            adminEmail: application.email,
            password: tempPassword,
          });
          console.log('sent the email')

          // Send acceptance email with credentials
          const dashboardUrl = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}/auth/admin/login`
            : 'https://abytechhub.com/auth/admin/login';

          await this.emailService.sendEmail(
            application.email,
            'Congratulations! Your Internship Application Has Been Accepted',
            'Internship-acceptance-notification',
            {
              fullName: application.fullName,
              email: application.email,
              password: tempPassword,
              internshipType: this.formatInternshipType(application.internshipType),
              dashboardUrl,
              year: new Date().getFullYear(),
            },
          );
        }
      } catch (error) {
        console.error('Failed to create admin account or send email:', error);
        // Don't throw - the status update was successful, just log the error
      }
    }

    // Send notification to HR admins
    if (adminId) {
      const adminIds = await this.getHrAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/internships`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: status === 'ACCEPTED' ? 'Intern Approved' : (status === 'REJECTED' ? 'Intern Rejected' : 'Application Status Updated'),
        message: status === 'ACCEPTED'
          ? `${senderName} approved ${application.fullName}'s internship application`
          : (status === 'REJECTED'
            ? `${senderName} rejected ${application.fullName}'s internship application`
            : `${senderName} changed ${application.fullName}'s application status to ${status}`),
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return updatedApplication;
  }

  // Review application (by admin)
  async review(id: string, adminId: string, reviewData: { score?: number; reviewNotes?: string; status?: InternshipStatus }) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const reviewedApplication = await this.prisma.internshipApplication.update({
      where: { id },
      data: {
        reviewedById: adminId,
        reviewedAt: new Date(),
        score: reviewData.score,
        reviewNotes: reviewData.reviewNotes,
        status: reviewData.status || 'REVIEWING',
      },
      include: { reviewedBy: true },
    });

    // Send notification to HR admins
    const adminIds = await this.getHrAdminIds();
    const senderName = await this.getAdminName(adminId);

    this.notificationService.createNotification({
      recipients: adminIds.map(aid => ({
        id: aid,
        type: 'ADMIN' as const,
        read: aid === adminId,
        link: `/admin/dashboard/internships`,
      })),
      senderId: adminId,
      senderType: 'ADMIN',
      title: 'Application Reviewed',
      message: `${senderName} reviewed ${application.fullName}'s application${reviewData.score ? ` (Score: ${reviewData.score})` : ''}`,
    }).catch(err => console.error('Failed to send notification:', err));

    return reviewedApplication;
  }

  // Toggle shortlist status
  async toggleShortlist(id: string, adminId?: string) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const newShortlistStatus = !application.isShortlisted;

    const updatedApplication = await this.prisma.internshipApplication.update({
      where: { id },
      data: { isShortlisted: newShortlistStatus },
      include: { reviewedBy: true },
    });

    // Send notification to HR admins
    if (adminId) {
      const adminIds = await this.getHrAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/internships`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: newShortlistStatus ? 'Applicant Shortlisted' : 'Applicant Removed from Shortlist',
        message: `${senderName} ${newShortlistStatus ? 'shortlisted' : 'removed from shortlist'} ${application.fullName}'s application`,
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return updatedApplication;
  }

  // Mark as contacted
  async markAsContacted(id: string) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.internshipApplication.update({
      where: { id },
      data: { isContacted: true },
      include: { reviewedBy: true },
    });
  }

  // Bulk update status
  async bulkUpdateStatus(ids: string[], status: InternshipStatus) {
    return this.prisma.internshipApplication.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  // Delete application
  async remove(id: string, adminId?: string) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const applicantName = application.fullName;

    const deleted = await this.prisma.internshipApplication.delete({ where: { id } });

    // Send notification to HR admins
    if (adminId) {
      const adminIds = await this.getHrAdminIds();
      const senderName = await this.getAdminName(adminId);

      this.notificationService.createNotification({
        recipients: adminIds.map(aid => ({
          id: aid,
          type: 'ADMIN' as const,
          read: aid === adminId,
          link: `/admin/dashboard/internships`,
        })),
        senderId: adminId,
        senderType: 'ADMIN',
        title: 'Application Deleted',
        message: `${senderName} deleted ${applicantName}'s internship application`,
      }).catch(err => console.error('Failed to send notification:', err));
    }

    return deleted;
  }

  // Get application statistics
  async getStats() {
    const [total, pending, reviewing, accepted, rejected, waitlisted, shortlisted] = await Promise.all([
      this.prisma.internshipApplication.count(),
      this.prisma.internshipApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.internshipApplication.count({ where: { status: 'REVIEWING' } }),
      this.prisma.internshipApplication.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.internshipApplication.count({ where: { status: 'REJECTED' } }),
      this.prisma.internshipApplication.count({ where: { status: 'WAITLISTED' } }),
      this.prisma.internshipApplication.count({ where: { isShortlisted: true } }),
    ]);

    // Get counts by internship type
    const byType = await this.prisma.internshipApplication.groupBy({
      by: ['internshipType'],
      _count: { id: true },
    });

    // Get counts by period
    const byPeriod = await this.prisma.internshipApplication.groupBy({
      by: ['period'],
      _count: { id: true },
    });

    return {
      total,
      pending,
      reviewing,
      accepted,
      rejected,
      waitlisted,
      shortlisted,
      byType: byType.reduce((acc, item) => {
        acc[item.internshipType] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byPeriod: byPeriod.reduce((acc, item) => {
        if (item.period) {
          acc[item.period] = item._count.id;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
