import { useState } from "react";
import { useDashboardTheme } from "../../../utils/dashboardTheme";
import { ORG, TEAL, bb, bc, ba } from "../../../utils/homeConstants";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, MapPin, Link as LinkIcon, 
  Users, Pin, Zap, Paperclip, Check, Trash2, 
  Edit3, ArrowLeft, ExternalLink, Globe, Laptop,
  FileText, Download, AlertCircle, MoreVertical,
  ChevronRight, CalendarDays, X, Layout
} from "lucide-react";

const STATUS_META = {
  SCHEDULED: { color: "#3b82f6", label: "Scheduled", icon: <CalendarDays size={14} /> },
  ONGOING: { color: "#f59e0b", label: "Ongoing", icon: <Clock size={14} /> },
  COMPLETED: { color: "#10b981", label: "Completed", icon: <Check size={14} /> },
  CANCELLED: { color: "#ef4444", label: "Cancelled", icon: <X size={14} /> },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function duration(start, end) {
  if (!start || !end) return null;
  const diff = (new Date(end) - new Date(start)) / 60000;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }) {
  const { bg2, textC, text2, text3, border } = useDashboardTheme();
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      style={{ 
        background: bg2, 
        border: `1px solid ${border}`, 
        borderRadius: 20, 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}1a`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {icon}
      </div>
      <div style={{ ...bc(24, 800, { color: color, lineHeight: 1 }) }}>{value}</div>
      <div style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.05em' }) }}>{label.toUpperCase()}</div>
      <div style={{ ...ba(11, 500, { color: text3 }) }}>{sub}</div>
    </motion.div>
  );
}

function SectionHeader({ title, count, icon }) {
  const { textC, text3 } = useDashboardTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ color: ORG }}>{icon}</div>
      <h3 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>{title}</h3>
      {count !== undefined && (
        <span style={{ 
          background: `${ORG}1a`, 
          color: ORG, 
          fontSize: 12, 
          fontWeight: 800, 
          padding: '2px 8px', 
          borderRadius: 6 
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MeetingView({ meeting, onEdit, onBack }) {
  const { bg, bg2, textC, text2, text3, border, isDark } = useDashboardTheme();
  const [tab, setTab] = useState("overview");

  if (!meeting) return null;

  const m = meeting;
  const statusMeta = STATUS_META[m.status] || STATUS_META.SCHEDULED;
  const dur = duration(m.startTime, m.endTime);

  const participants = m.participants || [];
  const keyPoints = m.keyPoints || [];
  const actionItems = m.actionItems || [];
  const attachments = m.attachments || [];

  const attendedCount = participants.filter((p) => p.attended).length;
  const completedAI = actionItems.filter((a) => a.completed).length;
  const completionPct = actionItems.length > 0 ? Math.round((completedAI / actionItems.length) * 100) : 0;

  const tabCounts = {
    participants: participants.length,
    keypoints: keyPoints.length,
    actions: actionItems.length,
    attachments: attachments.length,
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: <Globe size={16} /> },
    { id: "participants", label: "Participants", icon: <Users size={16} /> },
    { id: "keypoints", label: "Key Points", icon: <Pin size={16} /> },
    { id: "actions", label: "Actions", icon: <Zap size={16} /> },
    { id: "attachments", label: "Attachments", icon: <Paperclip size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: 100 }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* ── Header Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <button
            onClick={onBack}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: 'none', 
              border: 'none', 
              color: text3, 
              cursor: 'pointer',
              ...bc(12, 700)
            }}
          >
            <ArrowLeft size={16} /> BACK TO MEETINGS
          </button>
          <button
            onClick={onEdit}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              background: ORG, 
              color: '#fff', 
              border: 'none', 
              borderRadius: 12, 
              padding: '10px 24px', 
              cursor: 'pointer',
              boxShadow: `0 8px 20px ${ORG}40`,
              ...bc(13, 700)
            }}
          >
            <Edit3 size={16} /> EDIT SESSION
          </button>
        </div>

        {/* ── Hero Section ── */}
        <div style={{ 
          background: bg2, 
          border: `1px solid ${border}`, 
          borderRadius: 32, 
          padding: '40px', 
          marginBottom: 32,
          boxShadow: '0 4px 30px rgba(0,0,0,0.02)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background decoration */}
          <div style={{ 
            position: 'absolute', 
            top: -50, 
            right: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            background: `${ORG}08`, 
            filter: 'blur(40px)' 
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '6px 14px', 
                borderRadius: 100, 
                background: `${statusMeta.color}1a`, 
                color: statusMeta.color,
                ...bc(11, 800)
              }}>
                {statusMeta.icon}
                {statusMeta.label.toUpperCase()}
              </div>
              {(m.location || m.meetingLink) && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '6px 14px', 
                  borderRadius: 100, 
                  background: `${TEAL}1a`, 
                  color: TEAL,
                  ...bc(11, 800)
                }}>
                  {m.meetingLink ? <Globe size={14} /> : <MapPin size={14} />}
                  {m.meetingLink ? 'ONLINE' : 'OFFLINE'}
                </div>
              )}
            </div>

            <h1 style={{ ...bc(36, 800, { color: textC, margin: '0 0 16px' }) }}>{m.title}</h1>
            {m.description && (
              <p style={{ ...ba(16, 500, { color: text3, margin: '0 0 32px', maxWidth: 700, lineHeight: 1.6 }) }}>
                {m.description}
              </p>
            )}

            <div style={{ height: 1, background: border, margin: '32px 0' }} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.1em', marginBottom: 4 }) }}>SCHEDULED FOR</div>
                <div style={{ ...bc(15, 700, { color: textC }) }}>{formatDate(m.startTime)}</div>
                <div style={{ ...ba(13, 500, { color: text3 }) }}>{formatTime(m.startTime)}</div>
              </div>
              {dur && (
                <div>
                  <div style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.1em', marginBottom: 4 }) }}>DURATION</div>
                  <div style={{ ...bc(15, 700, { color: ORG }) }}>{dur.toUpperCase()}</div>
                  <div style={{ ...ba(13, 500, { color: text3 }) }}>Active Session</div>
                </div>
              )}
              <div>
                <div style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.1em', marginBottom: 4 }) }}>ORGANIZER</div>
                <div style={{ ...bc(15, 700, { color: textC }) }}>{m.createdBy?.adminName || "SYSTEM"}</div>
                <div style={{ ...ba(13, 500, { color: text3 }) }}>Abytech Hub</div>
              </div>
              {m.location && (
                <div>
                  <div style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.1em', marginBottom: 4 }) }}>LOCATION</div>
                  <div style={{ ...bc(15, 700, { color: textC }) }}>{m.location}</div>
                  <div style={{ ...ba(13, 500, { color: text3 }) }}>Physical Venue</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
          <StatCard 
            label="Participants" 
            value={participants.length} 
            sub={`${attendedCount} attended`} 
            icon={<Users size={18} />} 
            color={TEAL} 
          />
          <StatCard 
            label="Action Items" 
            value={actionItems.length} 
            sub={`${completedAI} completed`} 
            icon={<Zap size={18} />} 
            color={ORG} 
          />
          <StatCard 
            label="Key Points" 
            value={keyPoints.length} 
            sub="Captured notes" 
            icon={<Pin size={18} />} 
            color="#8b5cf6" 
          />
          <StatCard 
            label="Documents" 
            value={attachments.length} 
            sub="Files attached" 
            icon={<Paperclip size={18} />} 
            color="#10b981" 
          />
        </div>

        {/* ── Tabs ── */}
        <div style={{ 
          display: 'flex', 
          gap: 4, 
          background: bg2, 
          border: `1px solid ${border}`, 
          borderRadius: 16, 
          padding: 6, 
          marginBottom: 32,
          overflowX: 'auto'
        }} className="custom-scrollbar">
          {TABS.map((t) => {
            const active = tab === t.id;
            const count = tabCounts[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{ 
                  flex: 1,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 10, 
                  padding: '12px 16px', 
                  borderRadius: 12, 
                  ...bc(11, 700), 
                  background: active ? bg : 'transparent',
                  color: active ? ORG : text3,
                  border: `1px solid ${active ? border : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {t.icon}
                <span className="hidden md:inline">{t.label.toUpperCase()}</span>
                {count > 0 && (
                  <span style={{ 
                    background: active ? ORG : `${text3}33`, 
                    color: '#fff', 
                    fontSize: 9, 
                    padding: '2px 6px', 
                    borderRadius: 6 
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  {m.meetingLink && (
                    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px' }}>
                      <SectionHeader title="CONNECT" icon={<Globe size={20} />} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${TEAL}1a`, color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ExternalLink size={24} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.05em' }) }}>VIRTUAL ACCESS</div>
                          <a href={m.meetingLink} target="_blank" rel="noreferrer" style={{ ...bc(14, 700, { color: TEAL }), display: 'block', textDecoration: 'none' }} className="truncate">
                            {m.meetingLink}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {actionItems.length > 0 && (
                    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <SectionHeader title="ACTION PROGRESS" icon={<Zap size={20} />} />
                        <div style={{ ...bc(16, 800, { color: ORG }) }}>{completionPct}%</div>
                      </div>
                      <div style={{ height: 8, background: `${ORG}1a`, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPct}%` }}
                          style={{ height: '100%', background: ORG, borderRadius: 4 }} 
                        />
                      </div>
                      <div style={{ ...ba(12, 500, { color: text3 }) }}>
                        {completedAI} OF {actionItems.length} TASKS COMPLETED
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '24px' }}>
                    <SectionHeader title="QUICK STATS" icon={<Layout size={18} />} />
                    <div className="space-y-4">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ ...ba(13, 500, { color: text3 }) }}>ATTENDANCE RATE</span>
                        <span style={{ ...bc(13, 700, { color: textC }) }}>{participants.length ? Math.round((attendedCount/participants.length)*100) : 0}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ ...ba(13, 500, { color: text3 }) }}>FILE SIZE</span>
                        <span style={{ ...bc(13, 700, { color: textC }) }}>-- MB</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ ...ba(13, 500, { color: text3 }) }}>PRIORITY</span>
                        <span style={{ ...bc(11, 800, { color: ORG, background: `${ORG}1a`, padding: '2px 8px', borderRadius: 4 }) }}>HIGH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PARTICIPANTS */}
            {tab === "participants" && (
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px' }}>
                <SectionHeader title="ATTENDANCE LIST" icon={<Users size={20} />} count={participants.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.map((p, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16, 
                      padding: '16px', 
                      background: bg, 
                      border: `1px solid ${border}`, 
                      borderRadius: 16 
                    }}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 12, 
                        background: p.attended ? `${TEAL}1a` : `${text3}1a`, 
                        color: p.attended ? TEAL : text3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...bc(14, 800)
                      }}>
                        {initials(p.adminName || p.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ ...bc(14, 700, { color: textC }) }} className="truncate">{p.adminName || p.name}</span>
                          {p.isCustom && <span style={{ ...ba(9, 700, { color: ORG, background: `${ORG}1a`, padding: '1px 6px', borderRadius: 4 }) }}>EXT</span>}
                        </div>
                        <div style={{ ...ba(12, 400, { color: text3 }) }} className="truncate">{p.adminEmail || p.email || 'No email provided'}</div>
                      </div>
                      <div style={{ color: p.attended ? TEAL : text3 }}>
                        {p.attended ? <Check size={18} /> : <X size={18} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KEY POINTS */}
            {tab === "keypoints" && (
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px' }}>
                <SectionHeader title="DISCUSSION HIGHLIGHTS" icon={<Pin size={20} />} count={keyPoints.length} />
                <div className="space-y-4">
                  {keyPoints.map((k, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      gap: 20, 
                      padding: '24px', 
                      background: bg, 
                      border: `1px solid ${border}`, 
                      borderRadius: 16 
                    }}>
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: `${ORG}1a`, 
                        color: ORG, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        ...bc(11, 800),
                        shrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <h4 style={{ ...bc(15, 700, { color: textC, margin: '0 0 8px' }) }}>{k.content || k.title || "Untitled Point"}</h4>
                        {k.notes && <p style={{ ...ba(14, 500, { color: text3, margin: 0, lineHeight: 1.6 }) }}>{k.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION ITEMS */}
            {tab === "actions" && (
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px' }}>
                <SectionHeader title="TASKS & ASSIGNMENTS" icon={<Zap size={20} />} count={actionItems.length} />
                <div className="space-y-4">
                  {actionItems.map((a, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 20, 
                      padding: '20px', 
                      background: a.completed ? `${TEAL}08` : bg, 
                      border: `1px solid ${a.completed ? TEAL : border}`, 
                      borderRadius: 16 
                    }}>
                      <div style={{ color: a.completed ? TEAL : text3 }}>
                        {a.completed ? <Check size={20} strokeWidth={3} /> : <Zap size={20} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...bc(14, 700, { color: textC, textDecoration: a.completed ? 'line-through' : 'none', opacity: a.completed ? 0.6 : 1 }) }}>
                          {a.title || a.task}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                          {a.assignedTo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Users size={12} style={{ color: text3 }} />
                              <span style={{ ...ba(12, 500, { color: text3 }) }}>{typeof a.assignedTo === 'string' ? a.assignedTo : a.assignedTo.name}</span>
                            </div>
                          )}
                          {a.dueDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={12} style={{ color: text3 }} />
                              <span style={{ ...ba(12, 500, { color: text3 }) }}>{formatDate(a.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ ...bc(10, 800, { color: a.completed ? TEAL : ORG, letterSpacing: '0.05em' }) }}>
                        {a.completed ? 'DONE' : 'PENDING'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATTACHMENTS */}
            {tab === "attachments" && (
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px' }}>
                <SectionHeader title="RESOURCES" icon={<Paperclip size={20} />} count={attachments.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="group" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16, 
                      padding: '16px', 
                      background: bg, 
                      border: `1px solid ${border}`, 
                      borderRadius: 16,
                      transition: 'border-color 0.2s'
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ORG}1a`, color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...bc(14, 700, { color: textC }) }} className="truncate">{att.fileName}</div>
                        <div style={{ ...ba(11, 500, { color: text3 }) }}>{att.fileType?.toUpperCase() || 'FILE'}</div>
                      </div>
                      <a 
                        href={att.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 8, 
                          background: bg2, 
                          color: text3, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <div style={{ marginTop: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
          <div style={{ ...ba(11, 500, { color: text3 }) }}>REF: {m.id}</div>
          <div style={{ ...ba(11, 500, { color: text3 }) }}>LAST MODIFIED: {new Date(m.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
