import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { deleteFile } from 'src/common/utils/file-upload.utils';

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

  // Helper: Pick known fields and convert multipart string values to proper types
  private normalizeExpenseData(data: any) {
    const result: any = {};
    const passThrough = ['title', 'description', 'status', 'reason'];
    for (const key of passThrough) {
      if (data[key] !== undefined) result[key] = data[key];
    }

    if (data.amount !== undefined) {
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) throw new BadRequestException('Amount must be a number');
      result.amount = amount;
    }

    if (data.usageStatus !== undefined) {
      if (!['USED', 'PLANNED'].includes(data.usageStatus)) {
        throw new BadRequestException('usageStatus must be USED or PLANNED');
      }
      result.usageStatus = data.usageStatus;
    }

    if (data.usageDate !== undefined) {
      if (!data.usageDate) {
        result.usageDate = null;
      } else {
        const date = new Date(data.usageDate);
        if (isNaN(date.getTime())) throw new BadRequestException('Invalid usage date');
        result.usageDate = date;
      }
    }

    return result;
  }

  async create(data: any, adminId: string, receiptUrl?: string) {
    try {
      const expenseData = this.normalizeExpenseData(data);
      const isUsed = expenseData.usageStatus === 'USED';

      const expense = await this.prisma.expense.create({
        data: {
          ...expenseData,
          // receipts only make sense for money that was already spent
          receiptUrl: isUsed ? receiptUrl : undefined,
          admin: { connect: { id: adminId } }
        },
      });

      if (!isUsed && receiptUrl) deleteFile(receiptUrl);

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

  async update(id: string, data: any, receiptUrl?: string) {
    try {
      const existing = await this.prisma.expense.findUnique({ where: { id } });
      if (!existing) throw new BadRequestException('Expense not found');

      const expenseData = this.normalizeExpenseData(data);
      const isUsed = (expenseData.usageStatus ?? existing.usageStatus) === 'USED';
      const removeReceipt = data.removeReceipt === true || data.removeReceipt === 'true';

      if (!isUsed || removeReceipt) {
        // PLANNED expenses (or explicit removal) carry no receipt
        expenseData.receiptUrl = null;
        if (receiptUrl) deleteFile(receiptUrl);
      } else if (receiptUrl) {
        expenseData.receiptUrl = receiptUrl;
      }

      const expense = await this.prisma.expense.update({
        where: { id },
        data: expenseData,
      });

      // Clean up the old receipt file when it was replaced or removed
      if (existing.receiptUrl && expenseData.receiptUrl !== undefined && expenseData.receiptUrl !== existing.receiptUrl) {
        deleteFile(existing.receiptUrl);
      }

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
      if (expense?.receiptUrl) deleteFile(expense.receiptUrl);

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
