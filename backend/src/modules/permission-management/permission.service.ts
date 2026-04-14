import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GlobalSocketGateway } from 'src/global/socket/socket.gateway';
import { NotificationService } from '../notification/notification.service';

export const PERMISSIONS = {
  MEETING_MANAGEMENT: 'meeting_management',
  HOSTED_WEBSITE: 'hosted_website',
  RESEARCH_MANAGEMENT: 'research_management',
  WEEKLY_MANAGEMENT: 'weekly_management',
  CHAT_MANAGEMENT: 'chat_management',
  EMPLOYEE_MANAGEMENT: 'employee_management',
  EXPENSE_MANAGEMENT: 'expense_management',
  REPORT_MANAGEMENT: 'report_management',
  INTERNSHIP_MANAGEMENT: 'internship_management',
  SALARY_MANAGEMENT: 'salary_management',
} as const;

export const ALL_PERMISSION_NAMES = Object.values(PERMISSIONS);

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: GlobalSocketGateway,
    private readonly notificationService: NotificationService,
  ) { }

  async seedPermissions() {
    const permissionData = [
      { name: PERMISSIONS.MEETING_MANAGEMENT, description: 'Manage meetings' },
      { name: PERMISSIONS.HOSTED_WEBSITE, description: 'Manage hosted websites' },
      { name: PERMISSIONS.RESEARCH_MANAGEMENT, description: 'Manage research' },
      { name: PERMISSIONS.WEEKLY_MANAGEMENT, description: 'Manage weekly goals' },
      { name: PERMISSIONS.CHAT_MANAGEMENT, description: 'Manage chat' },
      { name: PERMISSIONS.EMPLOYEE_MANAGEMENT, description: 'Manage employees/admins' },
      { name: PERMISSIONS.EXPENSE_MANAGEMENT, description: 'Manage expenses' },
      { name: PERMISSIONS.REPORT_MANAGEMENT, description: 'View and manage all reports' },
      { name: PERMISSIONS.INTERNSHIP_MANAGEMENT, description: 'Manage internship applications' },
      { name: PERMISSIONS.SALARY_MANAGEMENT, description: 'Manage salaries' },
    ];

    for (const perm of permissionData) {
      await this.prisma.permission.upsert({
        where: { name: perm.name },
        update: { description: perm.description },
        create: perm,
      });
    }

    return { message: 'Permissions seeded successfully' };
  }

  async findAll() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async getAdminPermissions(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { permissions: { include: { permission: true } } },
    });

    if (!admin) throw new NotFoundException('Admin not found');

    if (admin.isSuperAdmin) {
      const allPermissions = await this.prisma.permission.findMany();
      return {
        isSuperAdmin: true,
        permissions: allPermissions.map((p) => p.name),
      };
    }

    return {
      isSuperAdmin: false,
      permissions: admin.permissions.map((ap) => ap.permission.name),
    };
  }

  async assignPermission(adminId: string, permissionName: string, assignedBy: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const permission = await this.prisma.permission.findUnique({ where: { name: permissionName } });
    if (!permission) throw new BadRequestException(`Permission "${permissionName}" not found`);

    const existing = await this.prisma.adminPermission.findUnique({
      where: { adminId_permissionId: { adminId, permissionId: permission.id } },
    });
    if (existing) throw new BadRequestException('Permission already assigned');

    await this.prisma.adminPermission.create({
      data: { adminId, permissionId: permission.id, assignedBy },
    });

    const updated = await this.getAdminPermissions(adminId);
    this.socketGateway.emitToAdmin(adminId, 'permission:updated', {
      type: 'assigned', permission: permissionName, ...updated,
    });

    const assigner = await this.prisma.admin.findUnique({ where: { id: assignedBy } });
    const assignerName = assigner?.adminName || 'An administrator';

    await this.notificationService.createNotification({
      recipients: [{ id: adminId, type: 'ADMIN', read: false }],
      title: 'Permission Assigned',
      message: `${assignerName} assigned you the '${permissionName}' permission.`,
    });

    return { message: `Permission "${permissionName}" assigned`, permissions: updated.permissions };
  }

  async revokePermission(adminId: string, permissionName: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const permission = await this.prisma.permission.findUnique({ where: { name: permissionName } });
    if (!permission) throw new BadRequestException(`Permission "${permissionName}" not found`);

    const existing = await this.prisma.adminPermission.findUnique({
      where: { adminId_permissionId: { adminId, permissionId: permission.id } },
    });
    if (!existing) throw new BadRequestException('Permission not assigned');

    await this.prisma.adminPermission.delete({
      where: { adminId_permissionId: { adminId, permissionId: permission.id } },
    });

    const updated = await this.getAdminPermissions(adminId);
    this.socketGateway.emitToAdmin(adminId, 'permission:updated', {
      type: 'revoked', permission: permissionName, ...updated,
    });

    await this.notificationService.createNotification({
      recipients: [{ id: adminId, type: 'ADMIN', read: false }],
      title: 'Permission Revoked',
      message: `Your '${permissionName}' permission has been revoked.`,
    });

    return { message: `Permission "${permissionName}" revoked`, permissions: updated.permissions };
  }

  async setAdminPermissions(adminId: string, permissionNames: string[], assignedBy: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    await this.prisma.adminPermission.deleteMany({ where: { adminId } });

    if (permissionNames.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { name: { in: permissionNames } },
      });

      await this.prisma.adminPermission.createMany({
        data: permissions.map((p) => ({ adminId, permissionId: p.id, assignedBy })),
      });
    }

    const updated = await this.getAdminPermissions(adminId);
    this.socketGateway.emitToAdmin(adminId, 'permission:updated', { type: 'reset', ...updated });

    const assigner = await this.prisma.admin.findUnique({ where: { id: assignedBy } });
    const assignerName = assigner?.adminName || 'An administrator';

    await this.notificationService.createNotification({
      recipients: [{ id: adminId, type: 'ADMIN', read: false }],
      title: 'Permissions Updated',
      message: `${assignerName} updated your permissions.`,
    });

    return { message: 'Permissions updated', permissions: updated.permissions };
  }

  async toggleSuperAdmin(adminId: string, isSuperAdmin: boolean) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    await this.prisma.admin.update({ where: { id: adminId }, data: { isSuperAdmin } });

    const updated = await this.getAdminPermissions(adminId);
    this.socketGateway.emitToAdmin(adminId, 'permission:updated', {
      type: 'super_admin_changed', ...updated, isSuperAdmin
    });

    await this.notificationService.createNotification({
      recipients: [{ id: adminId, type: 'ADMIN', read: false }],
      title: isSuperAdmin ? 'Promoted' : 'Demoted',
      message: isSuperAdmin ? 'You have been promoted to super admin.' : 'You have been demoted from super admin.',
    });

    return {
      message: isSuperAdmin ? 'Promoted to super admin' : 'Demoted from super admin',
      isSuperAdmin,
    };
  }

  async hasPermission(adminId: string, permissionName: string): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { permissions: { include: { permission: true } } },
    });
    if (!admin) return false;
    if (admin.isSuperAdmin) return true;
    return admin.permissions.some((ap) => ap.permission.name === permissionName);
  }
}
