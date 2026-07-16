import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type ImportResult = {
  entity: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  warnings: string[];
};

type ExistingKeys = {
  permissionIds: Set<string>;
  permissionNames: Set<string>;
  adminIds: Set<string>;
  adminEmails: Set<string>;
  adminPermissionPairs: Set<string>;
  expenseIds: Set<string>;
  salaryIds: Set<string>;
  reportIds: Set<string>;
  replyReportIds: Set<string>;
  researchIds: Set<string>;
  researchSlugs: Set<string>;
  meetingIds: Set<string>;
  internshipIds: Set<string>;
  hostedWebsiteIds: Set<string>;
  hostedWebsiteDomains: Set<string>;
  weeklyGoalIds: Set<string>;
  demoRequestIds: Set<string>;
  notificationIds: Set<string>;
};

const CONFLICT_STRATEGIES = ['SKIP', 'OVERWRITE', 'ABORT_ON_CONFLICT', 'RESTORE_DELETED'] as const;
type Strategy = (typeof CONFLICT_STRATEGIES)[number];

async function batchCreate(tx: any, model: any, rows: any[]) {
  const BATCH = 500;
  let created = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const result = await model.createMany({ data: rows.slice(i, i + BATCH), skipDuplicates: true });
    created += result.count;
  }
  return created;
}

@Injectable()
export class DataImportService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadExisting(): Promise<ExistingKeys> {
    const [
      permissions,
      admins,
      adminPermissions,
      expenses,
      salaries,
      reports,
      replyReports,
      research,
      meetings,
      internships,
      hostedWebsites,
      weeklyGoals,
      demoRequests,
      notifications,
    ] = await Promise.all([
      this.prisma.permission.findMany({ select: { id: true, name: true } }),
      this.prisma.admin.findMany({ select: { id: true, adminEmail: true } }),
      this.prisma.adminPermission.findMany({ select: { adminId: true, permissionId: true } }),
      this.prisma.expense.findMany({ select: { id: true } }),
      this.prisma.salary.findMany({ select: { id: true } }),
      this.prisma.report.findMany({ select: { id: true } }),
      this.prisma.replyReport.findMany({ select: { id: true } }),
      this.prisma.research.findMany({ select: { id: true, slug: true } }),
      this.prisma.meeting.findMany({ select: { id: true } }),
      this.prisma.internshipApplication.findMany({ select: { id: true } }),
      this.prisma.hostedWebsite.findMany({ select: { id: true, domain: true } }),
      this.prisma.weeklyGoal.findMany({ select: { id: true } }),
      this.prisma.demoRequest.findMany({ select: { id: true } }),
      this.prisma.notification.findMany({ select: { id: true } }),
    ]);

    return {
      permissionIds: new Set(permissions.map((p) => p.id)),
      permissionNames: new Set(permissions.map((p) => p.name)),
      adminIds: new Set(admins.map((a) => a.id)),
      adminEmails: new Set(admins.map((a) => a.adminEmail).filter(Boolean) as string[]),
      adminPermissionPairs: new Set(adminPermissions.map((ap) => `${ap.adminId}:${ap.permissionId}`)),
      expenseIds: new Set(expenses.map((e) => e.id)),
      salaryIds: new Set(salaries.map((s) => s.id)),
      reportIds: new Set(reports.map((r) => r.id)),
      replyReportIds: new Set(replyReports.map((r) => r.id)),
      researchIds: new Set(research.map((r) => r.id)),
      researchSlugs: new Set(research.map((r) => r.slug)),
      meetingIds: new Set(meetings.map((m) => m.id)),
      internshipIds: new Set(internships.map((i) => i.id)),
      hostedWebsiteIds: new Set(hostedWebsites.map((h) => h.id)),
      hostedWebsiteDomains: new Set(hostedWebsites.map((h) => h.domain)),
      weeklyGoalIds: new Set(weeklyGoals.map((g) => g.id)),
      demoRequestIds: new Set(demoRequests.map((d) => d.id)),
      notificationIds: new Set(notifications.map((n) => n.id)),
    };
  }

  async preview(payload: any, strategy: Strategy = 'SKIP', groups?: string[]) {
    if (!payload?.data) throw new BadRequestException('Invalid backup file');
    const d = payload.data;
    const e = await this.loadExisting();
    const activeGroups = groups ?? payload.meta?.groups ?? [];
    const hasGroup = (g: string) => activeGroups.length === 0 || activeGroups.includes(g) || activeGroups.includes('all');

    const wouldCreate: Record<string, number> = {};
    const wouldUpdate: Record<string, number> = {};
    const wouldSkip: Record<string, number> = {};
    const detectedGroups: string[] = [];
    const warnings: string[] = [];

    const bump = (obj: Record<string, number>, key: string) => { obj[key] = (obj[key] ?? 0) + 1; };
    const check = (key: string, items: any[] = [], isNew: (item: any) => boolean) => {
      for (const item of items) {
        if (isNew(item)) bump(wouldCreate, key);
        else if (strategy === 'OVERWRITE') bump(wouldUpdate, key);
        else bump(wouldSkip, key);
      }
    };

    // Core (always included)
    check('core', d.permissions ?? [], (p) => !e.permissionIds.has(p.id) && !e.permissionNames.has(p.name));
    check('core', d.admins ?? [], (a) => !e.adminIds.has(a.id) && !e.adminEmails.has(a.adminEmail));
    check('core', d.adminPermissions ?? [], (ap) => !e.adminPermissionPairs.has(`${ap.adminId}:${ap.permissionId}`));

    if (hasGroup('expenses') && (d.expenses?.length ?? 0) > 0) {
      detectedGroups.push('expenses');
      check('expenses', d.expenses, (ex) => !e.expenseIds.has(ex.id));
    }
    if (hasGroup('salaries') && (d.salaries?.length ?? 0) > 0) {
      detectedGroups.push('salaries');
      check('salaries', d.salaries, (s) => !e.salaryIds.has(s.id));
    }
    if (hasGroup('reports') && ((d.reports?.length ?? 0) > 0 || (d.replyReports?.length ?? 0) > 0)) {
      detectedGroups.push('reports');
      check('reports', d.reports ?? [], (r) => !e.reportIds.has(r.id));
      check('reports', d.replyReports ?? [], (r) => !e.replyReportIds.has(r.id));
    }
    if (hasGroup('research') && (d.research?.length ?? 0) > 0) {
      detectedGroups.push('research');
      check('research', d.research, (r) => !e.researchIds.has(r.id) && !e.researchSlugs.has(r.slug));
    }
    if (hasGroup('meetings') && (d.meetings?.length ?? 0) > 0) {
      detectedGroups.push('meetings');
      check('meetings', d.meetings, (m) => !e.meetingIds.has(m.id));
    }
    if (hasGroup('internships') && (d.internshipApplications?.length ?? 0) > 0) {
      detectedGroups.push('internships');
      check('internships', d.internshipApplications, (i) => !e.internshipIds.has(i.id));
    }
    if (hasGroup('hostedWebsites') && (d.hostedWebsites?.length ?? 0) > 0) {
      detectedGroups.push('hostedWebsites');
      check('hostedWebsites', d.hostedWebsites, (h) => !e.hostedWebsiteIds.has(h.id) && !e.hostedWebsiteDomains.has(h.domain));
    }
    if (hasGroup('weeklyGoals') && (d.weeklyGoals?.length ?? 0) > 0) {
      detectedGroups.push('weeklyGoals');
      check('weeklyGoals', d.weeklyGoals, (g) => !e.weeklyGoalIds.has(g.id));
    }
    if (hasGroup('demoRequests') && (d.demoRequests?.length ?? 0) > 0) {
      detectedGroups.push('demoRequests');
      check('demoRequests', d.demoRequests, (dr) => !e.demoRequestIds.has(dr.id));
    }
    if (hasGroup('notifications') && (d.notifications?.length ?? 0) > 0) {
      detectedGroups.push('notifications');
      check('notifications', d.notifications, (n) => !e.notificationIds.has(n.id));
    }

    // Conflict warnings
    if (d.admins?.some((a: any) => e.adminEmails.has(a.adminEmail))) warnings.push('Some admins already exist with the same email');
    if (d.research?.some((r: any) => e.researchSlugs.has(r.slug))) warnings.push('Some research records have duplicate slugs');
    if (d.hostedWebsites?.some((h: any) => e.hostedWebsiteDomains.has(h.domain))) warnings.push('Some hosted websites have duplicate domains');

    return { wouldCreate, wouldUpdate, wouldSkip, detectedGroups, warnings, strategy };
  }

  async commit(
    payload: any,
    options: { strategy: Strategy; groups?: string[]; fileName?: string },
    actor: { id: string; name: string },
  ) {
    if (!payload?.data) throw new BadRequestException('Invalid backup file');
    const d = payload.data;
    const { strategy, groups = [], fileName = 'backup.json' } = options;
    const activeGroups = groups.length ? groups : (payload.meta?.groups ?? []);
    const hasGroup = (g: string) => activeGroups.length === 0 || activeGroups.includes(g) || activeGroups.includes('all');

    if (strategy === 'ABORT_ON_CONFLICT') {
      const conflicts = await this.detectConflicts(d);
      if (conflicts.length > 0) {
        throw new BadRequestException(`Import aborted due to conflicts: ${conflicts.join(', ')}`);
      }
    }

    const e = await this.loadExisting();
    const results: ImportResult[] = [];
    const createdIds: Record<string, string[]> = {};

    const col = (key: string, items: any[], existingSet: Set<string>) => {
      createdIds[key] = (items ?? []).filter((item) => !existingSet.has(item.id)).map((i) => i.id);
    };

    await this.prisma.$transaction(
      async (tx) => {
        // Core
        results.push(await this.importPermissions(d.permissions ?? [], e, strategy, tx));
        results.push(await this.importAdmins(d.admins ?? [], e, strategy, tx));
        // Reload after admins/perms insert
        const freshAdminIds = new Set([...e.adminIds, ...(d.admins ?? []).map((a: any) => a.id)]);
        const freshPermIds = new Set([...e.permissionIds, ...(d.permissions ?? []).map((p: any) => p.id)]);
        results.push(await this.importAdminPermissions(d.adminPermissions ?? [], e, strategy, freshAdminIds, freshPermIds, tx));

        if (hasGroup('expenses') && d.expenses?.length) {
          results.push(await this.importExpenses(d.expenses, e, strategy, freshAdminIds, tx));
        }
        if (hasGroup('salaries') && d.salaries?.length) {
          results.push(await this.importSalaries(d.salaries, e, strategy, freshAdminIds, tx));
        }
        if (hasGroup('reports') && (d.reports?.length || d.replyReports?.length)) {
          results.push(await this.importReports(d.reports ?? [], e, strategy, freshAdminIds, tx));
          // reload reportIds after import
          const freshReportIds = new Set([...e.reportIds, ...(d.reports ?? []).map((r: any) => r.id)]);
          results.push(await this.importReplyReports(d.replyReports ?? [], e, strategy, freshAdminIds, freshReportIds, tx));
        }
        if (hasGroup('research') && d.research?.length) {
          results.push(await this.importResearch(d.research, e, strategy, freshAdminIds, tx));
        }
        if (hasGroup('meetings') && d.meetings?.length) {
          results.push(await this.importMeetings(d.meetings, e, strategy, freshAdminIds, tx));
        }
        if (hasGroup('internships') && d.internshipApplications?.length) {
          results.push(await this.importInternshipApplications(d.internshipApplications, e, strategy, freshAdminIds, tx));
        }
        if (hasGroup('hostedWebsites') && d.hostedWebsites?.length) {
          results.push(await this.importHostedWebsites(d.hostedWebsites, e, strategy, tx));
        }
        if (hasGroup('weeklyGoals') && d.weeklyGoals?.length) {
          results.push(await this.importWeeklyGoals(d.weeklyGoals, e, strategy, freshAdminIds, tx));
        }
        if (hasGroup('demoRequests') && d.demoRequests?.length) {
          results.push(await this.importDemoRequests(d.demoRequests, e, strategy, freshAdminIds, tx));
        }
        if (hasGroup('notifications') && d.notifications?.length) {
          results.push(await this.importNotifications(d.notifications, e, strategy, tx));
        }
      },
      { timeout: 120000, maxWait: 30000 },
    );

    // Track created IDs for rollback
    col('permissions', d.permissions ?? [], e.permissionIds);
    col('admins', d.admins ?? [], e.adminIds);
    createdIds['adminPermissions'] = (d.adminPermissions ?? [])
      .filter((ap: any) => !e.adminPermissionPairs.has(`${ap.adminId}:${ap.permissionId}`))
      .map((ap: any) => ap.id);
    col('expenses', d.expenses ?? [], e.expenseIds);
    col('salaries', d.salaries ?? [], e.salaryIds);
    col('reports', d.reports ?? [], e.reportIds);
    col('replyReports', d.replyReports ?? [], e.replyReportIds);
    col('research', d.research ?? [], e.researchIds);
    col('meetings', d.meetings ?? [], e.meetingIds);
    col('internshipApplications', d.internshipApplications ?? [], e.internshipIds);
    col('hostedWebsites', d.hostedWebsites ?? [], e.hostedWebsiteIds);
    col('weeklyGoals', d.weeklyGoals ?? [], e.weeklyGoalIds);
    col('demoRequests', d.demoRequests ?? [], e.demoRequestIds);
    col('notifications', d.notifications ?? [], e.notificationIds);

    const snapshot = await this.prisma.importSnapshot.create({
      data: {
        performedById: actor.id,
        performedByName: actor.name,
        fileName,
        strategy,
        groups: activeGroups,
        summary: results,
        createdIds,
        status: 'active',
      },
    });

    return { snapshotId: snapshot.id, summary: results };
  }

  async rollback(snapshotId: string, actor: { id: string; name: string }) {
    const snap = await this.prisma.importSnapshot.findUnique({ where: { id: snapshotId } });
    if (!snap) throw new BadRequestException('Import snapshot not found');
    if (snap.status !== 'active') throw new BadRequestException('This import has already been rolled back');

    const ids = snap.createdIds as Record<string, string[]>;
    const del = async (tx: any, model: any, list: string[]) => {
      if (!list?.length) return;
      await model.deleteMany({ where: { id: { in: list } } });
    };

    await this.prisma.$transaction(
      async (tx) => {
        await del(tx, tx.notification, ids.notifications);
        await del(tx, tx.demoRequest, ids.demoRequests);
        await del(tx, tx.weeklyGoal, ids.weeklyGoals);
        await del(tx, tx.hostedWebsite, ids.hostedWebsites);
        await del(tx, tx.internshipApplication, ids.internshipApplications);
        await del(tx, tx.meeting, ids.meetings);
        await del(tx, tx.research, ids.research);
        await del(tx, tx.replyReport, ids.replyReports);
        await del(tx, tx.report, ids.reports);
        await del(tx, tx.salary, ids.salaries);
        await del(tx, tx.expense, ids.expenses);
        await del(tx, tx.adminPermission, ids.adminPermissions);
        await del(tx, tx.admin, ids.admins);
        await del(tx, tx.permission, ids.permissions);
      },
      { timeout: 120000, maxWait: 30000 },
    );

    await this.prisma.importSnapshot.update({
      where: { id: snapshotId },
      data: {
        status: 'rolled_back',
        rolledBackAt: new Date(),
        rolledBackById: actor.id,
        rolledBackByName: actor.name,
      },
    });

    return { success: true, snapshotId };
  }

  async getHistory(limit = 50) {
    return this.prisma.importSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async detectConflicts(d: any): Promise<string[]> {
    const e = await this.loadExisting();
    const conflicts: string[] = [];
    if (d.admins?.some((a: any) => e.adminEmails.has(a.adminEmail))) conflicts.push('Admins');
    if (d.permissions?.some((p: any) => e.permissionNames.has(p.name))) conflicts.push('Permissions');
    if (d.research?.some((r: any) => e.researchSlugs.has(r.slug))) conflicts.push('Research');
    if (d.hostedWebsites?.some((h: any) => e.hostedWebsiteDomains.has(h.domain))) conflicts.push('Hosted Websites');
    if (d.expenses?.some((ex: any) => e.expenseIds.has(ex.id))) conflicts.push('Expenses');
    if (d.salaries?.some((s: any) => e.salaryIds.has(s.id))) conflicts.push('Salaries');
    if (d.reports?.some((r: any) => e.reportIds.has(r.id))) conflicts.push('Reports');
    if (d.meetings?.some((m: any) => e.meetingIds.has(m.id))) conflicts.push('Meetings');
    return conflicts;
  }

  // ── Individual importers ─────────────────────────────────────────────

  private async importPermissions(items: any[], e: ExistingKeys, strategy: Strategy, tx: any): Promise<ImportResult> {
    const newItems = items.filter((p) => !e.permissionIds.has(p.id) && !e.permissionNames.has(p.name));
    const dupItems = items.filter((p) => e.permissionIds.has(p.id) || e.permissionNames.has(p.name));
    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.permission, newItems.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? null,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const p of dupItems) {
        await tx.permission.updateMany({ where: { name: p.name }, data: { description: p.description ?? null } });
        updated++;
      }
    }

    return {
      entity: 'Permissions',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed: 0,
      warnings: [],
    };
  }

  private async importAdmins(items: any[], e: ExistingKeys, strategy: Strategy, tx: any): Promise<ImportResult> {
    const newItems = items.filter((a) => !e.adminIds.has(a.id) && !e.adminEmails.has(a.adminEmail));
    const dupItems = items.filter((a) => e.adminIds.has(a.id) || e.adminEmails.has(a.adminEmail));
    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.admin, newItems.map((a) => ({
        id: a.id,
        adminName: a.adminName ?? null,
        adminEmail: a.adminEmail ?? null,
        phone: a.phone ?? null,
        location: a.location ?? null,
        password: a.password ?? null,
        profileImage: a.profileImage ?? null,
        status: a.status ?? 'ACTIVE',
        isSuperAdmin: a.isSuperAdmin ?? false,
        bio: a.bio ?? null,
        joinedDate: a.joinedDate ? new Date(a.joinedDate) : null,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const a of dupItems) {
        await tx.admin.updateMany({
          where: { adminEmail: a.adminEmail },
          data: {
            adminName: a.adminName ?? undefined,
            phone: a.phone ?? undefined,
            location: a.location ?? undefined,
            status: a.status ?? undefined,
            isSuperAdmin: a.isSuperAdmin ?? undefined,
            bio: a.bio ?? undefined,
            updatedAt: new Date(),
          },
        });
        updated++;
      }
    }

    return {
      entity: 'Admins',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed: 0,
      warnings: dupItems.length > 0 ? [`${dupItems.length} admins already exist`] : [],
    };
  }

  private async importAdminPermissions(
    items: any[],
    e: ExistingKeys,
    strategy: Strategy,
    adminIds: Set<string>,
    permIds: Set<string>,
    tx: any,
  ): Promise<ImportResult> {
    let created = 0;
    let skipped = 0;
    let failed = 0;

    const valid: any[] = [];
    for (const ap of items) {
      if (e.adminPermissionPairs.has(`${ap.adminId}:${ap.permissionId}`)) { skipped++; continue; }
      if (!adminIds.has(ap.adminId) || !permIds.has(ap.permissionId)) { failed++; continue; }
      valid.push(ap);
    }

    if (valid.length > 0) {
      created = await batchCreate(tx, tx.adminPermission, valid.map((ap) => ({
        id: ap.id,
        adminId: ap.adminId,
        permissionId: ap.permissionId,
        assignedBy: ap.assignedBy ?? null,
        assignedAt: ap.assignedAt ? new Date(ap.assignedAt) : new Date(),
      })));
    }

    return {
      entity: 'Admin Permissions',
      total: items.length,
      created,
      updated: 0,
      skipped,
      failed,
      warnings: failed > 0 ? [`${failed} permission assignments skipped — referenced admin or permission not found`] : [],
    };
  }

  private async importExpenses(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems: any[] = [];
    const dupItems: any[] = [];
    let failed = 0;

    for (const ex of items) {
      if (e.expenseIds.has(ex.id)) { dupItems.push(ex); continue; }
      if (!adminIds.has(ex.adminId)) { failed++; continue; }
      newItems.push(ex);
    }

    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.expense, newItems.map((ex) => ({
        id: ex.id,
        title: ex.title,
        amount: Number(ex.amount),
        status: ex.status ?? 'PENDING',
        description: ex.description ?? null,
        reason: ex.reason ?? null,
        adminId: ex.adminId,
        createdAt: ex.createdAt ? new Date(ex.createdAt) : new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const ex of dupItems) {
        await tx.expense.update({ where: { id: ex.id }, data: { title: ex.title, amount: Number(ex.amount), status: ex.status ?? 'PENDING', description: ex.description ?? null, reason: ex.reason ?? null } });
        updated++;
      }
    }

    return {
      entity: 'Expenses',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed,
      warnings: failed > 0 ? [`${failed} expenses skipped — referenced admin not found`] : [],
    };
  }

  private async importSalaries(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems: any[] = [];
    const dupItems: any[] = [];
    let failed = 0;

    for (const s of items) {
      if (e.salaryIds.has(s.id)) { dupItems.push(s); continue; }
      if (!adminIds.has(s.adminId)) { failed++; continue; }
      newItems.push(s);
    }

    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.salary, newItems.map((s) => ({
        id: s.id,
        month: Number(s.month),
        year: Number(s.year),
        amount: Number(s.amount),
        bonus: Number(s.bonus ?? 0),
        deduction: Number(s.deduction ?? 0),
        netAmount: Number(s.netAmount),
        reason: s.reason ?? null,
        status: s.status ?? 'PENDING',
        adminId: s.adminId,
        processedById: s.processedById ?? null,
        processedAt: s.processedAt ? new Date(s.processedAt) : null,
        rejectionReason: s.rejectionReason ?? null,
        paidAt: s.paidAt ? new Date(s.paidAt) : null,
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const s of dupItems) {
        await tx.salary.update({
          where: { id: s.id },
          data: { month: Number(s.month), year: Number(s.year), amount: Number(s.amount), bonus: Number(s.bonus ?? 0), deduction: Number(s.deduction ?? 0), netAmount: Number(s.netAmount), status: s.status ?? 'PENDING', reason: s.reason ?? null, updatedAt: new Date() },
        });
        updated++;
      }
    }

    return {
      entity: 'Salaries',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed,
      warnings: failed > 0 ? [`${failed} salaries skipped — referenced admin not found`] : [],
    };
  }

  private async importReports(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems: any[] = [];
    const dupItems: any[] = [];
    let failed = 0;

    for (const r of items) {
      if (e.reportIds.has(r.id)) { dupItems.push(r); continue; }
      if (!adminIds.has(r.adminId)) { failed++; continue; }
      newItems.push(r);
    }

    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.report, newItems.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content ?? null,
        reportUrl: r.reportUrl ?? null,
        publicId: r.publicId ?? null,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        adminId: r.adminId,
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const r of dupItems) {
        await tx.report.update({ where: { id: r.id }, data: { title: r.title, content: r.content ?? null, reportUrl: r.reportUrl ?? null } });
        updated++;
      }
    }

    return {
      entity: 'Reports',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed,
      warnings: failed > 0 ? [`${failed} reports skipped — referenced admin not found`] : [],
    };
  }

  private async importReplyReports(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, reportIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems: any[] = [];
    const dupItems: any[] = [];
    let failed = 0;

    for (const r of items) {
      if (e.replyReportIds.has(r.id)) { dupItems.push(r); continue; }
      if (!adminIds.has(r.adminId) || !reportIds.has(r.reportId)) { failed++; continue; }
      newItems.push(r);
    }

    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.replyReport, newItems.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        reportId: r.reportId,
        adminId: r.adminId,
        replyName: r.replyName ?? null,
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const r of dupItems) {
        await tx.replyReport.update({ where: { id: r.id }, data: { content: r.content, replyName: r.replyName ?? null, updatedAt: new Date() } });
        updated++;
      }
    }

    return {
      entity: 'Report Replies',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed,
      warnings: failed > 0 ? [`${failed} replies skipped — referenced admin or report not found`] : [],
    };
  }

  private async importResearch(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems: any[] = [];
    const dupItems: any[] = [];
    let failed = 0;

    for (const r of items) {
      if (e.researchIds.has(r.id) || e.researchSlugs.has(r.slug)) { dupItems.push(r); continue; }
      if (!adminIds.has(r.ownerId)) { failed++; continue; }
      newItems.push(r);
    }

    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.research, newItems.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        description: r.description ?? null,
        problem: r.problem ?? null,
        objective: r.objective ?? null,
        methodology: r.methodology ?? null,
        findings: r.findings ?? null,
        conclusion: r.conclusion ?? null,
        recommendations: r.recommendations ?? null,
        type: r.type,
        status: r.status ?? 'DRAFT',
        startDate: r.startDate ? new Date(r.startDate) : null,
        endDate: r.endDate ? new Date(r.endDate) : null,
        ownerId: r.ownerId,
        summary: r.summary ?? null,
        attachments: r.attachments ?? null,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const r of dupItems) {
        await tx.research.updateMany({
          where: { slug: r.slug },
          data: { title: r.title, status: r.status ?? 'DRAFT', summary: r.summary ?? null, updatedAt: new Date() },
        });
        updated++;
      }
    }

    return {
      entity: 'Research',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed,
      warnings: failed > 0 ? [`${failed} research records skipped — referenced owner not found`] : [],
    };
  }

  private async importMeetings(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems: any[] = [];
    const dupItems: any[] = [];
    let failed = 0;

    for (const m of items) {
      if (e.meetingIds.has(m.id)) { dupItems.push(m); continue; }
      if (!adminIds.has(m.createdById)) { failed++; continue; }
      newItems.push(m);
    }

    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.meeting, newItems.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description ?? null,
        startTime: new Date(m.startTime),
        endTime: m.endTime ? new Date(m.endTime) : null,
        status: m.status ?? 'SCHEDULED',
        location: m.location ?? null,
        meetingLink: m.meetingLink ?? null,
        participants: m.participants ?? null,
        keyPoints: m.keyPoints ?? null,
        actionItems: m.actionItems ?? null,
        attachments: m.attachments ?? null,
        createdById: m.createdById,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const m of dupItems) {
        await tx.meeting.update({ where: { id: m.id }, data: { title: m.title, status: m.status ?? 'SCHEDULED', description: m.description ?? null, updatedAt: new Date() } });
        updated++;
      }
    }

    return {
      entity: 'Meetings',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed,
      warnings: failed > 0 ? [`${failed} meetings skipped — referenced admin not found`] : [],
    };
  }

  private async importInternshipApplications(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems = items.filter((i) => !e.internshipIds.has(i.id));
    const dupItems = items.filter((i) => e.internshipIds.has(i.id));
    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.internshipApplication, newItems.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        email: a.email,
        phone: a.phone ?? null,
        institution: a.institution ?? null,
        fieldOfStudy: a.fieldOfStudy ?? null,
        level: a.level ?? null,
        country: a.country ?? null,
        city: a.city ?? null,
        internshipType: a.internshipType,
        period: a.period ?? null,
        preferredStart: a.preferredStart ? new Date(a.preferredStart) : null,
        preferredEnd: a.preferredEnd ? new Date(a.preferredEnd) : null,
        internshipStartDate: a.internshipStartDate ? new Date(a.internshipStartDate) : null,
        coverLetter: a.coverLetter ?? null,
        skills: a.skills ?? null,
        cvUrl: a.cvUrl ?? null,
        portfolioUrl: a.portfolioUrl ?? null,
        githubUrl: a.githubUrl ?? null,
        linkedinUrl: a.linkedinUrl ?? null,
        score: a.score ?? null,
        status: a.status ?? 'PENDING',
        employmentStatus: a.employmentStatus ?? null,
        reviewedById: a.reviewedById && adminIds.has(a.reviewedById) ? a.reviewedById : null,
        reviewNotes: a.reviewNotes ?? null,
        reviewedAt: a.reviewedAt ? new Date(a.reviewedAt) : null,
        isShortlisted: a.isShortlisted ?? false,
        isContacted: a.isContacted ?? false,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const a of dupItems) {
        await tx.internshipApplication.update({ where: { id: a.id }, data: { status: a.status ?? 'PENDING', score: a.score ?? null, isShortlisted: a.isShortlisted ?? false, isContacted: a.isContacted ?? false, reviewNotes: a.reviewNotes ?? null, updatedAt: new Date() } });
        updated++;
      }
    }

    return {
      entity: 'Internship Applications',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed: 0,
      warnings: [],
    };
  }

  private async importHostedWebsites(items: any[], e: ExistingKeys, strategy: Strategy, tx: any): Promise<ImportResult> {
    const newItems = items.filter((h) => !e.hostedWebsiteIds.has(h.id) && !e.hostedWebsiteDomains.has(h.domain));
    const dupItems = items.filter((h) => e.hostedWebsiteIds.has(h.id) || e.hostedWebsiteDomains.has(h.domain));
    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.hostedWebsite, newItems.map((h) => ({
        id: h.id,
        name: h.name,
        domain: h.domain,
        description: h.description ?? null,
        status: h.status ?? 'ACTIVE',
        createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const h of dupItems) {
        await tx.hostedWebsite.updateMany({ where: { domain: h.domain }, data: { name: h.name, description: h.description ?? null, status: h.status ?? 'ACTIVE', updatedAt: new Date() } });
        updated++;
      }
    }

    return {
      entity: 'Hosted Websites',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed: 0,
      warnings: [],
    };
  }

  private async importWeeklyGoals(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems: any[] = [];
    const dupItems: any[] = [];
    let failed = 0;

    for (const g of items) {
      if (e.weeklyGoalIds.has(g.id)) { dupItems.push(g); continue; }
      if (!adminIds.has(g.ownerId)) { failed++; continue; }
      newItems.push(g);
    }

    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.weeklyGoal, newItems.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description ?? null,
        weekStart: new Date(g.weekStart),
        weekEnd: new Date(g.weekEnd),
        status: g.status ?? 'PENDING',
        progress: Number(g.progress ?? 0),
        ownerId: g.ownerId,
        tasks: g.tasks ?? null,
        reviewNotes: g.reviewNotes ?? null,
        createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const g of dupItems) {
        await tx.weeklyGoal.update({ where: { id: g.id }, data: { title: g.title, status: g.status ?? 'PENDING', progress: Number(g.progress ?? 0), tasks: g.tasks ?? null, updatedAt: new Date() } });
        updated++;
      }
    }

    return {
      entity: 'Weekly Goals',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed,
      warnings: failed > 0 ? [`${failed} weekly goals skipped — referenced owner not found`] : [],
    };
  }

  private async importDemoRequests(items: any[], e: ExistingKeys, strategy: Strategy, adminIds: Set<string>, tx: any): Promise<ImportResult> {
    const newItems = items.filter((d) => !e.demoRequestIds.has(d.id));
    const dupItems = items.filter((d) => e.demoRequestIds.has(d.id));
    let created = 0;
    let updated = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.demoRequest, newItems.map((d) => ({
        id: d.id,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone ?? null,
        companyName: d.companyName ?? null,
        message: d.message ?? null,
        product: d.product ?? null,
        demoType: d.demoType,
        preferredDate: d.preferredDate ? new Date(d.preferredDate) : null,
        preferredTime: d.preferredTime ?? null,
        status: d.status ?? 'PENDING',
        assignedToId: d.assignedToId && adminIds.has(d.assignedToId) ? d.assignedToId : null,
        scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
        meetingLink: d.meetingLink ?? null,
        internalNotes: d.internalNotes ?? null,
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        updatedAt: new Date(),
      })));
    }

    if (strategy === 'OVERWRITE') {
      for (const d of dupItems) {
        await tx.demoRequest.update({ where: { id: d.id }, data: { status: d.status ?? 'PENDING', internalNotes: d.internalNotes ?? null, updatedAt: new Date() } });
        updated++;
      }
    }

    return {
      entity: 'Demo Requests',
      total: items.length,
      created,
      updated,
      skipped: strategy === 'OVERWRITE' ? 0 : dupItems.length,
      failed: 0,
      warnings: [],
    };
  }

  private async importNotifications(items: any[], e: ExistingKeys, strategy: Strategy, tx: any): Promise<ImportResult> {
    const newItems = items.filter((n) => !e.notificationIds.has(n.id));
    const dupItems = items.filter((n) => e.notificationIds.has(n.id));
    let created = 0;

    if (newItems.length > 0) {
      created = await batchCreate(tx, tx.notification, newItems.map((n) => ({
        id: n.id,
        recipients: n.recipients ?? [],
        senderId: n.senderId ?? null,
        senderType: n.senderType ?? null,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
      })));
    }

    return {
      entity: 'Notifications',
      total: items.length,
      created,
      updated: 0,
      skipped: dupItems.length,
      failed: 0,
      warnings: [],
    };
  }
}
