import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw, AlertCircle, Building2, TrendingUp, TrendingDown, Wallet,
  MapPin, Layers, Store,
} from 'lucide-react';
import { motion } from 'framer-motion';
import companyService, { COMPANY_STATUS } from '../../services/companyService';
import planService from '../../services/planService';
import subscriptionService, { SUBSCRIPTION_STATUS } from '../../services/subscriptionService';
import { MODULES } from '../../services/companyRegistrationService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { formatMoney } from '../../utils/mockStore';

const WEEKS = 12;
const MS_WEEK = 1000 * 60 * 60 * 24 * 7;

const subStatusMeta = {
  [SUBSCRIPTION_STATUS.ACTIVE]:    { label: 'Active',    color: '#4ade80' },
  [SUBSCRIPTION_STATUS.TRIAL]:     { label: 'Trial',     color: TEAL },
  [SUBSCRIPTION_STATUS.EXPIRED]:   { label: 'Expired',   color: ORG },
  [SUBSCRIPTION_STATUS.CANCELLED]: { label: 'Cancelled', color: '#e84040' },
};

const PlatformAnalyticsManagement = () => {
  const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, planData, subData] = await Promise.all([
        companyService.getAllCompanies(),
        planService.getAllPlans(),
        subscriptionService.getAllSubscriptions(),
      ]);
      setCompanies(companyData);
      setPlans(planData);
      setSubscriptions(subData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCompanies = useMemo(() => companies.filter((c) => c.status === COMPANY_STATUS.ACTIVE), [companies]);

  const byType = useMemo(() => {
    const map = {};
    activeCompanies.forEach((c) => {
      const label = c.businessType === 'Other' ? (c.businessTypeOther || 'Other') : c.businessType;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [activeCompanies]);

  const byRegion = useMemo(() => {
    const map = {};
    activeCompanies.forEach((c) => { map[c.city] = (map[c.city] || 0) + 1; });
    return Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [activeCompanies]);

  const moduleAdoption = useMemo(() => {
    const total = activeCompanies.length || 1;
    return MODULES.map(({ key, label }) => {
      const count = activeCompanies.filter((c) => (c.moduleAccess || []).includes(key)).length;
      return { key, label, count, pct: Math.round((count / total) * 100) };
    }).sort((a, b) => b.count - a.count);
  }, [activeCompanies]);

  const mrr = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === SUBSCRIPTION_STATUS.ACTIVE)
      .reduce((sum, s) => {
        const plan = plans.find((p) => p.id === s.planId);
        if (!plan) return sum;
        return sum + (plan.billingCycle === 'YEARLY' ? plan.price / 12 : plan.price);
      }, 0);
  }, [subscriptions, plans]);

  const subStatusCounts = useMemo(() => {
    const map = {};
    subscriptions.forEach((s) => { map[s.status] = (map[s.status] || 0) + 1; });
    return map;
  }, [subscriptions]);

  const churnRate = useMemo(() => {
    if (subscriptions.length === 0) return 0;
    const churned = (subStatusCounts[SUBSCRIPTION_STATUS.EXPIRED] || 0) + (subStatusCounts[SUBSCRIPTION_STATUS.CANCELLED] || 0);
    return Math.round((churned / subscriptions.length) * 1000) / 10;
  }, [subscriptions, subStatusCounts]);

  const growthSeries = useMemo(() => {
    const now = Date.now();
    const points = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const bucketEnd = new Date(now - i * MS_WEEK);
      const count = companies.filter((c) => new Date(c.createdAt) <= bucketEnd).length;
      points.push({ date: bucketEnd, count });
    }
    return points;
  }, [companies]);

  // ── Growth chart geometry ────────────────────────────
  const chartW = 900, chartH = 220, padL = 32, padR = 16, padT = 16, padB = 28;
  const plotW = chartW - padL - padR, plotH = chartH - padT - padB;
  const maxCount = Math.max(1, ...growthSeries.map((p) => p.count));
  const xAt = (i) => padL + (i / (growthSeries.length - 1)) * plotW;
  const yAt = (v) => padT + plotH - (v / maxCount) * plotH;
  const linePath = growthSeries.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p.count)}`).join(' ');
  const areaPath = `${linePath} L ${xAt(growthSeries.length - 1)} ${padT + plotH} L ${xAt(0)} ${padT + plotH} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => padT + plotH * f);

  const inputBar = (color) => ({
    height: 10, borderRadius: 4, background: color, transition: 'width .4s ease',
  });

  const labelStyle = bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 });

  const RankedBars = ({ rows, color, emptyText, icon: Icon }) => (
    <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20 }}>
      {rows.length === 0 ? (
        <p style={{ ...ba(13, 400, { color: text2 }) }}>{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => {
            const max = rows[0].count || 1;
            const widthPct = row.count === 0 ? 0 : Math.max(4, Math.round((row.count / max) * 100));
            return (
              <div key={row.label || row.key}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ ...ba(12, 600, { color: textC }) }}>{row.label}</span>
                  <span style={{ ...ba(12, 700, { color: text2 }) }}>
                    {row.count}{row.pct !== undefined ? ` · ${row.pct}%` : ''}
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 4, background: bg3, overflow: 'hidden' }}>
                  <div style={{ ...inputBar(color), width: `${widthPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Platform Analytics</h1>
          <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Company adoption, module usage, growth and churn across all tenants</p>
        </div>
        <button onClick={loadData}
          style={{ padding: '8px 12px', background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p style={{ fontSize: 13 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${bg3}`, borderTopColor: ORG, margin: '0 auto 12px' }} />
          <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Companies', value: activeCompanies.length, Icon: Building2, colorKey: 'info' },
              { label: 'Monthly Recurring Revenue', value: formatMoney(mrr), Icon: Wallet, colorKey: 'success', isText: true },
              { label: 'Churn Rate', value: `${churnRate}%`, Icon: churnRate > 20 ? TrendingDown : TrendingUp, colorKey: churnRate > 20 ? 'danger' : 'success', isText: true },
              { label: 'New This Week', value: growthSeries[growthSeries.length - 1].count - growthSeries[growthSeries.length - 2].count, Icon: TrendingUp, colorKey: 'warn' },
            ].map(({ label, value, Icon, colorKey, isText }) => {
              const cs = { info: { bg: 'rgba(26,92,120,.15)', color: TEAL }, warn: { bg: 'rgba(232,98,26,.15)', color: ORG }, success: { bg: 'rgba(74,222,128,.15)', color: '#4ade80' }, danger: { bg: 'rgba(232,64,64,.15)', color: '#e84040' } }[colorKey];
              return (
                <div key={label} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
                  <div style={{ width: 40, height: 40, background: cs.bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: cs.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isText
                    ? <p style={bb(26, { color: ORG, lineHeight: 1.1, margin: 0 })}>{value}</p>
                    : <p style={bb(40, { color: ORG, lineHeight: 1, margin: 0 })}>{value}</p>}
                  <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: 0 })}>{label}</p>
                </div>
              );
            })}
          </div>

          {/* Growth over time */}
          <div className="mb-6" style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20 }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" style={{ color: ORG }} />
              <span style={labelStyle}>Growth Over Time — Total Companies, Trailing 12 Weeks</span>
            </div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORG} stopOpacity="0.16" />
                  <stop offset="100%" stopColor={ORG} stopOpacity="0" />
                </linearGradient>
              </defs>
              {gridLines.map((y, i) => (
                <line key={i} x1={padL} x2={chartW - padR} y1={y} y2={y} stroke={border} strokeWidth="1" />
              ))}
              <path d={areaPath} fill="url(#growthFill)" />
              <path d={linePath} fill="none" stroke={ORG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {growthSeries.map((p, i) => {
                const isEdge = i === 0 || i === growthSeries.length - 1;
                const isHover = hoverPoint === i;
                return (
                  <g key={i}>
                    <circle cx={xAt(i)} cy={yAt(p.count)} r={isHover ? 7 : 10} fill="transparent"
                      onMouseEnter={() => setHoverPoint(i)} onMouseLeave={() => setHoverPoint(null)}
                      style={{ cursor: 'pointer' }} />
                    {(isEdge || isHover) && (
                      <circle cx={xAt(i)} cy={yAt(p.count)} r={5} fill={ORG} stroke={bg2} strokeWidth="2" />
                    )}
                    {isEdge && (
                      <text x={xAt(i)} y={yAt(p.count) - 12} textAnchor={i === 0 ? 'start' : 'end'}
                        fill={textC} fontSize="13" fontWeight="700" fontFamily="'Barlow',sans-serif">
                        {p.count}
                      </text>
                    )}
                    {isHover && !isEdge && (
                      <text x={xAt(i)} y={yAt(p.count) - 12} textAnchor="middle"
                        fill={textC} fontSize="13" fontWeight="700" fontFamily="'Barlow',sans-serif">
                        {p.count}
                      </text>
                    )}
                    {(i % 2 === 0 || i === growthSeries.length - 1) && (
                      <text x={xAt(i)} y={chartH - 6} textAnchor="middle"
                        fill={text2} fontSize="10" fontFamily="'Barlow',sans-serif">
                        {p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Type / Region breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-4 h-4" style={{ color: ORG }} />
                <span style={labelStyle}>Active Companies by Type</span>
              </div>
              <RankedBars rows={byType} color={ORG} emptyText="No active companies yet" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" style={{ color: TEAL }} />
                <span style={labelStyle}>Active Companies by Region</span>
              </div>
              <RankedBars rows={byRegion} color={TEAL} emptyText="No active companies yet" />
            </div>
          </div>

          {/* Module adoption */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4" style={{ color: ORG }} />
              <span style={labelStyle}>Module Adoption — Share of Active Companies Using Each Module</span>
            </div>
            <RankedBars rows={moduleAdoption} color={ORG} emptyText="No modules enabled yet" />
          </div>

          {/* Subscription health / churn breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4" style={{ color: '#e84040' }} />
              <span style={labelStyle}>Subscription Health</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(subStatusMeta).map(([status, meta]) => (
                <div key={status} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.color }} />
                    <span style={{ ...ba(12, 600, { color: text2 }) }}>{meta.label}</span>
                  </div>
                  <p style={bb(34, { color: meta.color, lineHeight: 1, margin: 0 })}>{subStatusCounts[status] || 0}</p>
                </div>
              ))}
            </div>
            <p style={{ ...ba(12, 400, { color: text3, marginTop: 10 }) }}>
              Churn rate = expired + cancelled subscriptions ÷ all subscriptions ever created.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PlatformAnalyticsManagement;
