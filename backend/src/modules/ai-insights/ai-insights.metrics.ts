// Deterministic numbers for the AI Predictions page. Everything here is plain
// arithmetic on the database records, so admins can trust and re-check it; the
// AI only explains these numbers and adds advice on top.

export type RawData = {
  now: Date;
  since: Date;
  months: number;
  admins: { id: string; adminName: string | null }[];
  expenses: {
    title: string; amount: number; status: string; usageStatus: string;
    usageDate: Date | null; createdAt: Date; receiptUrl: string | null;
  }[];
  salaries: { month: number; year: number; netAmount: number; status: string }[];
  reports: { createdAt: Date; adminId: string }[];
  goals: { status: string; progress: number; ownerId: string }[];
  meetings: { startTime: Date; status: string }[];
  research: { status: string; type: string }[];
  calendarEvents: { adminId: string; startTime: Date }[];
};

export type Point = { month: string; value: number };
export type Factor = { label: string; detail: string; points: number; max: number };
export type Score = { value: number | null; grade: string; factors: Factor[] };
export type Target = { label: string; value: string };
export type Forecast = { value: number; low: number; high: number; method: string };

const DAY_MS = 24 * 60 * 60 * 1000;

const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};
const pct = (part: number, whole: number) => (whole > 0 ? round((part / whole) * 100, 1) : null);
const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);
const avg = (values: number[]) => (values.length ? sum(values) / values.length : 0);
const rwf = (n: number) => `${Math.round(n).toLocaleString('en-US')} RWF`;
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const stdDev = (values: number[]) => {
  if (values.length < 2) return 0;
  const m = avg(values);
  return Math.sqrt(sum(values.map((v) => (v - m) ** 2)) / (values.length - 1));
};

export const gradeOf = (score: number | null) =>
  score == null ? 'No data' : score >= 80 ? 'Strong' : score >= 60 ? 'Good' : score >= 40 ? 'Needs attention' : 'Critical';

const makeScore = (factors: Factor[] | null): Score => {
  if (!factors) return { value: null, grade: gradeOf(null), factors: [] };
  const value = Math.round(sum(factors.map((f) => f.points)));
  return { value, grade: gradeOf(value), factors };
};

// Every month of the period, zero-filled, so averages are not inflated by empty months
const monthSeries = <T>(items: T[], since: Date, now: Date, date: (i: T) => Date | null, value: (i: T) => number): Point[] => {
  const totals = new Map<string, number>();
  for (const item of items) {
    const d = date(item);
    if (d) totals.set(monthKey(d), (totals.get(monthKey(d)) || 0) + value(item));
  }
  const points: Point[] = [];
  for (let d = new Date(since.getFullYear(), since.getMonth(), 1); d <= now; d.setMonth(d.getMonth() + 1)) {
    points.push({ month: monthKey(d), value: round(totals.get(monthKey(d)) || 0) });
  }
  return points;
};

// Forecast next month from full months only (the current month is still in progress)
const forecastNext = (series: Point[], now: Date): Forecast => {
  const full = series.slice(0, -1).map((p) => p.value);
  const spread = stdDev(full);
  const withRange = (value: number, method: string): Forecast => ({
    value: round(Math.max(0, value)),
    low: round(Math.max(0, value - spread)),
    high: round(value + spread),
    method,
  });

  if (full.length >= 3) {
    // Least-squares trend line, extended one month past the current one
    const n = full.length;
    const xs = full.map((_, i) => i);
    const mx = avg(xs);
    const my = avg(full);
    const slope = sum(xs.map((x, i) => (x - mx) * (full[i] - my))) / sum(xs.map((x) => (x - mx) ** 2));
    return withRange(my + slope * (n + 1 - mx), `Trend line over the last ${n} full months`);
  }
  if (full.length >= 1) {
    return withRange(avg(full), `Average of the last ${full.length} full month${full.length > 1 ? 's' : ''}`);
  }
  // Only the current, partial month: project its pace to a full month
  const current = series[series.length - 1]?.value || 0;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return withRange((current / now.getDate()) * daysInMonth, 'Current month pace projected to a full month');
};

// Change of the last full month vs the average of the full months before it
const lastMonthChange = (series: Point[]) => {
  const full = series.slice(0, -1).map((p) => p.value);
  if (full.length < 2) return null;
  const last = full[full.length - 1];
  const before = avg(full.slice(0, -1));
  return before > 0 ? round(((last - before) / before) * 100, 1) : null;
};

const stepPoints = (value: number, steps: [number, number][], fallback: number) => {
  for (const [limit, points] of steps) if (value <= limit) return points;
  return fallback;
};

export function computeMetrics(raw: RawData) {
  const { now, since, months, admins, expenses, salaries, reports, goals, meetings, research, calendarEvents } = raw;
  const employeeCount = admins.length;
  const periodWeeks = Math.max(1, (now.getTime() - since.getTime()) / (7 * DAY_MS));

  // ── Expenses ──
  const periodExpenses = expenses.filter((e) => e.createdAt >= since);
  const expenseSeries = monthSeries(periodExpenses, since, now, (e) => e.createdAt, (e) => e.amount);
  const expenseTotal = sum(periodExpenses.map((e) => e.amount));
  const expenseFullMonths = expenseSeries.slice(0, -1).map((p) => p.value);
  const expenseAvg = expenseFullMonths.length ? avg(expenseFullMonths) : expenseTotal;
  const expenseForecast = forecastNext(expenseSeries, now);
  const expenseChange = lastMonthChange(expenseSeries);
  const decidedExpenses = periodExpenses.filter((e) => e.status !== 'PENDING').length;
  const pendingExpenses = periodExpenses.filter((e) => e.status === 'PENDING');
  const top3Share = pct(sum([...periodExpenses].sort((a, b) => b.amount - a.amount).slice(0, 3).map((e) => e.amount)), expenseTotal);

  const expenseScore = makeScore(periodExpenses.length ? [
    {
      label: 'Spending trend',
      detail: expenseChange == null ? 'Not enough full months to compare' : `Last full month ${expenseChange >= 0 ? '+' : ''}${expenseChange}% vs earlier average`,
      points: expenseChange == null ? 20 : stepPoints(expenseChange, [[0, 40], [10, 30], [25, 20], [50, 10]], 0),
      max: 40,
    },
    {
      label: 'Approval follow-up',
      detail: `${pct(decidedExpenses, periodExpenses.length)}% of expenses approved, rejected or completed`,
      points: round(((pct(decidedExpenses, periodExpenses.length) || 0) / 100) * 30),
      max: 30,
    },
    {
      label: 'Spending spread',
      detail: `Top 3 expenses are ${top3Share}% of the total`,
      points: periodExpenses.length <= 3 ? 15 : round(Math.min(30, Math.max(0, ((100 - (top3Share || 0)) / 50) * 30))),
      max: 30,
    },
  ] : null);

  // ── Money usage ──
  const used = expenses.filter((e) => e.usageStatus === 'USED' && e.usageDate && e.usageDate >= since);
  const planned = expenses.filter((e) => e.usageStatus === 'PLANNED' && e.usageDate && e.usageDate >= now);
  const usedSeries = monthSeries(used, since, now, (e) => e.usageDate, (e) => e.amount);
  const usedTotal = sum(used.map((e) => e.amount));
  const plannedTotal = sum(planned.map((e) => e.amount));
  const usedMonthlyAvg = usedTotal / Math.max(1, months);
  const withReceipt = used.filter((e) => e.receiptUrl).length;
  const receiptCoverage = pct(withReceipt, used.length);
  const plannedVsUsual = usedMonthlyAvg > 0 ? round(plannedTotal / usedMonthlyAvg, 2) : null;
  const plannedNext30 = sum(planned.filter((e) => e.usageDate!.getTime() <= now.getTime() + 30 * DAY_MS).map((e) => e.amount));

  const moneyScore = makeScore(used.length || planned.length ? [
    {
      label: 'Receipts attached',
      detail: used.length ? `${withReceipt} of ${used.length} used expenses have a receipt` : 'No money used yet in this period',
      points: used.length ? round(((receiptCoverage || 0) / 100) * 50) : 25,
      max: 50,
    },
    {
      label: 'Planned vs usual spending',
      detail: plannedVsUsual == null ? 'No usage history to compare against' : `Planned money is ${plannedVsUsual}× a normal month of usage`,
      points: plannedVsUsual == null ? 25 : stepPoints(plannedVsUsual, [[1, 50], [1.5, 35], [2, 20]], 5),
      max: 50,
    },
  ] : null);

  // ── Salaries ──
  const salarySeries = monthSeries(salaries, since, now, (s) => new Date(s.year, s.month - 1, 1), (s) => s.netAmount);
  const salaryValues = salarySeries.map((p) => p.value).filter((v) => v > 0);
  const salaryTotal = sum(salaries.map((s) => s.netAmount));
  const paidCount = salaries.filter((s) => s.status === 'PAID').length;
  const unpaidAmount = sum(salaries.filter((s) => s.status === 'PENDING' || s.status === 'APPROVED').map((s) => s.netAmount));
  const salaryCv = salaryValues.length >= 2 ? stdDev(salaryValues) / avg(salaryValues) : null;
  const salaryShare = pct(salaryTotal, salaryTotal + expenseTotal);
  const salaryForecast = forecastNext(salarySeries, now);

  const salaryScore = makeScore(salaries.length ? [
    {
      label: 'Salaries paid',
      detail: `${paidCount} of ${salaries.length} salary records are paid`,
      points: round(((pct(paidCount, salaries.length) || 0) / 100) * 60),
      max: 60,
    },
    {
      label: 'Payroll stability',
      detail: salaryCv == null ? 'Need at least 2 months of payroll to compare' : `Monthly payroll varies by ${round(salaryCv * 100)}%`,
      points: salaryCv == null ? 20 : stepPoints(salaryCv, [[0.1, 40], [0.25, 28], [0.5, 15]], 5),
      max: 40,
    },
  ] : null);

  // ── Reports ──
  const reportSeries = monthSeries(reports, since, now, (r) => r.createdAt, () => 1);
  const reportsPerEmployee = admins.map((a) => {
    const mine = reports.filter((r) => r.adminId === a.id);
    const last = mine.reduce<Date | null>((d, r) => (!d || r.createdAt > d ? r.createdAt : d), null);
    return {
      name: a.adminName || 'Unnamed',
      count: mine.length,
      perWeek: round(mine.length / periodWeeks, 2),
      daysSinceLast: last ? Math.floor((now.getTime() - last.getTime()) / DAY_MS) : null,
    };
  }).sort((a, b) => b.count - a.count);
  const reporters = reportsPerEmployee.filter((e) => e.count > 0).length;
  const reportsPerEmployeeWeek = employeeCount ? reports.length / employeeCount / periodWeeks : 0;

  const reportScore = makeScore(employeeCount ? [
    {
      label: 'Team coverage',
      detail: `${reporters} of ${employeeCount} employees submitted at least one report`,
      points: round(((pct(reporters, employeeCount) || 0) / 100) * 50),
      max: 50,
    },
    {
      label: 'Reporting frequency',
      detail: `${round(reportsPerEmployeeWeek, 2)} reports per employee per week (target: 1)`,
      points: round(Math.min(1, reportsPerEmployeeWeek) * 50),
      max: 50,
    },
  ] : null);

  // ── Weekly goals ──
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
  const missedGoals = goals.filter((g) => g.status === 'MISSED').length;
  const goalCompletion = pct(completedGoals, goals.length);
  const goalAvgProgress = goals.length ? round(avg(goals.map((g) => g.progress)), 1) : null;
  const goalsPerEmployee = admins.map((a) => {
    const mine = goals.filter((g) => g.ownerId === a.id);
    return {
      name: a.adminName || 'Unnamed',
      goals: mine.length,
      completed: mine.filter((g) => g.status === 'COMPLETED').length,
      completionRate: pct(mine.filter((g) => g.status === 'COMPLETED').length, mine.length),
      avgProgress: mine.length ? round(avg(mine.map((g) => g.progress))) : null,
    };
  }).sort((a, b) => (b.completionRate ?? -1) - (a.completionRate ?? -1));

  const goalScore = makeScore(goals.length ? [
    { label: 'Goals completed', detail: `${completedGoals} of ${goals.length} goals completed`, points: round(((goalCompletion || 0) / 100) * 60), max: 60 },
    { label: 'Average progress', detail: `Goals are on average ${goalAvgProgress}% done`, points: round(((goalAvgProgress || 0) / 100) * 40), max: 40 },
  ] : null);

  // ── Schedule ──
  const in14Days = new Date(now.getTime() + 14 * DAY_MS);
  const pastMeetings = meetings.filter((m) => m.startTime < now);
  const cancelled = pastMeetings.filter((m) => m.status === 'CANCELLED').length;
  const cancelRate = pct(cancelled, pastMeetings.length);
  const upcomingMeetings = meetings.filter((m) => m.startTime >= now && m.startTime <= in14Days).length;
  const eventsPerEmployee = admins.map((a) => ({
    name: a.adminName || 'Unnamed',
    events: calendarEvents.filter((c) => c.adminId === a.id).length,
  })).sort((a, b) => b.events - a.events);
  const planners = eventsPerEmployee.filter((e) => e.events > 0).length;

  const scheduleScore = makeScore(meetings.length || calendarEvents.length ? [
    {
      label: 'Meetings held',
      detail: pastMeetings.length ? `${cancelled} of ${pastMeetings.length} past meetings were cancelled` : 'No past meetings in this period',
      points: pastMeetings.length ? round((1 - (cancelRate || 0) / 100) * 50) : 25,
      max: 50,
    },
    {
      label: 'Team planning ahead',
      detail: `${planners} of ${employeeCount} employees have work planned in the next 14 days`,
      points: round(((pct(planners, employeeCount) || 0) / 100) * 50),
      max: 50,
    },
  ] : null);

  // ── Research ──
  const finished = research.filter((r) => r.status === 'COMPLETED' || r.status === 'PUBLISHED').length;
  const active = research.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'REVIEW').length;
  const drafts = research.filter((r) => r.status === 'DRAFT').length;

  const researchScore = makeScore(research.length ? [
    { label: 'Research finished', detail: `${finished} of ${research.length} completed or published`, points: round(((pct(finished, research.length) || 0) / 100) * 60), max: 60 },
    { label: 'Research moving', detail: `${active} in progress or review, ${drafts} still drafts`, points: round(((pct(active, research.length) || 0) / 100) * 40), max: 40 },
  ] : null);

  // ── Overall ──
  const sectionScores = {
    expenses: expenseScore.value, moneyUsage: moneyScore.value, salaries: salaryScore.value,
    reports: reportScore.value, goals: goalScore.value, schedule: scheduleScore.value, research: researchScore.value,
  };
  const scored = Object.values(sectionScores).filter((v): v is number => v != null);
  const overall = scored.length ? Math.round(avg(scored)) : null;

  return {
    overview: {
      score: { value: overall, grade: gradeOf(overall), factors: [] as Factor[] },
      sectionScores,
      totals: {
        employees: employeeCount,
        totalSpending: round(expenseTotal + salaryTotal),
        expenseTotal: round(expenseTotal),
        salaryTotal: round(salaryTotal),
      },
    },
    expenses: {
      score: expenseScore,
      series: expenseSeries,
      total: round(expenseTotal),
      count: periodExpenses.length,
      monthlyAverage: round(expenseAvg),
      lastMonthChangePct: expenseChange,
      forecast: expenseForecast,
      pendingCount: pendingExpenses.length,
      pendingAmount: round(sum(pendingExpenses.map((e) => e.amount))),
      top3SharePct: top3Share,
      targets: [
        { label: 'Spend at most next month (your monthly average)', value: rwf(expenseAvg) },
        {
          label: expenseForecast.value > expenseAvg ? 'Cut needed to stay on average' : 'Room left under average',
          value: rwf(Math.abs(expenseForecast.value - expenseAvg)),
        },
        { label: 'Expenses waiting for a decision', value: `${pendingExpenses.length} (${rwf(sum(pendingExpenses.map((e) => e.amount)))})` },
      ] as Target[],
    },
    moneyUsage: {
      score: moneyScore,
      series: usedSeries,
      usedTotal: round(usedTotal),
      plannedTotal: round(plannedTotal),
      plannedNext30Days: round(plannedNext30),
      usedMonthlyAverage: round(usedMonthlyAvg),
      receiptCoveragePct: receiptCoverage,
      missingReceipts: used.length - withReceipt,
      plannedVsUsualRatio: plannedVsUsual,
      targets: [
        { label: 'Receipts to collect', value: `${used.length - withReceipt}` },
        { label: 'Cash to keep ready for the next 30 days', value: rwf(plannedNext30) },
        { label: 'Months of normal usage already planned', value: plannedVsUsual == null ? '—' : `${plannedVsUsual}` },
      ] as Target[],
    },
    salaries: {
      score: salaryScore,
      series: salarySeries,
      total: round(salaryTotal),
      monthlyAverage: round(salaryValues.length ? avg(salaryValues) : 0),
      forecast: salaryForecast,
      paidPct: pct(paidCount, salaries.length),
      unpaidAmount: round(unpaidAmount),
      shareOfSpendingPct: salaryShare,
      targets: [
        { label: 'Salary money still to pay out', value: rwf(unpaidAmount) },
        { label: 'Payroll share of all spending', value: salaryShare == null ? '—' : `${salaryShare}%` },
        { label: 'Budget to reserve for next month payroll', value: rwf(salaryForecast.high) },
      ] as Target[],
    },
    reports: {
      score: reportScore,
      series: reportSeries,
      total: reports.length,
      perEmployeePerWeek: round(reportsPerEmployeeWeek, 2),
      reportersPct: pct(reporters, employeeCount),
      perEmployee: reportsPerEmployee,
      targets: [
        { label: 'Reports expected per week (1 per employee)', value: `${employeeCount}` },
        { label: 'Reports actually received per week', value: `${round(reports.length / periodWeeks, 1)}` },
        { label: 'Employees with no report in this period', value: `${employeeCount - reporters}` },
      ] as Target[],
    },
    goals: {
      score: goalScore,
      total: goals.length,
      completed: completedGoals,
      missed: missedGoals,
      completionRate: goalCompletion,
      avgProgress: goalAvgProgress,
      perEmployee: goalsPerEmployee,
      targets: [
        { label: 'Extra completed goals needed to reach 80%', value: `${Math.max(0, Math.ceil(goals.length * 0.8) - completedGoals)}` },
        { label: 'Goals missed', value: `${missedGoals}` },
      ] as Target[],
    },
    schedule: {
      score: scheduleScore,
      upcomingMeetings14Days: upcomingMeetings,
      cancelRatePct: cancelRate,
      eventsPerEmployee,
      targets: [
        { label: 'Meetings in the next 14 days', value: `${upcomingMeetings}` },
        { label: 'Employees with nothing planned', value: `${employeeCount - planners}` },
      ] as Target[],
    },
    research: {
      score: researchScore,
      total: research.length,
      finished,
      active,
      drafts,
      byType: research.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.type]: (acc[r.type] || 0) + 1 }), {}),
      targets: [
        { label: 'Drafts to move forward', value: `${drafts}` },
        { label: 'Finish rate', value: pct(finished, research.length) == null ? '—' : `${pct(finished, research.length)}%` },
      ] as Target[],
    },
  };
}

export type Metrics = ReturnType<typeof computeMetrics>;
