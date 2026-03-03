import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

  // Helper: Get finance admins for notifications
  private async getFinanceAdminIds(): Promise<string[]> {
    const admins = await this.prisma.admin.findMany({
      where: {
        OR: [
          { isSuperAdmin: true },
          { permissions: { some: { permission: { name: 'expense_management' } } } }
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

  async create(data: any, adminId: string) {
    try {
      const expense = await this.prisma.expense.create({
        data: {
          ...data,
          admin: { connect: { id: adminId } }
        },
      });

      try {
        const adminIds = await this.getFinanceAdminIds();
        const senderName = await this.getAdminName(adminId);

        await this.notificationService.createNotification({
          recipients: adminIds.map(id => ({
            id,
            type: 'ADMIN' as const,
            read: id === adminId,
            link: `/admin/dashboard/finance/expenses`,
          })),
          senderId: adminId,
          senderType: 'ADMIN',
          title: 'New Expense Submitted',
          message: `${senderName} submitted a new expense: "${expense.title || 'Expense'}"`,
        });
      } catch (e) {
        console.error('Failed to send notification:', e.message);
      }
      return { message: 'Expense created successfully', expense };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.prisma.expense.findMany({
        include: { admin: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const expense = await this.prisma.expense.findUnique({
        where: { id },
        include: { admin: true },
      });
      if (!expense) throw new BadRequestException('Expense not found');
      return expense;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: any) {
    try {
      const expense = await this.prisma.expense.update({
        where: { id },
        data,
      });

      try {
        const adminIds = await this.getFinanceAdminIds();

        // We might not have the updating adminId directly here, but we can notify admins of an update
        await this.notificationService.createNotification({
          recipients: adminIds.map(aid => ({
            id: aid,
            type: 'ADMIN' as const,
            read: false,
            link: `/admin/dashboard/finance/expenses`,
          })),
          title: 'Expense Updated',
          message: `The expense "${expense.title || 'Expense'}" has been updated`,
        });
      } catch (e) {
        console.error('Failed to send notification:', e.message);
      }
      return { message: 'Expense updated successfully', expense };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const expense = await this.prisma.expense.findUnique({ where: { id } });
      await this.prisma.expense.delete({ where: { id } });

      if (expense) {
        try {
          const adminIds = await this.getFinanceAdminIds();

          await this.notificationService.createNotification({
            recipients: adminIds.map(aid => ({
              id: aid,
              type: 'ADMIN' as const,
              read: false,
              link: `/admin/dashboard/finance/expenses`,
            })),
            title: 'Expense Deleted',
            message: `The expense "${expense.title || 'Expense'}" has been deleted`,
          });
        } catch (e) {
          console.error('Failed to send notification:', e.message);
        }
      }
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
