import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SalaryService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
    ) { }

    // Helper: Get salary admins for notifications
    private async getSalaryAdminIds(): Promise<string[]> {
        const admins = await this.prisma.admin.findMany({
            where: {
                OR: [
                    { isSuperAdmin: true },
                    { permissions: { some: { permission: { name: 'salary_management' } } } }
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

    // ─── Employee submits salary request ───────────────────
    // Note: Bonus and deduction are set to 0 on creation - only the boss can set them when approving
    async create(data: any, adminId: string) {
        try {
            const { amount, month, year, reason } = data;

            if (!amount || !month || !year) {
                throw new BadRequestException('Amount, month, and year are required');
            }

            // Force bonus and deduction to 0 - only boss can set these when approving
            const bonus = 0;
            const deduction = 0;
            const netAmount = amount + bonus - deduction;

            const salary = await this.prisma.salary.create({
                data: {
                    month,
                    year,
                    amount,
                    bonus,
                    deduction,
                    netAmount,
                    reason,
                    admin: { connect: { id: adminId } },
                },
                include: { admin: { select: { id: true, adminName: true, adminEmail: true } } },
            });

            // Notify all admins about new salary request
            try {
                const adminIds = await this.getSalaryAdminIds();
                const senderName = await this.getAdminName(adminId);

                await this.notificationService.createNotification({
                    recipients: adminIds.map(id => ({
                        id,
                        type: 'ADMIN' as const,
                        read: id === adminId,
                        link: `/admin/dashboard/finance/salaries`,
                    })),
                    senderId: adminId,
                    senderType: 'ADMIN',
                    title: 'New Salary Request',
                    message: `${senderName} has requested salary for ${this.getMonthName(month)} ${year}`,
                });
            } catch (e) {
                console.error('Push notification error:', e.message);
            }

            return { message: 'Salary request submitted successfully', salary };
        } catch (error) {
            if (error.code === 'P2002') {
                throw new BadRequestException('A salary request already exists for this month');
            }
            throw new BadRequestException(error.message);
        }
    }

    // ─── List all salary requests with filters ─────────────
    async findAll(query: any) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status,
                month,
                year,
                adminId,
            } = query;

            const where: any = {};

            if (status) where.status = status;
            if (month) where.month = parseInt(month);
            if (year) where.year = parseInt(year);
            if (adminId) where.adminId = adminId;

            if (search) {
                where.admin = {
                    OR: [
                        { adminName: { contains: search } },
                        { adminEmail: { contains: search } },
                    ],
                };
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            const [data, total] = await Promise.all([
                this.prisma.salary.findMany({
                    where,
                    include: {
                        admin: {
                            select: {
                                id: true,
                                adminName: true,
                                adminEmail: true,
                                profileImage: true,
                                phone: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take,
                }),
                this.prisma.salary.count({ where }),
            ]);

            return {
                data,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / take),
                },
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Get single salary request ─────────────────────────
    async findOne(id: string) {
        try {
            const salary = await this.prisma.salary.findUnique({
                where: { id },
                include: {
                    admin: {
                        select: {
                            id: true,
                            adminName: true,
                            adminEmail: true,
                            profileImage: true,
                            phone: true,
                        },
                    },
                },
            });
            if (!salary) throw new NotFoundException('Salary request not found');
            return salary;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Update salary request (only if PENDING) ──────────
    async update(id: string, data: any) {
        try {
            const existing = await this.prisma.salary.findUnique({ where: { id } });
            if (!existing) throw new NotFoundException('Salary request not found');
            if (existing.status !== 'PENDING') {
                throw new BadRequestException('Can only edit PENDING salary requests');
            }

            const updateData: any = { ...data };

            // Recompute net amount if amounts changed
            const amount = data.amount ?? existing.amount;
            const bonus = data.bonus ?? existing.bonus;
            const deduction = data.deduction ?? existing.deduction;
            updateData.netAmount = amount + bonus - deduction;

            const salary = await this.prisma.salary.update({
                where: { id },
                data: updateData,
                include: { admin: { select: { id: true, adminName: true, adminEmail: true } } },
            });

            return { message: 'Salary request updated', salary };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Delete salary request ─────────────────────────────
    async remove(id: string) {
        try {
            await this.prisma.salary.delete({ where: { id } });
            return { message: 'Salary request deleted' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Approve ──────────────────────────────────────────
    // Boss can set bonus and deduction when approving
    async approve(id: string, processedById: string, bonus?: number, deduction?: number) {
        try {
            // Fetch existing salary to calculate new netAmount
            const existing = await this.prisma.salary.findUnique({ where: { id } });
            if (!existing) throw new BadRequestException('Salary request not found');

            const finalBonus = bonus ?? existing.bonus;
            const finalDeduction = deduction ?? existing.deduction;
            const netAmount = existing.amount + finalBonus - finalDeduction;

            const salary = await this.prisma.salary.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    processedById,
                    processedAt: new Date(),
                    bonus: finalBonus,
                    deduction: finalDeduction,
                    netAmount,
                },
                include: { admin: { select: { id: true, adminName: true, adminEmail: true } } },
            });

            try {
                const senderName = await this.getAdminName(processedById);

                // Notify target employee only
                await this.notificationService.createNotification({
                    recipients: [{
                        id: salary.adminId, // the employee who requested
                        type: 'ADMIN' as const,
                        read: false,
                        link: `/admin/dashboard/finance/salaries`,
                    }],
                    senderId: processedById,
                    senderType: 'ADMIN',
                    title: 'Salary Approved',
                    message: `${senderName} approved your salary for ${this.getMonthName(salary.month)} ${salary.year}. Net Amount: ${netAmount}`,
                });
            } catch (e) {
                console.error('Push notification error:', e.message);
            }

            return { message: 'Salary request approved', salary };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Reject ───────────────────────────────────────────
    async reject(id: string, processedById: string, rejectionReason?: string) {
        try {
            const salary = await this.prisma.salary.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    processedById,
                    processedAt: new Date(),
                    rejectionReason,
                },
                include: { admin: { select: { id: true, adminName: true, adminEmail: true } } },
            });

            try {
                const senderName = await this.getAdminName(processedById);

                // Notify target employee only
                await this.notificationService.createNotification({
                    recipients: [{
                        id: salary.adminId, // the employee who requested
                        type: 'ADMIN' as const,
                        read: false,
                        link: `/admin/dashboard/finance/salaries`,
                    }],
                    senderId: processedById,
                    senderType: 'ADMIN',
                    title: 'Salary Rejected',
                    message: `${senderName} rejected your salary for ${this.getMonthName(salary.month)} ${salary.year}. Reason: ${rejectionReason || 'No reason provided.'}`,
                });
            } catch (e) {
                console.error('Push notification error:', e.message);
            }

            return { message: 'Salary request rejected', salary };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Mark as Paid ─────────────────────────────────────
    async markAsPaid(id: string, processedById: string) {
        try {
            const salary = await this.prisma.salary.update({
                where: { id },
                data: {
                    status: 'PAID',
                    processedById,
                    processedAt: new Date(),
                    paidAt: new Date(),
                },
                include: { admin: { select: { id: true, adminName: true, adminEmail: true } } },
            });

            try {
                const senderName = await this.getAdminName(processedById);

                // Notify target employee only
                await this.notificationService.createNotification({
                    recipients: [{
                        id: salary.adminId, // the employee who requested
                        type: 'ADMIN' as const,
                        read: false,
                        link: `/admin/dashboard/finance/salaries`,
                    }],
                    senderId: processedById,
                    senderType: 'ADMIN',
                    title: 'Salary Paid',
                    message: `Your salary for ${this.getMonthName(salary.month)} ${salary.year} has been marked as paid by ${senderName}.`,
                });
            } catch (e) {
                console.error('Push notification error:', e.message);
            }

            return { message: 'Salary marked as paid', salary };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Stats ────────────────────────────────────────────
    async getStats() {
        try {
            const [total, pending, approved, rejected, paid] = await Promise.all([
                this.prisma.salary.count(),
                this.prisma.salary.count({ where: { status: 'PENDING' } }),
                this.prisma.salary.count({ where: { status: 'APPROVED' } }),
                this.prisma.salary.count({ where: { status: 'REJECTED' } }),
                this.prisma.salary.count({ where: { status: 'PAID' } }),
            ]);

            const paidSalaries = await this.prisma.salary.aggregate({
                where: { status: 'PAID' },
                _sum: { netAmount: true },
            });

            const pendingAmount = await this.prisma.salary.aggregate({
                where: { status: 'PENDING' },
                _sum: { netAmount: true },
            });

            return {
                total,
                pending,
                approved,
                rejected,
                paid,
                totalPaidAmount: paidSalaries._sum.netAmount || 0,
                totalPendingAmount: pendingAmount._sum.netAmount || 0,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // ─── Helpers ──────────────────────────────────────────
    private getMonthName(month: number): string {
        const months = [
            '', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        return months[month] || `Month ${month}`;
    }
}
