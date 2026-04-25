import { useState, useRef, useEffect } from "react";
import { useDashboardTheme } from "../../../utils/dashboardTheme";
import { ORG, TEAL, bb, bc, ba } from "../../../utils/homeConstants";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, MapPin, Link as LinkIcon, 
  Users, Pin, Zap, Paperclip, Check, Trash2, 
  Plus, X, ChevronRight, ChevronLeft, AlertCircle,
  FileText, Image as ImageIcon, Video, File,
  Search, ExternalLink, Globe, Layout, Laptop
} from "lucide-react";

const STATUS_OPTIONS = ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"];

const STATUS_META = {
  SCHEDULED: { color: "#3b82f6", label: "Scheduled" },
  ONGOING: { color: "#f59e0b", label: "Ongoing" },
  COMPLETED: { color: "#10b981", label: "Completed" },
  CANCELLED: { color: "#ef4444", label: "Cancelled" },
};

const ACCESSIBILITY_OPTIONS = [
  { value: "ONLINE", label: "Online", desc: "Virtual collaboration", icon: <Laptop size={18} /> },
  { value: "OFFLINE", label: "In-Person", desc: "Physical attendance", icon: <MapPin size={18} /> },
  { value: "HYBRID", label: "Hybrid", desc: "Combined access", icon: <Globe size={18} /> },
];

const FILE_ICONS = {
  pdf: "📕", doc: "📘", docx: "📘", xls: "📗", xlsx: "📗",
  ppt: "📊", pptx: "📊", png: "🖼️", jpg: "🖼️", jpeg: "🖼️",
  gif: "🖼️", svg: "🖼️", mp4: "🎬", mp3: "🎵", zip: "🗜️",
  rar: "🗜️", txt: "📃", csv: "📊", default: "📄",
};

const INITIAL_FORM = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  status: "SCHEDULED",
  location: "",
  meetingLink: "",
  participants: [],
  keyPoints: [],
  actionItems: [],
  attachments: [],
};

// ─── Utils ───────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDateTimeLocal(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

// ─── Admin Search Dropdown ────────────────────────────────────────────────────
function AdminSearchInput({ value, onChange, admins = [], placeholder = "Search admin or add custom..." }) {
  const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
  const [query, setQuery] = useState(value?.name || "");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setQuery(value?.name || "");
  }, [value?.name]);

  const filtered = admins.filter(
    (a) =>
      a.adminName?.toLowerCase().includes(query.toLowerCase()) ||
      a.adminEmail?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const selectAdmin = (admin) => {
    onChange({ adminId: admin.id, name: admin.adminName, email: admin.adminEmail, isCustom: false });
    setQuery(admin.adminName);
    setOpen(false);
  };

  const addCustom = () => {
    if (!query.trim()) return;
    onChange({ adminId: "", name: query.trim(), email: "", isCustom: true });
    setOpen(false);
  };

  const clear = () => {
    setQuery("");
    onChange(null);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: bg2,
          border: `1px solid ${focused ? ORG : border}`,
          borderRadius: 12,
          padding: '10px 16px',
          transition: 'all 0.3s ease',
          boxShadow: focused ? `0 0 0 4px ${ORG}1a` : 'none'
        }}
      >
        <Search style={{ width: 16, height: 16, color: text3 }} />
        <input
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: textC,
            ...ba(14, 500),
            padding: 0
          }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
        />
        {value?.isCustom && (
          <span style={{ ...ba(10, 700, { background: `${ORG}1a`, color: ORG, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em' }) }}>
            EXTERNAL
          </span>
        )}
        {value && !value.isCustom && (
          <span style={{ ...ba(10, 700, { background: `${TEAL}1a`, color: TEAL, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em' }) }}>
            ADMIN
          </span>
        )}
        {query && (
          <button type="button" onClick={clear} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', display: 'flex' }}>
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ 
              position: 'absolute', 
              zIndex: 50, 
              top: '100%', 
              marginTop: 8, 
              left: 0, 
              right: 0, 
              background: bg, 
              border: `1px solid ${border}`, 
              borderRadius: 16, 
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
              overflow: 'hidden' 
            }}
          >
            <div style={{ maxH: 250, overflowY: 'auto' }} className="custom-scrollbar">
              {filtered.length > 0 ? (
                <>
                  <div style={{ padding: '12px 16px', background: bg2, borderBottom: `1px solid ${border}`, ...bc(10, 800, { color: text3, letterSpacing: '0.1em' }) }}>
                    SYSTEM ADMINS
                  </div>
                  {filtered.map((admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onMouseDown={() => selectAdmin(admin)}
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        padding: '12px 16px', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: `1px solid ${border}`, 
                        cursor: 'pointer', 
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = bg2}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        background: `linear-gradient(135deg, ${ORG}, ${TEAL})`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        ...bc(12, 700) 
                      }}>
                        {initials(admin.adminName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...bc(14, 700, { color: textC }) }} className="truncate">{admin.adminName}</div>
                        <div style={{ ...ba(12, 400, { color: text3 }) }} className="truncate">{admin.adminEmail}</div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: text3, ...ba(13, 400) }}>
                  No results for "{query}"
                </div>
              )}
            </div>
            {query.trim() && (
              <div style={{ background: `${ORG}08`, borderTop: `1px solid ${border}` }}>
                <button
                  type="button"
                  onMouseDown={addCustom}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '12px 16px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    textAlign: 'left' 
                  }}
                >
                  <div style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%', 
                    background: `${ORG}1a`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: ORG 
                  }}>
                    <Plus size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ ...bc(13, 700, { color: ORG }) }}>Add "{query}" as external</div>
                    <div style={{ ...ba(11, 400, { color: text3 }) }}>Not a system account</div>
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────
function EmptyState({ icon, text, sub }) {
  const { text2, text3 } = useDashboardTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>{icon}</div>
      <p style={{ ...bc(16, 700, { color: text2, margin: 0 }) }}>{text}</p>
      <p style={{ ...ba(13, 400, { color: text3, margin: '8px 0 0' }) }}>{sub}</p>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  const { bg2, border } = useDashboardTheme();
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{ 
        width: 44, 
        height: 22, 
        borderRadius: 100, 
        background: checked ? ORG : bg2, 
        border: `1px solid ${checked ? ORG : border}`, 
        padding: 2, 
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <motion.div 
        animate={{ x: checked ? 22 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
      />
    </div>
  );
}

function FieldLabel({ children }) {
  const { text3 } = useDashboardTheme();
  return (
    <label style={{ display: 'block', ...bc(11, 800, { color: text3, letterSpacing: '0.1em', marginBottom: 8 }) }}>
      {children}
    </label>
  );
}

function Input({ className = "", error, style = {}, ...props }) {
  const { bg2, textC, text3, border } = useDashboardTheme();
  return (
    <input
      style={{
        width: '100%',
        background: bg2,
        border: `1px solid ${error ? '#ef4444' : border}`,
        borderRadius: 12,
        padding: '10px 16px',
        color: textC,
        ...ba(14, 500),
        outline: 'none',
        transition: 'all 0.3s ease',
        boxShadow: error ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none',
        ...style
      }}
      className={className}
      {...props}
    />
  );
}

function SectionAddBtn({ onClick, label = "Add" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        background: ORG, 
        color: '#fff', 
        ...bc(12, 700, { padding: '8px 16px', borderRadius: 10, letterSpacing: '0.05em' }), 
        border: 'none', 
        cursor: 'pointer', 
        boxShadow: `0 4px 15px ${ORG}40`
      }}
    >
      <Plus size={14} strokeWidth={2.5} />
      {label.toUpperCase()}
    </motion.button>
  );
}

function RemoveBtn({ onClick }) {
  const { text3 } = useDashboardTheme();
  return (
    <motion.button 
      whileHover={{ scale: 1.1, color: '#ef4444' }}
      type="button" 
      onClick={onClick} 
      style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4, display: 'flex' }}
    >
      <Trash2 size={16} />
    </motion.button>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function MeetingForm({
  meeting = null,
  admins = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const { bg, bg2, textC, text2, text3, border, isDark } = useDashboardTheme();
  const isEdit = !!meeting;

  // Initialize form state from meeting prop when editing
  const [form, setForm] = useState(() => {
    if (meeting) {
      return {
        title: meeting.title || '',
        description: meeting.description || '',
        startTime: formatDateTimeLocal(meeting.startTime),
        endTime: formatDateTimeLocal(meeting.endTime),
        status: meeting.status || 'SCHEDULED',
        location: meeting.location || '',
        meetingLink: meeting.meetingLink || '',
        // Map backend field names to form field names
        participants: (meeting.participants || []).map(p => ({
          id: p.id || uid(),
          adminId: p.adminId || '',
          name: p.adminName || p.name || '',  // Backend sends adminName, form uses name
          email: p.adminEmail || p.email || '',  // Backend sends adminEmail, form uses email
          attended: p.attended || false,
          isCustom: !p.adminId,  // If no adminId, it's a custom/external participant
          role: p.role || 'ATTENDEE',
        })),
        keyPoints: (meeting.keyPoints || []).map(k => ({
          id: k.id || uid(),
          title: k.content || k.title || '',  // Backend sends content, form uses title
          notes: k.notes || '',
          important: k.important || false,
        })),
        actionItems: (meeting.actionItems || []).map(a => ({
          id: a.id || uid(),
          task: a.title || a.task || '',  // Backend sends title, form uses task
          assignedTo: a.assignedTo ? { name: a.assignedTo, adminId: a.assignedToId || '' } : null,
          assignedToId: a.assignedToId || '',
          dueDate: a.dueDate ? formatDateTimeLocal(a.dueDate).split('T')[0] : '',  // Format as date only
          completed: a.completed || false,
        })),
        attachments: (meeting.attachments || []).map(a => ({
          id: a.id || uid(),
          fileName: a.fileName || '',
          fileUrl: a.fileUrl || '',
          fileType: a.fileType || a.fileName?.split('.').pop()?.toLowerCase() || '',
        })),
      };
    }
    return INITIAL_FORM;
  });

  const [tab, setTab] = useState("details");
  const [errors, setErrors] = useState({});
  const [accessibility, setAccessibility] = useState(() => {
    // Determine initial accessibility based on meeting data
    if (meeting) {
      if (meeting.meetingLink && meeting.location) return "HYBRID";
      if (meeting.meetingLink) return "ONLINE";
      if (meeting.location) return "OFFLINE";
    }
    return "ONLINE";
  });
  const showLocation = accessibility === "OFFLINE" || accessibility === "HYBRID";
  const showMeetingLink = accessibility === "ONLINE" || accessibility === "HYBRID";
  const fileInputRef = useRef(null);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // participants
  const addParticipant = () =>
    set("participants", [...(form.participants || []), { id: uid(), adminId: "", name: "", email: "", attended: false, isCustom: false }]);
  const updateP = (id, patch) =>
    set("participants", (form.participants || []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removeP = (id) =>
    set("participants", (form.participants || []).filter((p) => p.id !== id));

  // key points
  const addKP = () =>
    set("keyPoints", [...(form.keyPoints || []), { id: uid(), title: "", notes: "" }]);
  const updateKP = (id, field, val) =>
    set("keyPoints", (form.keyPoints || []).map((k) => (k.id === id ? { ...k, [field]: val } : k)));
  const removeKP = (id) =>
    set("keyPoints", (form.keyPoints || []).filter((k) => k.id !== id));

  // action items
  const addAI = () =>
    set("actionItems", [...(form.actionItems || []), { id: uid(), task: "", assignedTo: null, assignedToId: "", dueDate: "", completed: false }]);
  const updateAI = (id, patch) =>
    set("actionItems", (form.actionItems || []).map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const removeAI = (id) =>
    set("actionItems", (form.actionItems || []).filter((a) => a.id !== id));

  // attachments
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAtts = files.map((f) => ({
      id: uid(),
      fileName: f.name,
      fileUrl: URL.createObjectURL(f),
      fileType: f.name.split(".").pop().toLowerCase(),
      file: f,
    }));
    set("attachments", [...(form.attachments || []), ...newAtts]);
    e.target.value = "";
  };
  const removeAtt = (id) => set("attachments", (form.attachments || []).filter((a) => a.id !== id));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (form.endTime && form.startTime && form.endTime < form.startTime)
      e.endTime = "End time must be after start time";
    if ((accessibility === "OFFLINE" || accessibility === "HYBRID") && !form.location?.trim())
      e.location = "Location is required for in-person meetings";
    if ((accessibility === "ONLINE" || accessibility === "HYBRID") && !form.meetingLink?.trim())
      e.meetingLink = "Meeting link is required for online meetings";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) { setTab("details"); return; }
    onSubmit?.(form);
  };

  const tabCounts = {
    participants: (form.participants || []).length,
    keypoints: (form.keyPoints || []).length,
    actions: (form.actionItems || []).length,
    attachments: (form.attachments || []).length,
  };

  const TABS = [
    { id: "details", label: "Details", icon: <Layout size={16} /> },
    { id: "participants", label: "Participants", icon: <Users size={16} /> },
    { id: "keypoints", label: "Key Points", icon: <Pin size={16} /> },
    { id: "actions", label: "Actions", icon: <Zap size={16} /> },
    { id: "attachments", label: "Attachments", icon: <Paperclip size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: 100 }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* ── Header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              background: ORG, 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: `0 8px 20px ${ORG}40` 
            }}>
              <Calendar className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ ...bc(28, 800, { color: textC, margin: 0 }) }}>
                {isEdit ? "EDIT MEETING" : "NEW MEETING"}
              </h1>
              <p style={{ ...ba(14, 500, { color: text3, margin: 0 }) }}>
                {isEdit ? "Update session details and participants" : "Schedule a new collaboration session"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Status & Actions Bar ── */}
        <div style={{ 
          background: bg2, 
          border: `1px solid ${border}`, 
          borderRadius: 20, 
          padding: '16px 24px', 
          marginBottom: 24, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ ...bc(11, 800, { color: text3, letterSpacing: '0.1em' }) }}>STATUS</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map((s) => {
                const m = STATUS_META[s];
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '6px 14px', 
                      borderRadius: 100, 
                      ...bc(11, 700), 
                      border: `1px solid ${active ? m.color : border}`,
                      background: active ? `${m.color}1a` : bg,
                      color: active ? m.color : text3,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />
                    {m.label.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ 
                padding: '8px 20px', 
                borderRadius: 10, 
                ...bc(12, 700, { color: text2 }), 
                background: bg, 
                border: `1px solid ${border}`, 
                cursor: 'pointer' 
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ 
                padding: '8px 24px', 
                borderRadius: 10, 
                ...bc(12, 700, { color: '#fff' }), 
                background: ORG, 
                border: 'none', 
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${ORG}40`,
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "SAVING..." : (isEdit ? "UPDATE MEETING" : "CREATE MEETING")}
            </button>
          </div>
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
                type="button"
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

        <form onSubmit={handleSubmit}>

          {/* ══════════════ DETAILS ══════════════ */}
          {tab === "details" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: bg2, 
                border: `1px solid ${border}`, 
                borderRadius: 24, 
                padding: '32px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
              }}
              className="space-y-6"
            >
              {/* Title */}
              <div>
                <FieldLabel>MEETING TITLE *</FieldLabel>
                <Input
                  placeholder="e.g. Weekly Sync or Q3 Strategic Planning"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  error={errors.title}
                  style={{ ...ba(16, 600) }}
                />
                {errors.title && (
                  <p style={{ ...ba(12, 500, { color: '#ef4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }) }}>
                    <AlertCircle size={14} /> {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <FieldLabel>DESCRIPTION</FieldLabel>
                <textarea
                  style={{
                    width: '100%',
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: textC,
                    ...ba(14, 500),
                    outline: 'none',
                    minHeight: 100,
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Outline the meeting's core objective..."
                  value={form.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>START TIME *</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: text3, pointerEvents: 'none' }} />
                    <input
                      type="datetime-local"
                      style={{
                        width: '100%',
                        background: bg,
                        border: `1px solid ${errors.startTime ? '#ef4444' : border}`,
                        borderRadius: 12,
                        padding: '10px 16px 10px 44px',
                        color: textC,
                        ...ba(14, 500),
                        outline: 'none'
                      }}
                      value={form.startTime}
                      onChange={(e) => set("startTime", e.target.value)}
                    />
                  </div>
                  {errors.startTime && (
                    <p style={{ ...ba(12, 500, { color: '#ef4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }) }}>
                      <AlertCircle size={14} /> {errors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel>END TIME</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: text3, pointerEvents: 'none' }} />
                    <input
                      type="datetime-local"
                      style={{
                        width: '100%',
                        background: bg,
                        border: `1px solid ${errors.endTime ? '#ef4444' : border}`,
                        borderRadius: 12,
                        padding: '10px 16px 10px 44px',
                        color: textC,
                        ...ba(14, 500),
                        outline: 'none'
                      }}
                      value={form.endTime || ""}
                      onChange={(e) => set("endTime", e.target.value)}
                    />
                  </div>
                  {errors.endTime && (
                    <p style={{ ...ba(12, 500, { color: '#ef4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }) }}>
                      <AlertCircle size={14} /> {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ height: 1, background: border, margin: '16px 0' }} />

              {/* ── Accessibility ── */}
              <div>
                <FieldLabel>COLLABORATION MODE</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  {ACCESSIBILITY_OPTIONS.map((opt) => {
                    const active = accessibility === opt.value;
                    const Icon = opt.value === 'ONLINE' ? Laptop : opt.value === 'OFFLINE' ? MapPin : Globe;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAccessibility(opt.value)}
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: 12, 
                          padding: '16px 12px', 
                          borderRadius: 16, 
                          border: `2px solid ${active ? ORG : border}`, 
                          background: active ? `${ORG}08` : bg, 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Icon size={20} style={{ color: active ? ORG : text3 }} />
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ ...bc(12, 700, { color: active ? ORG : text2 }) }}>{opt.label.toUpperCase()}</div>
                          <div style={{ ...ba(10, 500, { color: text3 }) }}>{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Conditional fields ── */}
              {(showLocation || showMeetingLink) && (
                <div className={`grid grid-cols-1 gap-6 ${showLocation && showMeetingLink ? "sm:grid-cols-2" : ""}`}>
                  {showLocation && (
                    <div>
                      <FieldLabel>PHYSICAL LOCATION {accessibility === "OFFLINE" ? "*" : ""}</FieldLabel>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: text3, pointerEvents: 'none' }} />
                        <Input
                          placeholder="e.g. Conference Room B"
                          value={form.location || ""}
                          onChange={(e) => set("location", e.target.value)}
                          error={errors.location}
                          style={{ paddingLeft: 44, background: bg }}
                        />
                      </div>
                      {errors.location && (
                        <p style={{ ...ba(12, 500, { color: '#ef4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }) }}>
                          <AlertCircle size={14} /> {errors.location}
                        </p>
                      )}
                    </div>
                  )}
                  {showMeetingLink && (
                    <div>
                      <FieldLabel>VIRTUAL LINK {accessibility === "ONLINE" ? "*" : ""}</FieldLabel>
                      <div style={{ position: 'relative' }}>
                        <LinkIcon size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: text3, pointerEvents: 'none' }} />
                        <Input
                          placeholder="https://meet.google.com/..."
                          value={form.meetingLink || ""}
                          onChange={(e) => set("meetingLink", e.target.value)}
                          error={errors.meetingLink}
                          style={{ paddingLeft: 44, background: bg }}
                        />
                      </div>
                      {errors.meetingLink && (
                        <p style={{ ...ba(12, 500, { color: '#ef4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }) }}>
                          <AlertCircle size={14} /> {errors.meetingLink}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════ PARTICIPANTS ══════════════ */}
          {tab === "participants" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: bg2, 
                border: `1px solid ${border}`, 
                borderRadius: 24, 
                padding: '32px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>PARTICIPANTS</h3>
                  <p style={{ ...ba(14, 500, { color: text3, margin: '4px 0 0' }) }}>
                    Search system admins or add external collaborators
                  </p>
                </div>
                <SectionAddBtn onClick={addParticipant} label="Add Person" />
              </div>

              {(form.participants || []).length === 0 ? (
                <EmptyState icon={<Users size={48} />} text="No participants added yet" sub="Include people who will join this session" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(form.participants || []).map((p, i) => (
                    <motion.div 
                      key={p.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        background: bg, 
                        border: `1px solid ${border}`, 
                        borderRadius: 16, 
                        padding: '16px 20px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            background: `${ORG}1a`, 
                            color: ORG, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            ...bc(10, 800)
                          }}>
                            {i + 1}
                          </div>
                          <span style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.05em' }) }}>PARTICIPANT</span>
                          {p.isCustom && (
                            <span style={{ ...ba(10, 700, { background: `${ORG}1a`, color: ORG, padding: '2px 8px', borderRadius: 4 }) }}>EXTERNAL</span>
                          )}
                          {p.adminId && (
                            <span style={{ ...ba(10, 700, { background: `${TEAL}1a`, color: TEAL, padding: '2px 8px', borderRadius: 4 }) }}>ADMIN</span>
                          )}
                        </div>
                        <RemoveBtn onClick={() => removeP(p.id)} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <FieldLabel>NAME / SEARCH</FieldLabel>
                          <AdminSearchInput
                            admins={admins}
                            value={p.name ? { name: p.name, isCustom: p.isCustom, adminId: p.adminId } : null}
                            onChange={(val) => {
                              if (val) updateP(p.id, { adminId: val.adminId || "", name: val.name, email: val.email || p.email || "", isCustom: val.isCustom });
                              else updateP(p.id, { adminId: "", name: "", email: "", isCustom: false });
                            }}
                          />
                        </div>

                        {p.name && (
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <FieldLabel>EMAIL ADDRESS</FieldLabel>
                              <Input
                                placeholder="name@example.com"
                                value={p.email || ""}
                                onChange={(e) => updateP(p.id, { email: e.target.value })}
                                style={{ background: bg2 }}
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
                              <span style={{ ...bc(9, 800, { color: text3 }) }}>ATTENDED</span>
                              <Toggle checked={!!p.attended} onChange={(val) => updateP(p.id, { attended: val })} />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════ KEY POINTS ══════════════ */}
          {tab === "keypoints" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: bg2, 
                border: `1px solid ${border}`, 
                borderRadius: 24, 
                padding: '32px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>KEY POINTS</h3>
                  <p style={{ ...ba(14, 500, { color: text3, margin: '4px 0 0' }) }}>Capture important discussion topics and decisions</p>
                </div>
                <SectionAddBtn onClick={addKP} label="Add Point" />
              </div>

              {(form.keyPoints || []).length === 0 ? (
                <EmptyState icon={<Pin size={48} />} text="No key points recorded" sub="Document important takeaways from the session" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(form.keyPoints || []).map((k, i) => (
                    <motion.div 
                      key={k.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        background: bg, 
                        border: `1px solid ${border}`, 
                        borderRadius: 16, 
                        padding: '20px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            background: `${ORG}1a`, 
                            color: ORG, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            ...bc(10, 800)
                          }}>
                            {i + 1}
                          </div>
                          <span style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.05em' }) }}>KEY POINT</span>
                        </div>
                        <RemoveBtn onClick={() => removeKP(k.id)} />
                      </div>
                        <div className="space-y-4">
                        <div>
                          <FieldLabel>TOPIC / TITLE</FieldLabel>
                          <Input
                            placeholder="Briefly state the point..."
                            value={k.title}
                            onChange={(e) => updateKP(k.id, "title", e.target.value)}
                            style={{ background: bg2 }}
                          />
                        </div>
                        <div>
                          <FieldLabel>DETAILED NOTES</FieldLabel>
                          <textarea
                            style={{
                              width: '100%',
                              background: bg2,
                              border: `1px solid ${border}`,
                              borderRadius: 12,
                              padding: '12px 16px',
                              color: textC,
                              ...ba(14, 500),
                              outline: 'none',
                              minHeight: 80,
                              resize: 'vertical'
                            }}
                            placeholder="Elaborate on the discussion or decision..."
                            value={k.notes}
                            onChange={(e) => updateKP(k.id, "notes", e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════ ACTION ITEMS ══════════════ */}
          {tab === "actions" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: bg2, 
                border: `1px solid ${border}`, 
                borderRadius: 24, 
                padding: '32px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h3 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>ACTION ITEMS</h3>
                  <p style={{ ...ba(14, 500, { color: text3, margin: '4px 0 0' }) }}>Assign specific tasks and set deadlines</p>
                </div>
                <SectionAddBtn onClick={addAI} label="Add Task" />
              </div>

              {(form.actionItems || []).length === 0 ? (
                <EmptyState icon={<Zap size={48} />} text="No action items yet" sub="Assign responsibilities that arose during the session" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(form.actionItems || []).map((a, i) => (
                    <motion.div 
                      key={a.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        background: a.completed ? `${TEAL}08` : bg, 
                        border: `1px solid ${a.completed ? TEAL : border}`, 
                        borderRadius: 16, 
                        padding: '20px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            background: a.completed ? `${TEAL}1a` : `${ORG}1a`, 
                            color: a.completed ? TEAL : ORG, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            ...bc(10, 800)
                          }}>
                            {a.completed ? <Check size={14} strokeWidth={3} /> : i + 1}
                          </div>
                          <span style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.05em' }) }}>TASK ITEM</span>
                          {a.completed && <span style={{ ...ba(10, 700, { background: `${TEAL}1a`, color: TEAL, padding: '2px 8px', borderRadius: 4 }) }}>COMPLETED</span>}
                        </div>
                        <RemoveBtn onClick={() => removeAI(a.id)} />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <FieldLabel>TASK DESCRIPTION</FieldLabel>
                          <Input
                            placeholder="What needs to be done?"
                            value={a.task}
                            onChange={(e) => updateAI(a.id, { task: e.target.value })}
                            style={{ 
                              background: bg2,
                              textDecoration: a.completed ? 'line-through' : 'none',
                              opacity: a.completed ? 0.6 : 1
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <FieldLabel>ASSIGNED TO</FieldLabel>
                            <AdminSearchInput
                              admins={admins}
                              value={a.assignedTo}
                              onChange={(val) => updateAI(a.id, { assignedTo: val, assignedToId: val?.adminId || "" })}
                              placeholder="Search owner..."
                            />
                          </div>
                          <div>
                            <FieldLabel>DUE DATE</FieldLabel>
                            <div style={{ position: 'relative' }}>
                              <Calendar size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: text3, pointerEvents: 'none' }} />
                              <Input
                                type="date"
                                value={a.dueDate}
                                onChange={(e) => updateAI(a.id, { dueDate: e.target.value })}
                                style={{ paddingLeft: 44, background: bg2 }}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                          <Toggle checked={!!a.completed} onChange={(val) => updateAI(a.id, { completed: val })} />
                          <span style={{ ...ba(13, 600, { color: a.completed ? TEAL : text2 }) }}>
                            {a.completed ? 'TASK IS DONE' : 'MARK AS COMPLETED'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════ ATTACHMENTS ══════════════ */}
          {tab === "attachments" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: bg2, 
                border: `1px solid ${border}`, 
                borderRadius: 24, 
                padding: '32px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>DOCUMENTATION</h3>
                <p style={{ ...ba(14, 500, { color: text3, margin: '4px 0 0' }) }}>Upload meeting minutes, slides, or relevant files</p>
              </div>

              {/* Upload Zone */}
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
              <motion.button
                whileHover={{ borderColor: ORG, background: `${ORG}04` }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '100%', 
                  border: `2px dashed ${border}`, 
                  borderRadius: 20, 
                  padding: '40px 24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 16, 
                  background: bg, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 16, 
                  background: `${ORG}1a`, 
                  color: ORG, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Plus size={32} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ ...bc(16, 700, { color: textC }) }}>ADD ATTACHMENTS</div>
                  <div style={{ ...ba(13, 400, { color: text3, marginTop: 4 }) }}>Drag files here or click to browse</div>
                </div>
              </motion.button>

              {(form.attachments || []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                  {(form.attachments || []).map((att) => (
                    <motion.div 
                      key={att.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 16, 
                        padding: '12px 16px', 
                        background: bg, 
                        border: `1px solid ${border}`, 
                        borderRadius: 12 
                      }}
                    >
                      <div style={{ color: ORG }}><FileText size={20} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...bc(14, 700, { color: textC }) }} className="truncate">{att.fileName}</div>
                        <div style={{ ...ba(11, 500, { color: text3 }) }}>{att.fileType.toUpperCase()} FILE</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {att.fileUrl && (
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
                            onMouseEnter={(e) => e.currentTarget.style.color = ORG}
                            onMouseLeave={(e) => e.currentTarget.style.color = text3}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button 
                          onClick={() => removeAtt(att.id)}
                          style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: 8, 
                            background: bg2, 
                            color: text3, 
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = text3}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Submit Footer ── */}
          <div style={{ 
            marginTop: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: bg2,
            border: `1px solid ${border}`,
            borderRadius: 24,
            padding: '24px 32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ flex: 1 }}>
              {Object.keys(errors).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444' }}>
                  <AlertCircle size={18} />
                  <span style={{ ...ba(13, 600) }}>Please review errors in the Details tab</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                type="button"
                onClick={onCancel}
                style={{ 
                  padding: '12px 32px', 
                  borderRadius: 12, 
                  ...bc(13, 700, { color: text2 }), 
                  background: bg, 
                  border: `1px solid ${border}`, 
                  cursor: 'pointer',
                  letterSpacing: '0.05em' 
                }}
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ 
                  padding: '12px 40px', 
                  borderRadius: 12, 
                  ...bc(13, 700, { color: '#fff' }), 
                  background: ORG, 
                  border: 'none', 
                  cursor: 'pointer',
                  boxShadow: `0 8px 25px ${ORG}40`,
                  letterSpacing: '0.05em',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? "SAVING..." : (isEdit ? "SAVE CHANGES" : "CREATE SESSION")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

