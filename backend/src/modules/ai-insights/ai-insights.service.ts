import {
  Injectable,
  ServiceUnavailableException,
  BadGatewayException,
  ForbiddenException,
} from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { PrismaService } from 'src/prisma/prisma.service';
import { Insights, InsightsSchema } from './ai-insights.schema';

const MODEL = 'claude-opus-5-5';
// Claude calls cost money and take time; reuse a result for this long unless refreshed
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REPORT_EXCERPT_CHARS = 600;
const MAX_REPORT_EXCERPTS = 25;

const SYSTEM_PROMPT = `You are the operations analyst for Abytech Hub, a Rwandan tech company. You receive a JSON snapshot of the company's internal records: expenses (with whether money is already USED or PLANNED for later), salaries, employee reports, weekly goals, meetings, research and upcoming schedules. All money is in Rwandan Francs (RWF).

Analyse the data and fill every field of the requested output:
- Base every number and claim on the snapshot. When data is too thin for a trend or forecast, say so plainly, use trend "insufficient_data", and give a cautious forecast.
- Forecasts are for the calendar month after the snapshot date. Explain the reasoning briefly.
- For reports, read the excerpts to identify recurring themes, blockers and achievements, and rate each employee's reporting activity relative to the period length.
- Recommendations must be concrete actions a manager could take this week.
- Write for a busy manager: short, specific sentences. No markdown.`;

type Cached = { insights: Insights; generatedAt: string; periodMonths: number };

// Pull human-readable text out of rich-text JSON (TipTap/Quill) or plain strings
const extractText = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join(' ');
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.insert === 'string') return obj.insert;
    return Object.values(obj).map(extractText).filter(Boolean).join(' ');
  }
  return '';
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const countBy = <T>(items: T[], key: (item: T) => string) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

const sumBy = <T>(items: T[], key: (item: T) => string, value: (item: T) => number) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = Math.round(((acc[k] || 0) + value(item)) * 100) / 100;
    return acc;
  }, {});

@Injectable()
export class AiInsightsService {
  private client: Anthropic | null = null;
  private cache: Cached | null = null;
  private pending: Promise<Cached> | null = null;

  constructor(private prisma: PrismaService) {}

  // Created on first use so .env (loaded by Prisma at startup) is already in process.env
  private getClient(): Anthropic {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ServiceUnavailableException('AI predictions are not configured: ANTHROPIC_API_KEY is missing');
    }
    if (!this.client) this.client = new Anthropic(); // reads ANTHROPIC_API_KEY
    return this.client;
  }

  async assertSuperAdmin(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { isSuperAdmin: true },
    });
    if (!admin?.isSuperAdmin) {
      throw new ForbiddenException('Only super admins can view AI predictions');
    }
  }

  async getInsights(months: number, refresh: boolean): Promise<Cached> {
    const fresh =
      this.cache &&
      this.cache.periodMonths === months &&
      Date.now() - new Date(this.cache.generatedAt).getTime() < CACHE_TTL_MS;
    if (fresh && !refresh) return this.cache!;

    // Collapse concurrent requests into one Claude call
    if (!this.pending) {
      this.pending = this.generate(months)
        .then((result) => (this.cache = result))
        .finally(() => (this.pending = null));
    }
    return this.pending;
  }

  private async generate(months: number): Promise<Cached> {
    const client = this.getClient();
    const snapshot = await this.buildSnapshot(months);

    let response;
    try {
      response = await client.beta.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        output_config: { effort: 'medium', format: betaZodOutputFormat(InsightsSchema) },
        // If a safety classifier declines, re-run on Anthropic's recommended fallback model
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        messages: [
          {
            role: 'user',
            content: `Company data snapshot:\n${JSON.stringify(snapshot)}`,
          },
        ],
      });
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        throw new ServiceUnavailableException('AI predictions failed: the Anthropic API key is invalid');
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new ServiceUnavailableException('AI service is busy (rate limited). Try again in a minute.');
      }
      if (error instanceof Anthropic.APIError) {
        console.error('Claude API error:', error.status, error.message);
        throw new BadGatewayException('AI service error. Please try again later.');
      }
      throw error;
    }

    if (response.stop_reason === 'refusal') {
      throw new BadGatewayException('The AI declined to analyse this data.');
    }
    if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
      throw new BadGatewayException('The AI returned an incomplete analysis. Please regenerate.');
    }

    return {
      insights: response.parsed_output,
      generatedAt: new Date().toISOString(),
      periodMonths: months,
    };
  }

  // Aggregated, compact view of the database for the prompt
  private async buildSnapshot(months: number) {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [admins, expenses, salaries, reports, goals, meetings, research, calendarEvents] = await Promise.all([
      this.prisma.admin.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, adminName: true },
      }),
      this.prisma.expense.findMany({
        where: { OR: [{ createdAt: { gte: since } }, { usageDate: { gte: now } }] },
        select: {
          title: true, amount: true, status: true, usageStatus: true, usageDate: true,
          createdAt: true, receiptUrl: true,
        },
      }),
      this.prisma.salary.findMany({
        where: { OR: [{ year: { gt: since.getFullYear() } }, { year: since.getFullYear(), month: { gte: since.getMonth() + 1 } }] },
        select: { month: true, year: true, netAmount: true, status: true },
      }),
      this.prisma.report.findMany({
        where: { createdAt: { gte: since } },
        select: { title: true, content: true, createdAt: true, adminId: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.weeklyGoal.findMany({
        where: { weekStart: { gte: since } },
        select: { status: true, progress: true, ownerId: true, weekStart: true },
      }),
      this.prisma.meeting.findMany({
        where: { OR: [{ startTime: { gte: since } }] },
        select: { title: true, startTime: true, status: true },
      }),
      this.prisma.research.findMany({
        where: { updatedAt: { gte: since } },
        select: { title: true, type: true, status: true },
      }),
      this.prisma.calendarEvent.findMany({
        where: { startTime: { gte: now, lte: in14Days } },
        select: { adminId: true, startTime: true },
      }),
    ]);

    const nameOf = new Map(admins.map((a) => [a.id, a.adminName || 'Unnamed']));
    const name = (id: string) => nameOf.get(id) || 'Former employee';

    const usedExpenses = expenses.filter((e) => e.usageStatus === 'USED');
    const plannedUpcoming = expenses.filter((e) => e.usageStatus === 'PLANNED' && e.usageDate && e.usageDate >= now);

    return {
      snapshotDate: now.toISOString().slice(0, 10),
      periodMonths: months,
      periodStart: since.toISOString().slice(0, 10),
      activeEmployees: admins.map((a) => a.adminName || 'Unnamed'),

      expenses: {
        count: expenses.length,
        totalByMonth: sumBy(expenses.filter((e) => e.createdAt >= since), (e) => monthKey(e.createdAt), (e) => e.amount),
        countByStatus: countBy(expenses, (e) => e.status),
        amountByStatus: sumBy(expenses, (e) => e.status, (e) => e.amount),
        largest: [...expenses]
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10)
          .map((e) => ({ title: e.title, amount: e.amount, status: e.status, usage: e.usageStatus })),
      },

      moneyUsage: {
        usedTotal: usedExpenses.reduce((s, e) => s + e.amount, 0),
        usedByMonth: sumBy(usedExpenses.filter((e) => e.usageDate), (e) => monthKey(e.usageDate!), (e) => e.amount),
        usedWithoutReceipt: usedExpenses.filter((e) => !e.receiptUrl).length,
        plannedUpcomingTotal: plannedUpcoming.reduce((s, e) => s + e.amount, 0),
        plannedUpcoming: plannedUpcoming
          .sort((a, b) => a.usageDate!.getTime() - b.usageDate!.getTime())
          .slice(0, 20)
          .map((e) => ({ title: e.title, amount: e.amount, plannedDate: e.usageDate!.toISOString().slice(0, 10), approval: e.status })),
      },

      salaries: {
        netByMonth: sumBy(salaries, (s) => `${s.year}-${String(s.month).padStart(2, '0')}`, (s) => s.netAmount),
        countByStatus: countBy(salaries, (s) => s.status),
      },

      reports: {
        total: reports.length,
        perEmployee: Object.fromEntries(
          admins.map((a) => {
            const mine = reports.filter((r) => r.adminId === a.id);
            return [a.adminName || 'Unnamed', {
              count: mine.length,
              lastReport: mine[0]?.createdAt.toISOString().slice(0, 10) ?? null,
            }];
          }),
        ),
        recentExcerpts: reports.slice(0, MAX_REPORT_EXCERPTS).map((r) => ({
          author: name(r.adminId),
          date: r.createdAt.toISOString().slice(0, 10),
          title: r.title,
          excerpt: extractText(r.content).replace(/\s+/g, ' ').trim().slice(0, REPORT_EXCERPT_CHARS),
        })),
      },

      weeklyGoals: {
        total: goals.length,
        countByStatus: countBy(goals, (g) => g.status),
        perEmployee: Object.fromEntries(
          admins.map((a) => {
            const mine = goals.filter((g) => g.ownerId === a.id);
            const avg = mine.length ? Math.round(mine.reduce((s, g) => s + g.progress, 0) / mine.length) : null;
            return [a.adminName || 'Unnamed', { goals: mine.length, completed: mine.filter((g) => g.status === 'COMPLETED').length, avgProgress: avg }];
          }),
        ),
      },

      meetings: {
        countByStatus: countBy(meetings, (m) => m.status),
        upcoming14Days: meetings
          .filter((m) => m.startTime >= now && m.startTime <= in14Days)
          .map((m) => ({ title: m.title, date: m.startTime.toISOString().slice(0, 16) })),
      },

      research: {
        countByStatus: countBy(research, (r) => r.status),
        countByType: countBy(research, (r) => r.type),
        titles: research.slice(0, 15).map((r) => `${r.title} (${r.status})`),
      },

      // Personal calendars: only workload counts, not event details
      schedule: {
        calendarEventsNext14DaysPerEmployee: countBy(calendarEvents, (c) => name(c.adminId)),
      },
    };
  }
}
