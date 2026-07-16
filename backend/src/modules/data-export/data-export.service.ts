import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class DataExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportJson(options: {
    groups?: string[];
    adminId: string;
    adminName: string;
  }) {
    const { groups = [], adminId, adminName } = options;
    const hasGroup = (g: string) => groups.length === 0 || groups.includes(g);

    const [permissions, admins, adminPermissions] = await Promise.all([
      this.prisma.permission.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.admin.findMany({ orderBy: { adminEmail: 'asc' } }),
      this.prisma.adminPermission.findMany(),
    ]);

    const data: Record<string, any> = {
      permissions,
      admins,
      adminPermissions,
      expenses: [],
      salaries: [],
      reports: [],
      replyReports: [],
      research: [],
      meetings: [],
      internshipApplications: [],
      hostedWebsites: [],
      weeklyGoals: [],
      demoRequests: [],
      notifications: [],
    };

    if (hasGroup('expenses')) {
      data.expenses = await this.prisma.expense.findMany({ orderBy: { createdAt: 'asc' } });
    }

    if (hasGroup('salaries')) {
      data.salaries = await this.prisma.salary.findMany({ orderBy: { createdAt: 'asc' } });
    }

    if (hasGroup('reports')) {
      data.reports = await this.prisma.report.findMany({ orderBy: { createdAt: 'asc' } });
      data.replyReports = await this.prisma.replyReport.findMany({ orderBy: { createdAt: 'asc' } });
    }

    if (hasGroup('research')) {
      data.research = await this.prisma.research.findMany({ orderBy: { createdAt: 'asc' } });
    }

    if (hasGroup('meetings')) {
      data.meetings = await this.prisma.meeting.findMany({ orderBy: { createdAt: 'asc' } });
    }

    if (hasGroup('internships')) {
      data.internshipApplications = await this.prisma.internshipApplication.findMany({ orderBy: { createdAt: 'asc' } });
    }

    if (hasGroup('hostedWebsites')) {
      data.hostedWebsites = await this.prisma.hostedWebsite.findMany({ orderBy: { name: 'asc' } });
    }

    if (hasGroup('weeklyGoals')) {
      data.weeklyGoals = await this.prisma.weeklyGoal.findMany({ orderBy: { weekStart: 'asc' } });
    }

    if (hasGroup('demoRequests')) {
      data.demoRequests = await this.prisma.demoRequest.findMany({ orderBy: { createdAt: 'asc' } });
    }

    if (hasGroup('notifications')) {
      data.notifications = await this.prisma.notification.findMany({ orderBy: { createdAt: 'asc' } });
    }

    const counts: Record<string, number> = {};
    for (const [key, val] of Object.entries(data)) {
      counts[key] = Array.isArray(val) ? val.length : 0;
    }

    return {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: adminName,
        exportedById: adminId,
        version: '1.0',
        groups: groups.length ? groups : ['all'],
        counts,
      },
      data,
    };
  }

  async exportExcel(options: {
    groups?: string[];
    adminId: string;
    adminName: string;
  }) {
    const { groups = [] } = options;
    const hasGroup = (g: string) => groups.length === 0 || groups.includes(g);
    const wb = XLSX.utils.book_new();

    // ── Core (always) ──────────────────────────────────────────────────
    const perms = await this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(perms.map((p) => ({ ID: p.id, Name: p.name, Description: p.description ?? '', 'Created At': p.createdAt.toISOString().split('T')[0] }))),
      'Permissions',
    );

    const admins = await this.prisma.admin.findMany({ orderBy: { adminEmail: 'asc' } });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        admins.map((a) => ({
          ID: a.id,
          Name: a.adminName ?? '',
          Email: a.adminEmail ?? '',
          Phone: a.phone ?? '',
          Location: a.location ?? '',
          'Super Admin': a.isSuperAdmin ? 'Yes' : 'No',
          Status: a.status,
          'Joined Date': a.joinedDate ? a.joinedDate.toISOString().split('T')[0] : '',
          'Created At': a.createdAt.toISOString().split('T')[0],
        })),
      ),
      'Admins',
    );

    const adminPerms = await this.prisma.adminPermission.findMany({
      include: {
        admin: { select: { adminName: true, adminEmail: true } },
        permission: { select: { name: true } },
      },
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        adminPerms.map((ap) => ({
          'Admin Email': ap.admin.adminEmail ?? '',
          'Admin Name': ap.admin.adminName ?? '',
          Permission: ap.permission.name,
          'Assigned At': ap.assignedAt.toISOString().split('T')[0],
        })),
      ),
      'Admin Permissions',
    );

    // ── Optional groups ─────────────────────────────────────────────────
    if (hasGroup('expenses')) {
      const expenses = await this.prisma.expense.findMany({
        include: { admin: { select: { adminName: true } } },
        orderBy: { createdAt: 'desc' },
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          expenses.map((e) => ({
            ID: e.id,
            Title: e.title,
            Amount: e.amount,
            Status: e.status,
            Description: e.description ?? '',
            Reason: e.reason ?? '',
            'Admin Name': e.admin.adminName ?? '',
            'Created At': e.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Expenses',
      );
    }

    if (hasGroup('salaries')) {
      const salaries = await this.prisma.salary.findMany({
        include: { admin: { select: { adminName: true } } },
        orderBy: { createdAt: 'desc' },
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          salaries.map((s) => ({
            ID: s.id,
            Month: s.month,
            Year: s.year,
            Amount: s.amount,
            Bonus: s.bonus,
            Deduction: s.deduction,
            'Net Amount': s.netAmount,
            Status: s.status,
            Reason: s.reason ?? '',
            'Admin Name': s.admin.adminName ?? '',
            'Created At': s.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Salaries',
      );
    }

    if (hasGroup('reports')) {
      const reports = await this.prisma.report.findMany({
        include: { admin: { select: { adminName: true } } },
        orderBy: { createdAt: 'desc' },
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          reports.map((r) => ({
            ID: r.id,
            Title: r.title,
            'Report URL': r.reportUrl ?? '',
            'Admin Name': r.admin.adminName ?? '',
            'Created At': r.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Reports',
      );

      const replies = await this.prisma.replyReport.findMany({
        include: { admin: { select: { adminName: true } } },
        orderBy: { createdAt: 'asc' },
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          replies.map((rr) => ({
            ID: rr.id,
            Content: rr.content,
            'Reply Name': rr.replyName ?? '',
            'Admin Name': rr.admin.adminName ?? '',
            'Report ID': rr.reportId,
            'Created At': rr.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Report Replies',
      );
    }

    if (hasGroup('research')) {
      const research = await this.prisma.research.findMany({
        include: { owner: { select: { adminName: true } } },
        orderBy: { createdAt: 'desc' },
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          research.map((r) => ({
            ID: r.id,
            Title: r.title,
            Slug: r.slug,
            Type: r.type,
            Status: r.status,
            Summary: r.summary ?? '',
            Owner: r.owner.adminName ?? '',
            'Start Date': r.startDate ? r.startDate.toISOString().split('T')[0] : '',
            'End Date': r.endDate ? r.endDate.toISOString().split('T')[0] : '',
            'Created At': r.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Research',
      );
    }

    if (hasGroup('meetings')) {
      const meetings = await this.prisma.meeting.findMany({
        include: { createdBy: { select: { adminName: true } } },
        orderBy: { startTime: 'desc' },
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          meetings.map((m) => ({
            ID: m.id,
            Title: m.title,
            Status: m.status,
            Location: m.location ?? '',
            'Meeting Link': m.meetingLink ?? '',
            'Start Time': m.startTime.toISOString(),
            'End Time': m.endTime ? m.endTime.toISOString() : '',
            'Created By': m.createdBy.adminName ?? '',
            'Created At': m.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Meetings',
      );
    }

    if (hasGroup('internships')) {
      const apps = await this.prisma.internshipApplication.findMany({ orderBy: { createdAt: 'desc' } });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          apps.map((a) => ({
            ID: a.id,
            'Full Name': a.fullName,
            Email: a.email,
            Phone: a.phone ?? '',
            Institution: a.institution ?? '',
            'Field of Study': a.fieldOfStudy ?? '',
            'Internship Type': a.internshipType,
            Period: a.period ?? '',
            Status: a.status,
            'Employment Status': a.employmentStatus ?? '',
            Country: a.country ?? '',
            City: a.city ?? '',
            Score: a.score ?? '',
            'Is Shortlisted': a.isShortlisted ? 'Yes' : 'No',
            'Created At': a.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Internship Applications',
      );
    }

    if (hasGroup('hostedWebsites')) {
      const sites = await this.prisma.hostedWebsite.findMany({ orderBy: { name: 'asc' } });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          sites.map((s) => ({
            ID: s.id,
            Name: s.name,
            Domain: s.domain,
            Description: s.description ?? '',
            Status: s.status,
            'Created At': s.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Hosted Websites',
      );
    }

    if (hasGroup('weeklyGoals')) {
      const goals = await this.prisma.weeklyGoal.findMany({
        include: { owner: { select: { adminName: true } } },
        orderBy: { weekStart: 'desc' },
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          goals.map((g) => ({
            ID: g.id,
            Title: g.title,
            Description: g.description ?? '',
            'Week Start': g.weekStart.toISOString().split('T')[0],
            'Week End': g.weekEnd.toISOString().split('T')[0],
            Status: g.status,
            Progress: g.progress,
            Owner: g.owner.adminName ?? '',
            'Created At': g.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Weekly Goals',
      );
    }

    if (hasGroup('demoRequests')) {
      const demos = await this.prisma.demoRequest.findMany({ orderBy: { createdAt: 'desc' } });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          demos.map((d) => ({
            ID: d.id,
            'Full Name': d.fullName,
            Email: d.email,
            Phone: d.phone ?? '',
            Company: d.companyName ?? '',
            Product: d.product ?? '',
            'Demo Type': d.demoType,
            Status: d.status,
            'Preferred Date': d.preferredDate ? d.preferredDate.toISOString().split('T')[0] : '',
            'Internal Notes': d.internalNotes ?? '',
            'Created At': d.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Demo Requests',
      );
    }

    if (hasGroup('notifications')) {
      const notifs = await this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          notifs.map((n) => ({
            ID: n.id,
            Title: n.title,
            Message: n.message,
            'Sender Type': n.senderType ?? '',
            'Created At': n.createdAt.toISOString().split('T')[0],
          })),
        ),
        'Notifications',
      );
    }

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportPdf(options: {
    groups?: string[];
    adminId: string;
    adminName: string;
  }) {
    const PDFDocument = require('pdfkit');
    const { groups = [] } = options;
    const hasGroup = (g: string) => groups.length === 0 || groups.includes(g);

    const [adminCount, permCount, adminPermCount] = await Promise.all([
      this.prisma.admin.count(),
      this.prisma.permission.count(),
      this.prisma.adminPermission.count(),
    ]);

    const extra: Record<string, number> = {};
    if (hasGroup('expenses')) extra['Expenses'] = await this.prisma.expense.count();
    if (hasGroup('salaries')) extra['Salaries'] = await this.prisma.salary.count();
    if (hasGroup('reports')) {
      extra['Reports'] = await this.prisma.report.count();
      extra['Report Replies'] = await this.prisma.replyReport.count();
    }
    if (hasGroup('research')) extra['Research'] = await this.prisma.research.count();
    if (hasGroup('meetings')) extra['Meetings'] = await this.prisma.meeting.count();
    if (hasGroup('internships')) extra['Internship Applications'] = await this.prisma.internshipApplication.count();
    if (hasGroup('hostedWebsites')) extra['Hosted Websites'] = await this.prisma.hostedWebsite.count();
    if (hasGroup('weeklyGoals')) extra['Weekly Goals'] = await this.prisma.weeklyGoal.count();
    if (hasGroup('demoRequests')) extra['Demo Requests'] = await this.prisma.demoRequest.count();
    if (hasGroup('notifications')) extra['Notifications'] = await this.prisma.notification.count();

    const ORG = '#E8621A';
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const pageW = doc.page.width - 100;

    // ── Header ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(ORG);
    doc.fillColor('#fff').fontSize(22).font('Helvetica-Bold').text('ABYTECH HUB', 50, 28);
    doc.fontSize(10).font('Helvetica').text('Data Export Report', 50, 54);
    doc.fillColor('#000');

    // ── Meta ─────────────────────────────────────────────────────────────
    doc.moveDown(4.5);
    doc.fontSize(10).fillColor('#555').text(`Exported by: ${options.adminName}  |  Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    // ── KPI Strip ─────────────────────────────────────────────────────────
    doc.moveDown(1);
    const kpis = [
      { label: 'Admins', value: adminCount },
      { label: 'Permissions', value: permCount },
      { label: 'Assignments', value: adminPermCount },
      ...Object.entries(extra).map(([label, value]) => ({ label, value })),
    ];

    const cols = Math.min(kpis.length, 4);
    const cardW = (pageW - (cols - 1) * 10) / cols;
    let cx = 50;
    const cy = doc.y;

    kpis.slice(0, 4).forEach((kpi) => {
      doc.rect(cx, cy, cardW, 56).fillAndStroke('#fff8f4', ORG);
      doc.fillColor(ORG).fontSize(22).font('Helvetica-Bold').text(String(kpi.value), cx + 8, cy + 8, { width: cardW - 16, align: 'center' });
      doc.fillColor('#555').fontSize(9).font('Helvetica').text(kpi.label, cx + 8, cy + 36, { width: cardW - 16, align: 'center' });
      cx += cardW + 10;
    });

    // Second row of KPIs
    if (kpis.length > 4) {
      const kpis2 = kpis.slice(4, 8);
      const cols2 = Math.min(kpis2.length, 4);
      const cardW2 = (pageW - (cols2 - 1) * 10) / cols2;
      let cx2 = 50;
      const cy2 = cy + 70;
      kpis2.forEach((kpi) => {
        doc.rect(cx2, cy2, cardW2, 56).fillAndStroke('#fff8f4', ORG);
        doc.fillColor(ORG).fontSize(22).font('Helvetica-Bold').text(String(kpi.value), cx2 + 8, cy2 + 8, { width: cardW2 - 16, align: 'center' });
        doc.fillColor('#555').fontSize(9).font('Helvetica').text(kpi.label, cx2 + 8, cy2 + 36, { width: cardW2 - 16, align: 'center' });
        cx2 += cardW2 + 10;
      });
      doc.y = cy2 + 60;
    } else {
      doc.y = cy + 66;
    }

    // ── Admin table ──────────────────────────────────────────────────────
    doc.addPage();
    doc.fillColor(ORG).fontSize(14).font('Helvetica-Bold').text('Admins', 50, 50);
    doc.fillColor('#000').moveDown(0.5);

    const admins = await this.prisma.admin.findMany({ orderBy: { adminEmail: 'asc' } });
    const aHeaders = ['Name', 'Email', 'Super Admin', 'Status', 'Joined'];
    const aWidths = [130, 180, 70, 60, 80];
    this.drawTable(doc, aHeaders, aWidths, admins.map((a) => [
      a.adminName ?? '—',
      a.adminEmail ?? '—',
      a.isSuperAdmin ? 'Yes' : 'No',
      a.status,
      a.joinedDate ? a.joinedDate.toISOString().split('T')[0] : '—',
    ]), ORG);

    // ── Permissions table ─────────────────────────────────────────────────
    doc.addPage();
    doc.fillColor(ORG).fontSize(14).font('Helvetica-Bold').text('Permissions', 50, 50);
    doc.fillColor('#000').moveDown(0.5);
    const perms = await this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
    this.drawTable(doc, ['Permission Name', 'Description'], [200, 320], perms.map((p) => [p.name, p.description ?? '—']), ORG);

    // ── Optional data summary ─────────────────────────────────────────────
    if (Object.keys(extra).length > 0) {
      doc.addPage();
      doc.fillColor(ORG).fontSize(14).font('Helvetica-Bold').text('Data Summary', 50, 50);
      doc.fillColor('#000').moveDown(0.5);
      this.drawTable(doc, ['Entity', 'Count'], [300, 100], Object.entries(extra).map(([k, v]) => [k, String(v)]), ORG);
    }

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }

  private drawTable(doc: any, headers: string[], widths: number[], rows: string[][], accentColor: string) {
    const rowH = 22;
    const x0 = 50;
    let y = doc.y;

    // Header row
    doc.rect(x0, y, widths.reduce((a, b) => a + b, 0), rowH).fill(accentColor);
    let x = x0;
    headers.forEach((h, i) => {
      doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold').text(h, x + 4, y + 6, { width: widths[i] - 8 });
      x += widths[i];
    });
    y += rowH;

    rows.forEach((row, ri) => {
      if (y + rowH > doc.page.height - 60) {
        doc.addPage();
        y = 50;
      }
      const bg = ri % 2 === 0 ? '#fff' : '#fff8f4';
      doc.rect(x0, y, widths.reduce((a, b) => a + b, 0), rowH).fill(bg);
      x = x0;
      row.forEach((cell, ci) => {
        doc.fillColor('#222').fontSize(8).font('Helvetica').text(String(cell ?? '').substring(0, 80), x + 4, y + 6, { width: widths[ci] - 8, ellipsis: true });
        x += widths[ci];
      });
      y += rowH;
    });

    doc.y = y + 10;
  }
}
