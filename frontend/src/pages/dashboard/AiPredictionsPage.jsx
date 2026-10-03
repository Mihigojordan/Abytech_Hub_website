import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus, LayoutDashboard, ShoppingBag, Wallet,
  Banknote, ClipboardList, Target, CalendarDays, Microscope, LineChart, ListChecks, HelpCircle,
  CheckCircle2, AlertTriangle, XCircle, Calculator, Lightbulb, MessageSquareText,
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- used as <motion.div>
import { motion } from 'framer-motion';
import aiInsightsService from '../../services/aiInsightsService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: ShoppingBag },
  { id: 'moneyUsage', label: 'Money Usage', icon: Wallet },
  { id: 'salaries', label: 'Salaries', icon: Banknote },
  { id: 'reports', label: 'Report Performance', icon: ClipboardList },
  { id: 'goals', label: 'Weekly Goals', icon: Target },
  { id: 'schedule', label: 'Work Schedule', icon: CalendarDays },
  { id: 'research', label: 'Research', icon: Microscope },
  { id: 'predictions', label: 'Predictions', icon: LineChart },
  { id: 'recommendations', label: 'Recommendations', icon: ListChecks },
];

const SECTION_LABELS = {
  expenses: 'Expenses', moneyUsage: 'Money Usage', salaries: 'Salaries', reports: 'Reports',
  goals: 'Weekly Goals', schedule: 'Work Schedule', research: 'Research',
};

const PERIODS = [
  { value: 1, label: 'Last month' },
  { value: 3, label: 'Last 3 months' },
  { value: 6, label: 'Last 6 months' },
  { value: 12, label: 'Last 12 months' },
];

const formatRWF = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount || 0);
const formatPct = (v) => (v == null ? '—' : `${v}%`);
const formatMonth = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' });
};

const LEVEL_COLORS = {
  high: '#e84040', medium: ORG, low: TEAL,
  excellent: '#22c55e', good: TEAL, needs_attention: ORG, inactive: '#e84040',
};

// Score grades are states, so each carries an icon + label, never colour alone
const GRADES = {
  Strong: { color: '#22c55e', icon: CheckCircle2 },
  Good: { color: TEAL, icon: CheckCircle2 },
  'Needs attention': { color: ORG, icon: AlertTriangle },
  Critical: { color: '#e84040', icon: XCircle },
  'No data': { color: null, icon: HelpCircle },
};

const section = (extra = {}) => ({ summary: '', meaning: '', points: [], advice: [], ...extra });
const EMPTY_INSIGHTS = {
  overview: section({ headline: '', highlights: [], concerns: [] }),
  expenses: section({ trend: 'insufficient_data', forecastReasoning: '' }),
  moneyUsage: section(),
  salaries: section({ trend: 'insufficient_data' }),
  reports: section({ employees: [] }),
  goals: section(),
  schedule: section(),
  research: section(),
  predictions: [],
  recommendations: [],
};

const AiPredictionsPage = () => {
  const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
  const [months, setMonths] = useState(6);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      setData(await aiInsightsService.getInsights(months, refresh));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { load(); }, [load]);

  const metrics = data?.metrics;
  const hasAI = Boolean(data?.insights);
  const insights = data?.insights || EMPTY_INSIGHTS;

  // ── Small building blocks ──
  const Card = ({ children, style }) => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16, ...style }}>{children}</div>
  );

  const SectionTitle = ({ children, icon: Icon }) => (
    <h3 className="flex items-center gap-2" style={bc(13, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10, marginBottom: 10 })}>
      {Icon && <Icon className="w-4 h-4" style={{ color: ORG }} />}{children}
    </h3>
  );

  const Summary = ({ text }) => (
    !text?.trim() ? null : <Card><p style={ba(14, 400, { color: textC, lineHeight: 1.6 })}>{text}</p></Card>
  );

  const BulletList = ({ title, items, color = ORG }) => (
    !hasAI || !items?.length ? null : <Card>
      <SectionTitle>{title}</SectionTitle>
      {items?.length ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2" style={ba(13, 400, { color: textC, lineHeight: 1.5 })}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: color, flexShrink: 0, marginTop: 7 }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={ba(12, 400, { color: text2 })}>Nothing to show.</p>
      )}
    </Card>
  );

  const Stat = ({ label, value, sub }) => (
    <Card>
      <div style={bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 })}>{label}</div>
      <div style={bb(24, { color: textC, lineHeight: 1.1 })}>{value}</div>
      {sub && <div style={ba(12, 400, { color: text2, marginTop: 6 })}>{sub}</div>}
    </Card>
  );

  const StatGrid = ({ children }) => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>;

  const GradeBadge = ({ grade }) => {
    const g = GRADES[grade] || GRADES['No data'];
    const Icon = g.icon;
    const color = g.color || text2;
    return (
      <span className="inline-flex items-center gap-1" style={{ ...ba(12, 600, { color }), border: `1px solid ${color}`, borderRadius: 999, padding: '2px 10px', whiteSpace: 'nowrap' }}>
        <Icon className="w-3.5 h-3.5" /> {grade}
      </span>
    );
  };

  const TrendBadge = ({ trend }) => {
    const map = {
      increasing: { icon: TrendingUp, label: 'Increasing', color: '#e84040' },
      decreasing: { icon: TrendingDown, label: 'Decreasing', color: '#22c55e' },
      stable: { icon: Minus, label: 'Stable', color: TEAL },
      insufficient_data: { icon: HelpCircle, label: 'Not enough data', color: text2 },
    };
    const t = map[trend] || map.insufficient_data;
    const Icon = t.icon;
    return (
      <span className="inline-flex items-center gap-1" style={{ ...ba(12, 600, { color: t.color }), border: `1px solid ${t.color}`, borderRadius: 999, padding: '2px 10px' }}>
        <Icon className="w-3.5 h-3.5" /> {t.label}
      </span>
    );
  };

  const Pill = ({ level, children }) => (
    <span style={{
      ...bc(10, 700, { color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' }),
      background: LEVEL_COLORS[level] || text3, borderRadius: 3, padding: '2px 8px', whiteSpace: 'nowrap',
    }}>
      {children || level.replace('_', ' ')}
    </span>
  );

  // Horizontal meter: filled share of a track
  const Meter = ({ value, max = 100, color = ORG, height = 8 }) => (
    <div style={{ background: bg3, borderRadius: 999, height, overflow: 'hidden' }}
      role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`, height: '100%', background: color, borderRadius: 999 }} />
    </div>
  );

  // Section score out of 100 with the factors that produced it
  const ScoreCard = ({ score, title = 'Section score' }) => {
    if (!score) return null;
    const color = GRADES[score.grade]?.color || text2;
    return (
      <Card>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div style={bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 })}>{title}</div>
            <div className="flex items-baseline gap-1">
              <span style={bb(36, { color: textC, lineHeight: 1 })}>{score.value ?? '—'}</span>
              <span style={ba(14, 500, { color: text2 })}>/100</span>
            </div>
          </div>
          <GradeBadge grade={score.grade} />
        </div>
        {score.value != null && <div style={{ marginTop: 12 }}><Meter value={score.value} color={color} height={10} /></div>}
        {score.factors?.length > 0 && (
          <div className="space-y-3" style={{ marginTop: 16 }}>
            <div className="flex items-center gap-1.5" style={bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase' })}>
              <Calculator className="w-3.5 h-3.5" /> How this score is calculated
            </div>
            {score.factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between gap-2" style={ba(12, 600, { color: textC })}>
                  <span>{f.label}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{f.points} / {f.max} pts</span>
                </div>
                <div style={{ margin: '4px 0' }}><Meter value={f.points} max={f.max} color={TEAL} height={6} /></div>
                <div style={ba(11, 400, { color: text2 })}>{f.detail}</div>
              </div>
            ))}
          </div>
        )}
        {score.value == null && <p style={ba(12, 400, { color: text2, marginTop: 8 })}>No records in this period, so this section is not scored.</p>}
      </Card>
    );
  };

  // Single-series monthly column chart with hover tooltips and an optional forecast column
  const MonthlyChart = ({ title, series, forecast, format = formatRWF }) => {
    const [hover, setHover] = useState(null);
    if (!series?.length) return null;
    const bars = [
      ...series.map((p) => ({ label: formatMonth(p.month), value: p.value })),
      ...(forecast ? [{ label: 'Next (est.)', value: forecast.value, low: forecast.low, high: forecast.high, isForecast: true }] : []),
    ];
    const max = Math.max(1, ...bars.map((b) => b.high ?? b.value));
    const active = hover != null ? bars[hover] : null;
    return (
      <Card>
        <SectionTitle>{title}</SectionTitle>
        <div style={{ ...ba(12, 500, { color: textC }), minHeight: 18, marginBottom: 6 }}>
          {active
            ? <>{active.label}: <strong>{format(active.value)}</strong>{active.isForecast && <span style={{ color: text2 }}> (range {format(active.low)} – {format(active.high)})</span>}</>
            : <span style={{ color: text2 }}>Hover a column to see its value</span>}
        </div>
        <div className="flex items-end" style={{ height: 160, gap: 2, borderBottom: `1px solid ${border}` }}>
          {bars.map((b, idx) => (
            <div key={b.label} className="flex-1 flex items-end justify-center" style={{ height: '100%', cursor: 'default' }}
              onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)}
              title={`${b.label}: ${format(b.value)}`}>
              <div style={{
                width: '70%', maxWidth: 36,
                height: `${Math.max(b.value > 0 ? 2 : 0, (b.value / max) * 100)}%`,
                background: b.isForecast
                  ? `repeating-linear-gradient(45deg, ${ORG}, ${ORG} 3px, transparent 3px, transparent 6px)`
                  : ORG,
                border: b.isForecast ? `1px solid ${ORG}` : 'none',
                borderRadius: '4px 4px 0 0',
                opacity: hover == null || hover === idx ? 1 : 0.45,
                transition: 'opacity .15s',
              }} />
            </div>
          ))}
        </div>
        <div className="flex" style={{ gap: 2, marginTop: 4 }}>
          {bars.map((b) => (
            <div key={b.label} className="flex-1 text-center" style={ba(10, 400, { color: text2, overflow: 'hidden', whiteSpace: 'nowrap' })}>{b.label}</div>
          ))}
        </div>
        {forecast && (
          <p style={ba(11, 400, { color: text2, marginTop: 8 })}>Striped column = forecast. Method: {forecast.method}.</p>
        )}
      </Card>
    );
  };

  const TargetsCard = ({ targets }) => (
    targets?.length ? (
      <Card>
        <SectionTitle icon={Calculator}>Key numbers & targets</SectionTitle>
        <div className="space-y-2">
          {targets.map((t) => (
            <div key={t.label} className="flex items-center justify-between gap-3"
              style={{ padding: '8px 10px', background: bg3, borderRadius: 4 }}>
              <span style={ba(12, 400, { color: text2 })}>{t.label}</span>
              <span style={ba(13, 700, { color: textC, whiteSpace: 'nowrap' })}>{t.value}</span>
            </div>
          ))}
        </div>
      </Card>
    ) : null
  );

  const MeaningCard = ({ text }) => (
    text ? (
      <Card style={{ borderLeft: `3px solid ${TEAL}` }}>
        <SectionTitle icon={MessageSquareText}>What this means</SectionTitle>
        <p style={ba(13, 400, { color: textC, lineHeight: 1.6 })}>{text}</p>
      </Card>
    ) : null
  );

  const AdviceCard = ({ advice }) => (
    advice?.length ? (
      <Card>
        <SectionTitle icon={Lightbulb}>Advice for this week</SectionTitle>
        <ol className="space-y-3">
          {advice.map((a, idx) => (
            <li key={idx} className="flex gap-3">
              <span style={{
                ...bc(12, 700, { color: '#fff' }), background: ORG, borderRadius: 999, width: 22, height: 22, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{idx + 1}</span>
              <div>
                <p style={ba(13, 600, { color: textC, lineHeight: 1.5 })}>{a.action}</p>
                <p className="flex items-start gap-1" style={ba(12, 400, { color: text2, marginTop: 4, lineHeight: 1.5 })}>
                  <Calculator className="w-3.5 h-3.5 flex-shrink-0" style={{ marginTop: 2 }} /> <span>{a.calculation}</span>
                </p>
                <p style={ba(12, 500, { color: TEAL, marginTop: 2, lineHeight: 1.5 })}>Impact: {a.impact}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    ) : null
  );

  // Score + targets on the left, explanation + advice on the right
  const AnalysisRow = ({ score, targets, meaning, advice }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <div className="space-y-4">
        <ScoreCard score={score} />
        <TargetsCard targets={targets} />
      </div>
      <div className="space-y-4">
        <MeaningCard text={meaning} />
        <AdviceCard advice={advice} />
      </div>
    </div>
  );

  const Table = ({ headers, rows }) => (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${border}`, ...bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }) }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r}>
              {cells.map((c, idx) => (
                <td key={idx} style={{ padding: '10px', borderBottom: `1px solid ${border}`, ...ba(13, idx === 0 ? 600 : 400, { color: textC, whiteSpace: idx === 0 ? 'nowrap' : 'normal' }) }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const AiMissing = () => (
    <Card><p style={ba(13, 400, { color: textC })}>This tab is written by the AI, which is unavailable right now. The other tabs still show all calculated scores and figures.</p></Card>
  );

  const changeText = (v) => (v == null ? 'Not enough months to compare' : `${v >= 0 ? '+' : ''}${v}% last full month vs earlier average`);

  // ── Tab contents ──
  const renderTab = () => {
    const i = insights;
    const m = metrics;
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <Summary text={i.overview.headline} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <div className="space-y-4">
                <ScoreCard score={m.overview.score} title="Overall operations score" />
                <Card>
                  <SectionTitle>Score by section</SectionTitle>
                  <div className="space-y-3">
                    {Object.entries(m.overview.sectionScores).map(([key, value]) => (
                      <button key={key} type="button" onClick={() => setActiveTab(key)} className="w-full text-left"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                        <div className="flex items-center justify-between gap-2" style={ba(12, 600, { color: textC, marginBottom: 4 })}>
                          <span>{SECTION_LABELS[key]}</span>
                          <span>{value == null ? 'No data' : `${value}/100`}</span>
                        </div>
                        <Meter value={value ?? 0} color={value == null ? bg3 : ORG} />
                      </button>
                    ))}
                  </div>
                  <p style={ba(11, 400, { color: text2, marginTop: 10 })}>Overall score = average of the scored sections. Click a section to see how it is calculated.</p>
                </Card>
              </div>
              <div className="space-y-4">
                <MeaningCard text={i.overview.meaning} />
                <AdviceCard advice={i.overview.advice} />
              </div>
            </div>
            <StatGrid>
              <Stat label="Active employees" value={m.overview.totals.employees} />
              <Stat label="Total spending" value={formatRWF(m.overview.totals.totalSpending)} sub="Expenses + salaries in the period" />
              <Stat label="Expense forecast" value={formatRWF(m.expenses.forecast.value)} sub="Next month, from the trend" />
              <Stat label="Goal completion" value={formatPct(m.goals.completionRate)} />
            </StatGrid>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BulletList title="Highlights" items={i.overview.highlights} color="#22c55e" />
              <BulletList title="Concerns" items={i.overview.concerns} color="#e84040" />
            </div>
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-4">
            <StatGrid>
              <Stat label="Total in period" value={formatRWF(m.expenses.total)} sub={`${m.expenses.count} expenses`} />
              <Stat label="Monthly average" value={formatRWF(m.expenses.monthlyAverage)} sub={changeText(m.expenses.lastMonthChangePct)} />
              <Stat label="Trend forecast (next month)" value={formatRWF(m.expenses.forecast.value)}
                sub={`Likely between ${formatRWF(m.expenses.forecast.low)} and ${formatRWF(m.expenses.forecast.high)}`} />
              {hasAI
                ? <Stat label="AI forecast (next month)" value={formatRWF(i.expenses.nextMonthForecast)} sub={<TrendBadge trend={i.expenses.trend} />} />
                : <Stat label="Waiting for a decision" value={formatRWF(m.expenses.pendingAmount)} sub={`${m.expenses.pendingCount} pending expenses`} />}
            </StatGrid>
            <MonthlyChart title="Expenses per month" series={m.expenses.series} forecast={m.expenses.forecast} />
            <AnalysisRow score={m.expenses.score} targets={m.expenses.targets} meaning={i.expenses.meaning} advice={i.expenses.advice} />
            <Summary text={`${i.expenses.summary} ${i.expenses.forecastReasoning}`} />
            <BulletList title="Key points" items={i.expenses.points} />
          </div>
        );
      case 'moneyUsage':
        return (
          <div className="space-y-4">
            <StatGrid>
              <Stat label="Already used" value={formatRWF(m.moneyUsage.usedTotal)} sub={`≈ ${formatRWF(m.moneyUsage.usedMonthlyAverage)} per month`} />
              <Stat label="Planned to use" value={formatRWF(m.moneyUsage.plannedTotal)}
                sub={m.moneyUsage.plannedVsUsualRatio == null ? null : `${m.moneyUsage.plannedVsUsualRatio}× a normal month`} />
              <Stat label="Needed in next 30 days" value={formatRWF(m.moneyUsage.plannedNext30Days)} />
              <Stat label="Receipt coverage" value={formatPct(m.moneyUsage.receiptCoveragePct)} sub={`${m.moneyUsage.missingReceipts} receipts missing`} />
            </StatGrid>
            <MonthlyChart title="Money used per month" series={m.moneyUsage.series} />
            <AnalysisRow score={m.moneyUsage.score} targets={m.moneyUsage.targets} meaning={i.moneyUsage.meaning} advice={i.moneyUsage.advice} />
            <Summary text={i.moneyUsage.summary} />
            <BulletList title="Cash-flow risks & key points" items={i.moneyUsage.points} />
          </div>
        );
      case 'salaries':
        return (
          <div className="space-y-4">
            <StatGrid>
              <Stat label="Payroll in period" value={formatRWF(m.salaries.total)} sub={`≈ ${formatRWF(m.salaries.monthlyAverage)} per month`} />
              <Stat label="Trend forecast (next month)" value={formatRWF(m.salaries.forecast.value)}
                sub={`Likely between ${formatRWF(m.salaries.forecast.low)} and ${formatRWF(m.salaries.forecast.high)}`} />
              {hasAI
                ? <Stat label="AI forecast (next month)" value={formatRWF(i.salaries.nextMonthForecast)} sub={<TrendBadge trend={i.salaries.trend} />} />
                : <Stat label="Share of all spending" value={formatPct(m.salaries.shareOfSpendingPct)} />}
              <Stat label="Paid" value={formatPct(m.salaries.paidPct)} sub={`${formatRWF(m.salaries.unpaidAmount)} still unpaid`} />
            </StatGrid>
            <MonthlyChart title="Net payroll per month" series={m.salaries.series} forecast={m.salaries.forecast} />
            <AnalysisRow score={m.salaries.score} targets={m.salaries.targets} meaning={i.salaries.meaning} advice={i.salaries.advice} />
            <Summary text={i.salaries.summary} />
            <BulletList title="Key points" items={i.salaries.points} />
          </div>
        );
      case 'reports': {
        const aiByName = Object.fromEntries(i.reports.employees.map((e) => [e.name, e]));
        return (
          <div className="space-y-4">
            <StatGrid>
              <Stat label="Reports in period" value={m.reports.total} />
              <Stat label="Per employee per week" value={m.reports.perEmployeePerWeek} sub="Target: 1" />
              <Stat label="Employees reporting" value={formatPct(m.reports.reportersPct)} />
              <Stat label="Team score" value={`${m.reports.score.value ?? '—'}/100`} sub={m.reports.score.grade} />
            </StatGrid>
            <MonthlyChart title="Reports submitted per month" series={m.reports.series} format={(v) => `${v} report${v === 1 ? '' : 's'}`} />
            <AnalysisRow score={m.reports.score} targets={m.reports.targets} meaning={i.reports.meaning} advice={i.reports.advice} />
            <Card>
              <SectionTitle>Employee reporting performance</SectionTitle>
              {m.reports.perEmployee.length ? (
                <Table
                  headers={['Employee', 'Reports', 'Per week', 'Days since last', 'Performance', 'Note']}
                  rows={m.reports.perEmployee.map((e) => [
                    e.name, e.count, e.perWeek, e.daysSinceLast ?? 'Never',
                    aiByName[e.name] ? <Pill level={aiByName[e.name].performance} /> : '—',
                    <span style={{ color: text2, display: 'block', minWidth: 200 }}>{aiByName[e.name]?.note || ''}</span>,
                  ])}
                />
              ) : (
                <p style={ba(12, 400, { color: text2 })}>No employees found.</p>
              )}
            </Card>
            <Summary text={i.reports.summary} />
            <BulletList title="Key themes from reading the reports" items={i.reports.points} color={TEAL} />
          </div>
        );
      }
      case 'goals':
        return (
          <div className="space-y-4">
            <StatGrid>
              <Stat label="Goals set" value={m.goals.total} />
              <Stat label="Completed" value={m.goals.completed} sub={`${formatPct(m.goals.completionRate)} completion`} />
              <Stat label="Missed" value={m.goals.missed} />
              <Stat label="Average progress" value={formatPct(m.goals.avgProgress)} />
            </StatGrid>
            <AnalysisRow score={m.goals.score} targets={m.goals.targets} meaning={i.goals.meaning} advice={i.goals.advice} />
            <Card>
              <SectionTitle>Goals per employee</SectionTitle>
              <Table
                headers={['Employee', 'Goals', 'Completed', 'Completion', 'Avg progress']}
                rows={m.goals.perEmployee.map((e) => [
                  e.name, e.goals, e.completed,
                  e.completionRate == null ? '—' : (
                    <div style={{ minWidth: 120 }}>
                      <div style={ba(12, 600, { color: textC, marginBottom: 4 })}>{e.completionRate}%</div>
                      <Meter value={e.completionRate} />
                    </div>
                  ),
                  formatPct(e.avgProgress),
                ])}
              />
            </Card>
            <Summary text={i.goals.summary} />
            <BulletList title="Key points" items={i.goals.points} />
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <StatGrid>
              <Stat label="Meetings next 14 days" value={m.schedule.upcomingMeetings14Days} />
              <Stat label="Meeting cancel rate" value={formatPct(m.schedule.cancelRatePct)} />
              <Stat label="Planned events (14 days)" value={m.schedule.eventsPerEmployee.reduce((s, e) => s + e.events, 0)} />
              <Stat label="Schedule score" value={`${m.schedule.score.value ?? '—'}/100`} sub={m.schedule.score.grade} />
            </StatGrid>
            <AnalysisRow score={m.schedule.score} targets={m.schedule.targets} meaning={i.schedule.meaning} advice={i.schedule.advice} />
            <Card>
              <SectionTitle>Planned work per employee (next 14 days)</SectionTitle>
              <Table
                headers={['Employee', 'Calendar events']}
                rows={m.schedule.eventsPerEmployee.map((e) => [e.name, e.events])}
              />
            </Card>
            <Summary text={i.schedule.summary} />
            <BulletList title="Coming up & workload" items={i.schedule.points} color={TEAL} />
          </div>
        );
      case 'research':
        return (
          <div className="space-y-4">
            <StatGrid>
              <Stat label="Research items" value={m.research.total} />
              <Stat label="Finished" value={m.research.finished} sub="Completed or published" />
              <Stat label="In progress" value={m.research.active} sub="In progress or review" />
              <Stat label="Drafts" value={m.research.drafts} />
            </StatGrid>
            <AnalysisRow score={m.research.score} targets={m.research.targets} meaning={i.research.meaning} advice={i.research.advice} />
            {Object.keys(m.research.byType).length > 0 && (
              <Card>
                <SectionTitle>Research by type</SectionTitle>
                <Table headers={['Type', 'Items']} rows={Object.entries(m.research.byType).map(([t, n]) => [t.charAt(0) + t.slice(1).toLowerCase(), n])} />
              </Card>
            )}
            <Summary text={i.research.summary} />
            <BulletList title="Key points" items={i.research.points} />
          </div>
        );
      case 'predictions':
        if (!hasAI) return <AiMissing />;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {i.predictions.map((p, idx) => (
              <Card key={idx}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span style={bc(12, 700, { color: ORG, textTransform: 'uppercase', letterSpacing: 1 })}>{p.area}</span>
                  <Pill level={p.confidence === 'high' ? 'excellent' : p.confidence === 'medium' ? 'good' : 'needs_attention'}>
                    {p.confidence} confidence
                  </Pill>
                </div>
                {p.expectedValue && p.expectedValue !== 'n/a' && (
                  <div style={bb(24, { color: textC, lineHeight: 1.1, marginBottom: 6 })}>{p.expectedValue}</div>
                )}
                <p style={ba(13, 400, { color: textC, lineHeight: 1.5 })}>{p.prediction}</p>
                {p.basis && (
                  <p className="flex items-start gap-1" style={ba(12, 400, { color: text2, marginTop: 6, lineHeight: 1.5 })}>
                    <Calculator className="w-3.5 h-3.5 flex-shrink-0" style={{ marginTop: 2 }} /> <span>{p.basis}</span>
                  </p>
                )}
                <p style={ba(11, 400, { color: text2, marginTop: 6 })}>Timeframe: {p.timeframe}</p>
              </Card>
            ))}
          </div>
        );
      case 'recommendations':
        if (!hasAI) return <AiMissing />;
        return (
          <div className="space-y-3">
            <Card>
              <p style={ba(13, 400, { color: textC })}>
                Current overall score: <strong>{m.overview.score.value ?? '—'}/100</strong>.
                {' '}Doing all high-priority actions could add about{' '}
                <strong>{i.recommendations.filter((r) => r.priority === 'high').reduce((s, r) => s + (r.expectedScoreGain || 0), 0)} points</strong> (AI estimate).
              </p>
            </Card>
            {i.recommendations.map((r, idx) => (
              <Card key={idx} style={{ borderLeft: `3px solid ${LEVEL_COLORS[r.priority]}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p style={ba(14, 600, { color: textC })}>{r.action}</p>
                    <p style={ba(12, 400, { color: text2, marginTop: 4 })}>{r.reason}</p>
                    {r.expectedScoreGain > 0 && (
                      <p style={ba(12, 600, { color: TEAL, marginTop: 4 })}>≈ +{r.expectedScoreGain} points on the overall score</p>
                    )}
                  </div>
                  <Pill level={r.priority}>{r.priority}</Pill>
                </div>
              </Card>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div style={{ width: 3, height: 24, background: ORG, borderRadius: 2, marginRight: 4 }} />
                <Sparkles className="w-5 h-5" style={{ color: ORG }} />
                <h1 style={bb(28, { color: ORG, lineHeight: 1 })}>AI Predictions</h1>
              </div>
              <p className="text-xs" style={{ color: text2 }}>
                Scores out of 100, calculated figures and AI advice across expenses, money usage, salaries, reports, goals and schedules
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select value={months} onChange={(e) => setMonths(Number(e.target.value))} disabled={loading}
                aria-label="Analysis period"
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '7px 10px', color: textC, ...ba(12) }}>
                {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => load(true)} disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs font-medium disabled:opacity-50"
                style={{ background: ORG, color: '#fff', borderRadius: 4 }}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const score = metrics?.overview.sectionScores[tab.id] ?? (tab.id === 'overview' ? metrics?.overview.score.value : undefined);
            return (
              <button key={tab.id} role="tab" aria-selected={active} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 flex-shrink-0"
                style={{
                  padding: '8px 12px', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: active ? ORG : bg2, border: `1px solid ${active ? ORG : border}`,
                  ...ba(12, active ? 600 : 400, { color: active ? '#fff' : textC }),
                }}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
                {score != null && (
                  <span style={{
                    ...ba(10, 700, { color: active ? ORG : textC }), background: active ? '#fff' : bg3,
                    borderRadius: 999, padding: '1px 6px', marginLeft: 2,
                  }}>{score}</span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <Card style={{ textAlign: 'center', padding: '48px 16px' }}>
            <RefreshCw className="w-6 h-6 animate-spin mx-auto" style={{ color: ORG }} />
            <p style={ba(13, 500, { color: textC, marginTop: 12 })}>Analysing your company data…</p>
            <p style={ba(12, 400, { color: text2, marginTop: 4 })}>This can take a minute.</p>
          </Card>
        ) : error ? (
          <div style={{
            background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, padding: 12,
            color: '#e84040', display: 'flex', alignItems: 'center', gap: 8, ...ba(13),
          }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
          </div>
        ) : metrics ? (
          <>
            {data.aiError && (
              <div style={{
                background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.35)', borderRadius: 4, padding: 12,
                color: textC, display: 'flex', alignItems: 'center', gap: 8, ...ba(13),
              }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: ORG }} />
                <span>AI explanations and advice are unavailable ({data.aiError}). Scores and calculations below are still accurate.</span>
              </div>
            )}
            {renderTab()}
            <p style={ba(11, 400, { color: text3 })}>
              Generated {new Date(data.generatedAt).toLocaleString()} from the last {data.periodMonths} month{data.periodMonths > 1 ? 's' : ''} of data.
              Scores, totals and trend forecasts are calculated directly from your records; explanations, AI forecasts and advice are AI-generated — check important figures against the source records.
            </p>
          </>
        ) : data?.insights ? (
          <Card><p style={ba(13, 400, { color: textC })}>This analysis was made before scores were added. Press Regenerate to get the full version.</p></Card>
        ) : null}
      </div>
    </div>
  );
};

export default AiPredictionsPage;
