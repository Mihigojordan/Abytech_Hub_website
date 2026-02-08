import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InternshipStatus, InternshipType, InternshipPeriod } from '../../../generated/prisma';

@Injectable()
export class InternshipService {
  constructor(private prisma: PrismaService) {}

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

      return await this.prisma.internshipApplication.create({
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
  async updateStatus(id: string, status: InternshipStatus) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.internshipApplication.update({
      where: { id },
      data: { status },
      include: { reviewedBy: true },
    });
  }

  // Review application (by admin)
  async review(id: string, adminId: string, reviewData: { score?: number; reviewNotes?: string; status?: InternshipStatus }) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.internshipApplication.update({
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
  }

  // Toggle shortlist status
  async toggleShortlist(id: string) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.internshipApplication.update({
      where: { id },
      data: { isShortlisted: !application.isShortlisted },
      include: { reviewedBy: true },
    });
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
  async remove(id: string) {
    const application = await this.prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.internshipApplication.delete({ where: { id } });
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
