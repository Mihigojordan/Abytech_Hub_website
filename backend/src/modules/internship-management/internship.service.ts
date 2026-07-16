import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EmployeeType,
  InternshipStatus,
  InternshipType,
  InternshipPeriod,
  InternshipEmploymentStatus,
  UserRole,
} from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { AdminService } from '../admin-management/admin.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InternshipService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private adminService: AdminService,
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

  private addInternshipPeriod(startDate: Date, period?: InternshipPeriod | null): Date | null {
    if (!period) {
      return null;
    }

    const endDate = new Date(startDate);

    switch (period) {
      case 'ONE_MONTH':
        endDate.setMonth(endDate.getMonth() + 1);
        return endDate;
      case 'THREE_MONTHS':
        endDate.setMonth(endDate.getMonth() + 3);
        return endDate;
      case 'SIX_MONTHS':
        endDate.setMonth(endDate.getMonth() + 6);
        return endDate;
      case 'ONE_YEAR':
        endDate.setFullYear(endDate.getFullYear() + 1);
        return endDate;
      default:
        return null;
    }
  }

  private humanizeRemainingTime(fromDate: Date, toDate: Date): string {
    const daysRemaining = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000);
    const wholeMonths =
      (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
      (toDate.getMonth() - fromDate.getMonth()) -
      (toDate.getDate() < fromDate.getDate() ? 1 : 0);

    if (wholeMonths > 0) {
      const monthAlignedDate = new Date(fromDate);
      monthAlignedDate.setMonth(monthAlignedDate.getMonth() + wholeMonths);

      if (monthAlignedDate.getTime() === toDate.getTime()) {
        return `${wholeMonths} month${wholeMonths === 1 ? '' : 's'}`;
      }
    }

    if (daysRemaining >= 14 && daysRemaining % 7 === 0) {
      const weeks = daysRemaining / 7;
      return `${weeks} week${weeks === 1 ? '' : 's'}`;
    }

    return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
  }

  private resolveInternshipStartDate(application: {
    internshipStartDate?: Date | null;
    preferredStart?: Date | null;
    reviewedAt?: Date | null;
    updatedAt?: Date | null;
    createdAt?: Date | null;
  }): Date | null {
    if (application.internshipStartDate) {
      return new Date(application.internshipStartDate);
    }

    const acceptedAt = application.reviewedAt ?? application.updatedAt ?? application.createdAt ?? null;

    if (application.preferredStart && acceptedAt) {
      return application.preferredStart > acceptedAt
        ? new Date(application.preferredStart)
        : new Date(acceptedAt);
    }

    return application.preferredStart
      ? new Date(application.preferredStart)
      : acceptedAt
        ? new Date(acceptedAt)
        : null;
  }

  private resolveInternshipEndDate(
    application: {
      preferredEnd?: Date | null;
      period?: InternshipPeriod | null;
    },
    startDate: Date | null,
  ): Date | null {
    if (application.preferredEnd) {
      return new Date(application.preferredEnd);
    }

    return startDate ? this.addInternshipPeriod(startDate, application.period) : null;
  }

  private buildInternshipTimeline(application: {
    period?: InternshipPeriod | null;
    internshipStartDate?: Date | null;
    preferredStart?: Date | null;
    preferredEnd?: Date | null;
    reviewedAt?: Date | null;
    updatedAt?: Date | null;
    createdAt?: Date | null;
  }) {
    const startDate = this.resolveInternshipStartDate(application);
    const endDate = this.resolveInternshipEndDate(application, startDate);

    if (!startDate || !endDate) {
      return {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        state: 'UNKNOWN' as const,
        remainingLabel: '—',
        daysRemaining: null,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (today < start) {
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        state: 'NOT_STARTED' as const,
        remainingLabel: 'Not started',
        daysRemaining: Math.ceil((end.getTime() - start.getTime()) / 86400000),
      };
    }

    if (today >= end) {
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        state: 'COMPLETED' as const,
        remainingLabel: 'Completed',
        daysRemaining: 0,
      };
    }

    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / 86400000);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      state: 'ACTIVE' as const,
      remainingLabel: this.humanizeRemainingTime(today, end),
      daysRemaining,
    };
  }

  private decorateWithEmploymentStatus<T extends {
    employmentStatus?: InternshipEmploymentStatus | null;
    period?: InternshipPeriod | null;
    internshipStartDate?: Date | null;
    preferredStart?: Date | null;
    preferredEnd?: Date | null;
    reviewedAt?: Date | null;
    updatedAt?: Date | null;
    createdAt?: Date | null;
  }>(
    applications: T[],
  ): Array<T & {
    hasEmployeeAccount: boolean;
    employmentStatus: InternshipEmploymentStatus | null;
    internshipTimeline: {
      startDate: string | null;
      endDate: string | null;
      state: 'UNKNOWN' | 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED';
      remainingLabel: string;
      daysRemaining: number | null;
    };
  }> {
    if (applications.length === 0) {
      return [];
    }

    return applications.map((application) => ({
      ...application,
      hasEmployeeAccount:
        application.employmentStatus === 'FULL_TIME_EMPLOYEE' ||
        application.employmentStatus === 'PART_TIME_EMPLOYEE',
      employmentStatus: application.employmentStatus ?? null,
      internshipTimeline: this.buildInternshipTimeline(application),
    }));
  }

  private async createEmployeeAccountForApplication(
    application: any,
    employeeType: EmployeeType,
  ) {
    const existingAdmin = await this.adminService.findAdminByEmail(application.email);
    if (existingAdmin) {
      throw new BadRequestException('This email already belongs to an admin account');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: application.email },
      select: { id: true, role: true, employeeType: true },
    });

    if (existingUser) {
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: application.fullName,
          phone: application.phone || null,
          role: 'EMPLOYEE' as UserRole,
          employeeType,
          status: 'ACTIVE',
          initial: application.fullName
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 5),
        },
        select: { id: true },
      });

      return { created: false, userId: updatedUser.id };
    }

    const tempPassword = this.generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        name: application.fullName,
        email: application.email,
        password: hashedPassword,
        phone: application.phone || null,
        status: 'ACTIVE',
        role: 'EMPLOYEE',
        employeeType,
        initial: application.fullName
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 5),
      },
      select: { id: true },
    });

    return { created: true, userId: createdUser.id, tempPassword };
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
    employmentStatus?: InternshipEmploymentStatus,
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
    if (employmentStatus) where.employmentStatus = employmentStatus;
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

    const decoratedData = this.decorateWithEmploymentStatus(data);

    return {
      data: decoratedData,
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
    const data = await this.prisma.internshipApplication.findMany({
      where: { isShortlisted: true },
      include: { reviewedBy: true },
      take: limit,
      orderBy: { score: 'desc' },
    });

    return this.decorateWithEmploymentStatus(data);
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

    const [decoratedApplication] = this.decorateWithEmploymentStatus([application]);
    return decoratedApplication;
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

    const now = new Date();
    const acceptedStartDate =
      application.preferredStart && application.preferredStart > now
        ? application.preferredStart
        : now;

    const employmentStatusUpdate =
      status === 'ACCEPTED'
        ? {
            employmentStatus:
              application.employmentStatus === 'FULL_TIME_EMPLOYEE'
                ? 'FULL_TIME_EMPLOYEE' as InternshipEmploymentStatus
                : application.employmentStatus === 'PART_TIME_EMPLOYEE'
                  ? 'PART_TIME_EMPLOYEE' as InternshipEmploymentStatus
                : 'INTERN' as InternshipEmploymentStatus,
            internshipStartDate: application.internshipStartDate ?? acceptedStartDate,
          }
        : { employmentStatus: null, internshipStartDate: null };

    const updatedApplication = await this.prisma.internshipApplication.update({
      where: { id },
      data: {
        status,
        ...employmentStatusUpdate,
      },
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

  async convertAcceptedInternToEmployee(
    id: string,
    actorAdminId: string,
    employeeType: EmployeeType = 'FULL_TIME',
  ) {
    const actor = await this.prisma.admin.findUnique({
      where: { id: actorAdminId },
      select: { id: true, isSuperAdmin: true, adminName: true },
    });

    if (!actor) {
      throw new NotFoundException('Admin not found');
    }

    if (!actor.isSuperAdmin) {
      throw new ForbiddenException('Only super-admin can convert an admitted intern into an employee');
    }

    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'ACCEPTED') {
      throw new BadRequestException('Only admitted interns can be converted to employees');
    }

    const targetEmploymentStatus =
      employeeType === 'PART_TIME' ? 'PART_TIME_EMPLOYEE' : 'FULL_TIME_EMPLOYEE';

    if (application.employmentStatus === targetEmploymentStatus) {
      return {
        message:
          employeeType === 'PART_TIME'
            ? 'Intern is already a part-time employee'
            : 'Intern is already a full-time employee',
        userId: null,
        created: false,
        employeeType,
        employmentStatus: targetEmploymentStatus as InternshipEmploymentStatus,
      };
    }

    try {
      const result = await this.createEmployeeAccountForApplication(application, employeeType);
      await this.prisma.internshipApplication.update({
        where: { id },
        data: { employmentStatus: targetEmploymentStatus },
      });

      return {
        message: result.created
          ? `Intern converted to ${employeeType === 'PART_TIME' ? 'part-time' : 'full-time'} employee successfully`
          : `Intern employee profile updated as ${employeeType === 'PART_TIME' ? 'part-time' : 'full-time'}`,
        userId: result.userId,
        created: result.created,
        employeeType,
        employmentStatus: targetEmploymentStatus as InternshipEmploymentStatus,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(error.message || 'Failed to convert intern to employee');
    }
  }

  // Review application (by admin)
  async review(id: string, adminId: string, reviewData: { score?: number; reviewNotes?: string; status?: InternshipStatus }) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const nextStatus = reviewData.status || 'REVIEWING';
    const now = new Date();
    const acceptedStartDate =
      application.preferredStart && application.preferredStart > now
        ? application.preferredStart
        : now;

    const employmentStatusUpdate =
      nextStatus === 'ACCEPTED'
        ? {
            employmentStatus:
              application.employmentStatus === 'FULL_TIME_EMPLOYEE'
                ? 'FULL_TIME_EMPLOYEE' as InternshipEmploymentStatus
                : application.employmentStatus === 'PART_TIME_EMPLOYEE'
                  ? 'PART_TIME_EMPLOYEE' as InternshipEmploymentStatus
                  : 'INTERN' as InternshipEmploymentStatus,
            internshipStartDate: application.internshipStartDate ?? acceptedStartDate,
          }
        : {
            employmentStatus: null,
            internshipStartDate: null,
          };

    const reviewedApplication = await this.prisma.internshipApplication.update({
      where: { id },
      data: {
        reviewedById: adminId,
        reviewedAt: new Date(),
        score: reviewData.score,
        reviewNotes: reviewData.reviewNotes,
        status: nextStatus,
        ...employmentStatusUpdate,
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
