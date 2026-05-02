import React, { useState } from 'react';
import { 
  ArrowLeft, Edit, Calendar, Clock, Users, CheckCircle2, 
  Target, BarChart3, MessageSquare, ChevronRight, Zap,
  Circle, ListTodo, ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../utils/homeConstants';

const STATUS_META = {
  PENDING: { label: 'PENDING', color: '#f59e0b', icon: Clock },
  IN_PROGRESS: { label: 'IN PROGRESS', color: TEAL, icon: Zap },
  COMPLETED: { label: 'COMPLETED', color: '#10b981', icon: CheckCircle2 },
  MISSED: { label: 'MISSED', color: '#ef4444', icon: Target },
};

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatDateRange(start, end) {
  if (!start || !end) return "—";
  const s = new Date(start).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  const e = new Date(end).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
  return `${s.toUpperCase()} — ${e.toUpperCase()}`;
}

const TABS = [
  { id: "overview", label: "OVERVIEW", icon: BarChart3 },
  { id: "tasks", label: "TASK PROTOCOL", icon: ListTodo },
  { id: "review", label: "TEAM REFLECTIONS", icon: MessageSquare },
];

export default function WeeklyGoalView({ goal, onEdit, onBack }) {
  const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
  const [tab, setTab] = useState("overview");

  if (!goal) return null;

  const status = STATUS_META[goal.status] || STATUS_META.PENDING;

  let tasks = [];
  try { tasks = typeof goal.tasks === 'string' ? JSON.parse(goal.tasks) : (goal.tasks || []); } catch { tasks = []; }

  let reviewNotes = [];
  try { reviewNotes = typeof goal.reviewNotes === 'string' ? JSON.parse(goal.reviewNotes) : (goal.reviewNotes || []); } catch { reviewNotes = []; }

  const completedTasks = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : (goal.progress || 0);

  const getProgressColor = () => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return TEAL;
    if (progress >= 25) return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
      <div className=" mx-auto px-6 py-10">
        
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: text3, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...bc(12, 700) }}
          >
            <ArrowLeft size={16} /> BACK TO ARCHIVE
          </button>
          <div style={{ ...bc(12, 800, { color: text3, letterSpacing: '0.1em' }) }}>
            GOALS / <span style={{ color: ORG }}>SESSION VIEW</span>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: '48px', 
            marginBottom: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' 
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: `linear-gradient(225deg, ${ORG}05 0%, transparent 70%)` }}></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span style={{ background: `${status.color}15`, color: status.color, padding: '6px 16px', borderRadius: 10, ...bc(10, 800), display: 'flex', alignItems: 'center', gap: 8 }}>
                  <status.icon size={12} /> {status.label}
                </span>
                <span style={{ color: text3, ...bc(10, 800) }}>•</span>
                <div style={{ color: text2, ...bc(10, 800) }}>
                  WEEK {formatDateRange(goal.weekStart, goal.weekEnd)}
                </div>
              </div>

              <h1 style={{ ...bc(48, 800, { color: textC, margin: '0 0 16px', lineHeight: 1.1 }) }}>{goal.title}</h1>
              <p style={{ ...ba(16, 500, { color: text2, margin: 0, lineHeight: 1.6, maxWidth: 600 }) }}>{goal.description}</p>
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <div style={{ 
                width: 140, height: 140, borderRadius: '50%', border: `8px solid ${border}`, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: bg, boxShadow: `0 10px 30px rgba(0,0,0,0.05)`
              }}>
                <span style={{ ...bc(32, 800, { color: getProgressColor(), lineHeight: 1 }) }}>{progress}%</span>
                <span style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.05em', marginTop: 4 }) }}>ACHIEVED</span>
              </div>
            </div>
          </div>

          <button
            onClick={onEdit}
            style={{ 
              position: 'absolute', bottom: 48, right: 48, background: ORG, color: '#fff', border: 'none', 
              padding: '12px 24px', borderRadius: 12, cursor: 'pointer', ...bc(12, 800),
              display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 10px 25px ${ORG}40`
            }}
          >
            <Edit size={16} /> MODIFY GOAL
          </button>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {[
            { label: 'TASK PROGRESS', value: `${completedTasks} / ${tasks.length}`, sub: 'UNITS COMPLETED', icon: ClipboardCheck, color: TEAL },
            { label: 'TEAM FEEDBACK', value: reviewNotes.length, sub: 'REFLECTIONS LOGGED', icon: MessageSquare, color: '#8b5cf6' },
            { label: 'PRINCIPAL OWNER', value: goal.owner?.adminName?.toUpperCase() || '—', sub: goal.owner?.adminEmail?.toLowerCase() || '—', icon: Users, color: ORG },
          ].map((stat, i) => (
            <div key={i} style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 32, padding: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <p style={{ ...bc(10, 800, { color: text3, margin: 0, letterSpacing: '0.05em' }) }}>{stat.label}</p>
                <p style={{ ...bc(20, 800, { color: textC, margin: '4px 0' }) }}>{stat.value}</p>
                <p style={{ ...ba(11, 600, { color: text3, margin: 0 }) }}>{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab System */}
        <div style={{ display: 'flex', gap: 8, background: bg2, border: `1px solid ${border}`, padding: 6, borderRadius: 20, width: 'fit-content', margin: '0 auto 48px' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 16, border: 'none',
                background: tab === t.id ? ORG : 'transparent', color: tab === t.id ? '#fff' : text3,
                cursor: 'pointer', ...bc(11, 800), transition: 'all 0.2s'
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: 48 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <h3 style={{ ...bc(14, 800, { color: textC, marginBottom: 24 }) }}>SESSION CORE</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <p style={{ ...bc(10, 800, { color: text3, margin: '0 0 4px' }) }}>OBJECTIVE TITLE</p>
                      <p style={{ ...ba(15, 600, { color: textC, margin: 0 }) }}>{goal.title}</p>
                    </div>
                    <div>
                      <p style={{ ...bc(10, 800, { color: text3, margin: '0 0 4px' }) }}>STRATEGIC DESCRIPTION</p>
                      <p style={{ ...ba(14, 500, { color: text2, margin: 0, lineHeight: 1.6 }) }}>{goal.description || 'No strategic description provided.'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 style={{ ...bc(14, 800, { color: textC, marginBottom: 24 }) }}>TIMELINE & OWNERSHIP</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', gap: 32 }}>
                      <div>
                        <p style={{ ...bc(10, 800, { color: text3, margin: '0 0 4px' }) }}>COMMENCEMENT</p>
                        <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{formatDate(goal.weekStart)}</p>
                      </div>
                      <div>
                        <p style={{ ...bc(10, 800, { color: text3, margin: '0 0 4px' }) }}>COMPLETION</p>
                        <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{formatDate(goal.weekEnd)}</p>
                      </div>
                    </div>
                    <div>
                      <p style={{ ...bc(10, 800, { color: text3, margin: '0 0 12px' }) }}>SESSION ORGANIZER</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...bc(16, 800) }}>
                          {initials(goal.owner?.adminName)}
                        </div>
                        <div>
                          <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{goal.owner?.adminName}</p>
                          <p style={{ ...ba(12, 500, { color: text3, margin: 0 }) }}>{goal.owner?.adminEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: 48 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <h3 style={{ ...bc(14, 800, { color: textC, margin: 0 }) }}>TASK PROTOCOL ({tasks.length} UNITS)</h3>
                <div style={{ ...bc(11, 800, { color: ORG }) }}>{completedTasks} COMPLETED</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {tasks.length > 0 ? tasks.map((t, i) => (
                  <div key={i} style={{ 
                    background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 24, 
                    display: 'flex', alignItems: 'flex-start', gap: 20, opacity: t.done ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ 
                      width: 24, height: 24, borderRadius: 8, border: `2px solid ${t.done ? '#10b981' : border}`,
                      background: t.done ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {t.done && <CheckCircle2 size={14} color="#fff" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ ...ba(16, 700, { color: textC, margin: '0 0 4px', textDecoration: t.done ? 'line-through' : 'none' }) }}>{t.title}</h4>
                      <p style={{ ...ba(13, 500, { color: text2, margin: 0 }) }}>{t.description}</p>
                    </div>
                    <span style={{ ...bc(10, 800, { color: t.done ? '#10b981' : text3, padding: '4px 12px', background: t.done ? '#10b98115' : border, borderRadius: 8 }) }}>
                      {t.done ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: text3, ...ba(14, 500) }}>No tasks defined for this goal protocol.</div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: 48 }}
            >
              <h3 style={{ ...bc(14, 800, { color: textC, marginBottom: 40 }) }}>TEAM REFLECTIONS ({reviewNotes.length})</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {reviewNotes.length > 0 ? reviewNotes.map((note, i) => (
                  <div key={i} style={{ display: 'flex', gap: 24 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: `${ORG}15`, color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', ...bc(18, 800), flexShrink: 0 }}>
                      {initials(note.name)}
                    </div>
                    <div style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 24, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 24, left: -8, width: 16, height: 16, background: bg, borderLeft: `1px solid ${border}`, borderBottom: `1px solid ${border}`, transform: 'rotate(45deg)' }}></div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h4 style={{ ...bc(13, 800, { color: textC, margin: 0 }) }}>{note.name?.toUpperCase()}</h4>
                        <span style={{ ...bc(10, 800, { color: text3 }) }}>TEAM MEMBER</span>
                      </div>
                      <p style={{ ...ba(14, 500, { color: text2, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }) }}>{note.notes}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: text3, ...ba(14, 500) }}>No reflections have been logged yet.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: text3, ...bc(10, 700) }}>
          <span>GOAL ID: {goal.id}</span>
          <span>INITIATED: {formatDate(goal.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
