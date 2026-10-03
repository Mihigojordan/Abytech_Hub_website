import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus, LayoutDashboard, ShoppingBag, Wallet,
  Banknote, ClipboardList, Target, CalendarDays, Microscope, LineChart, ListChecks, HelpCircle,
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

const PERIODS = [
  { value: 1, label: 'Last month' },
  { value: 3, label: 'Last 3 months' },
  { value: 6, label: 'Last 6 months' },
  { value: 12, label: 'Last 12 months' },
];

const formatRWF = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount || 0);

const LEVEL_COLORS = {
  high: '#e84040', medium: ORG, low: TEAL,
  excellent: '#22c55e', good: TEAL, needs_attention: ORG, inactive: '#e84040',
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

  const insights = data?.insights;

  // ── Small building blocks ──
  const Card = ({ children, style }) => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16, ...style }}>{children}</div>
  );

  const SectionTitle = ({ children }) => (
    <h3 style={bc(13, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10, marginBottom: 10 })}>{children}</h3>
  );

  const Summary = ({ text }) => (
    <Card><p style={ba(14, 400, { color: textC, lineHeight: 1.6 })}>{text}</p></Card>
  );

  const BulletList = ({ title, items, color = ORG }) => (
    <Card>
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
      <div style={bb(24, { color: ORG, lineHeight: 1.1 })}>{value}</div>
      {sub && <div style={ba(12, 400, { color: text2, marginTop: 6 })}>{sub}</div>}
    </Card>
  );

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

  // ── Tab contents ──
  const renderTab = () => {
    const i = insights;
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Health score" value={`${Math.round(i.overview.healthScore)}/100`} />
              <Stat label="Expense forecast (next month)" value={formatRWF(i.expenses.nextMonthForecast)} />
              <Stat label="Goal completion" value={`${Math.round(i.goals.completionRate)}%`} />
            </div>
            <Summary text={i.overview.headline} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BulletList title="Highlights" items={i.overview.highlights} color="#22c55e" />
              <BulletList title="Concerns" items={i.overview.concerns} color="#e84040" />
            </div>
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Stat label="Predicted next month" value={formatRWF(i.expenses.nextMonthForecast)} sub={i.expenses.forecastReasoning} />
              <Card>
                <div style={bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 })}>Trend</div>
                <TrendBadge trend={i.expenses.trend} />
              </Card>
            </div>
            <Summary text={i.expenses.summary} />
            <BulletList title="Insights" items={i.expenses.insights} />
          </div>
        );
      case 'moneyUsage':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Stat label="Already used" value={formatRWF(i.moneyUsage.usedTotal)} />
              <Stat label="Planned to use" value={formatRWF(i.moneyUsage.plannedUpcomingTotal)} />
            </div>
            <Summary text={i.moneyUsage.summary} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BulletList title="Cash-flow risks" items={i.moneyUsage.cashflowRisks} color="#e84040" />
              <BulletList title="Insights" items={i.moneyUsage.insights} />
            </div>
          </div>
        );
      case 'salaries':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Stat label="Predicted payout next month" value={formatRWF(i.salaries.nextMonthForecast)} />
              <Card>
                <div style={bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 })}>Trend</div>
                <TrendBadge trend={i.salaries.trend} />
              </Card>
            </div>
            <Summary text={i.salaries.summary} />
            <BulletList title="Insights" items={i.salaries.insights} />
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-4">
            <Summary text={i.reports.summary} />
            <Card>
              <SectionTitle>Employee reporting performance</SectionTitle>
              {i.reports.employees.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Employee', 'Reports', 'Performance', 'Note'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${border}`, ...bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase' }) }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {i.reports.employees.map((e) => (
                        <tr key={e.name}>
                          <td style={{ padding: '10px', borderBottom: `1px solid ${border}`, ...ba(13, 600, { color: textC, whiteSpace: 'nowrap' }) }}>{e.name}</td>
                          <td style={{ padding: '10px', borderBottom: `1px solid ${border}`, ...ba(13, 400, { color: textC }) }}>{e.reportsCount}</td>
                          <td style={{ padding: '10px', borderBottom: `1px solid ${border}` }}><Pill level={e.performance} /></td>
                          <td style={{ padding: '10px', borderBottom: `1px solid ${border}`, ...ba(12, 400, { color: text2, minWidth: 200 }) }}>{e.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={ba(12, 400, { color: text2 })}>No reports in this period.</p>
              )}
            </Card>
            <BulletList title="Key themes from reading the reports" items={i.reports.keyThemes} color={TEAL} />
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-4">
            <Stat label="Completion rate" value={`${Math.round(i.goals.completionRate)}%`} />
            <Summary text={i.goals.summary} />
            <BulletList title="Insights" items={i.goals.insights} />
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <Summary text={i.schedule.summary} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BulletList title="Coming up" items={i.schedule.upcomingHighlights} color={TEAL} />
              <BulletList title="Workload notes" items={i.schedule.workloadNotes} />
            </div>
          </div>
        );
      case 'research':
        return (
          <div className="space-y-4">
            <Summary text={i.research.summary} />
            <BulletList title="Insights" items={i.research.insights} />
          </div>
        );
      case 'predictions':
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
                <p style={ba(13, 400, { color: textC, lineHeight: 1.5 })}>{p.prediction}</p>
                <p style={ba(11, 400, { color: text2, marginTop: 6 })}>Timeframe: {p.timeframe}</p>
              </Card>
            ))}
          </div>
        );
      case 'recommendations':
        return (
          <div className="space-y-3">
            {i.recommendations.map((r, idx) => (
              <Card key={idx} style={{ borderLeft: `3px solid ${LEVEL_COLORS[r.priority]}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p style={ba(14, 600, { color: textC })}>{r.action}</p>
                    <p style={ba(12, 400, { color: text2, marginTop: 4 })}>{r.reason}</p>
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
                AI summary and forecasts across expenses, money usage, salaries, reports, goals and schedules
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
            return (
              <button key={tab.id} role="tab" aria-selected={active} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 flex-shrink-0"
                style={{
                  padding: '8px 12px', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: active ? ORG : bg2, border: `1px solid ${active ? ORG : border}`,
                  ...ba(12, active ? 600 : 400, { color: active ? '#fff' : textC }),
                }}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
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
        ) : insights ? (
          <>
            {renderTab()}
            <p style={ba(11, 400, { color: text3 })}>
              Generated {new Date(data.generatedAt).toLocaleString()} from the last {data.periodMonths} month{data.periodMonths > 1 ? 's' : ''} of data.
              AI-generated — check important figures against the source records.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AiPredictionsPage;
