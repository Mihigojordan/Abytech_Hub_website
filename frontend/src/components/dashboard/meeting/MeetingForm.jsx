import { useState, useRef, useEffect } from "react";

const STATUS_OPTIONS = ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"];

const STATUS_META = {
  SCHEDULED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", activeBorder: "border-blue-400" },
  ONGOING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", activeBorder: "border-amber-400" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", activeBorder: "border-green-400" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", activeBorder: "border-red-400" },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// Helper to format ISO date to datetime-local
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
    <div ref={ref} className="relative">
      <div
        className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-2.5 transition-all ${
          focused ? "border-orange-400 ring-2 ring-orange-100 shadow-sm" : "border-stone-200 hover:border-stone-300"
        }`}
      >
        <svg className="w-4 h-4 text-stone-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="flex-1 text-sm text-stone-800 outline-none bg-transparent placeholder-stone-300 font-medium"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
        />
        {value?.isCustom && (
          <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold tracking-wide shrink-0">
            CUSTOM
          </span>
        )}
        {value && !value.isCustom && (
          <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-bold tracking-wide shrink-0">
            ADMIN
          </span>
        )}
        {query && (
          <button type="button" onClick={clear} className="text-stone-300 hover:text-stone-500 transition-colors shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-xl shadow-stone-200/80 overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {filtered.length > 0 ? (
              <>
                <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50">
                  Admins
                </div>
                {filtered.map((admin) => (
                  <button
                    key={admin.id}
                    type="button"
                    onMouseDown={() => selectAdmin(admin)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials(admin.adminName)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-800">{admin.adminName}</div>
                      <div className="text-xs text-stone-400">{admin.adminEmail}</div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-stone-400 text-center">No admins match "{query}"</div>
            )}
          </div>
          {query.trim() && (
            <div className="border-t border-stone-100 bg-orange-50/40">
              <button
                type="button"
                onMouseDown={addCustom}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-orange-600">Add "{query}" as external</div>
                  <div className="text-xs text-stone-400">Not an admin account</div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────
function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="text-5xl mb-3 opacity-60">{icon}</div>
      <p className="text-sm font-semibold text-stone-500">{text}</p>
      <p className="text-xs text-stone-400 mt-1">{sub}</p>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5 cursor-pointer ${checked ? "bg-green-500" : "bg-stone-200"}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function Input({ className = "", error, ...props }) {
  return (
    <input
      className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium outline-none transition-all placeholder-stone-300
        ${error ? "border-red-400 ring-2 ring-red-100" : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300"}
        ${className}`}
      {...props}
    />
  );
}

function SectionAddBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-orange-200 hover:shadow-orange-300"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      Add
    </button>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-stone-300 hover:text-red-400 transition-colors p-1">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}

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

// UI-only, not submitted
const ACCESSIBILITY_OPTIONS = [
  {
    value: "ONLINE",
    label: "Online",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    desc: "Virtual only",
  },
  {
    value: "OFFLINE",
    label: "Offline",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    desc: "In-person only",
  },
  {
    value: "HYBRID",
    label: "Hybrid",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    desc: "Both",
  },
];

const FILE_ICONS = {
  pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊",
  ppt: "📊", pptx: "📊", png: "🖼️", jpg: "🖼️", jpeg: "🖼️",
  gif: "🖼️", svg: "🖼️", mp4: "🎬", mp3: "🎵", zip: "🗜️",
  rar: "🗜️", txt: "📃", csv: "📊", default: "📎",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MeetingForm({
  meeting = null,
  admins = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
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
    {
      id: "details", label: "Details",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      id: "participants", label: "Participants",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      id: "keypoints", label: "Key Points",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      id: "actions", label: "Actions",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      id: "attachments", label: "Attachments",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 flex items-start justify-center px-4 py-10 pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .mf-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }
        input[type=datetime-local]::-webkit-calendar-picker-indicator,
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; filter: invert(55%) sepia(90%) saturate(500%) hue-rotate(340deg); }
        .tab-bar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="mf-wrap w-full ">

        {/* ── Header ── */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm shadow-orange-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">Meeting Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {isEdit ? "Edit Meeting" : "Schedule a New Meeting"}
          </h1>
          <p className="text-sm text-stone-400 mt-1 font-medium">
            {isEdit ? "Update the details of this meeting record" : "Fill in the form below to create a meeting"}
          </p>
        </div>

        {/* ── Status Bar ── */}
        <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4 mb-5 shadow-sm flex items-center gap-4 flex-wrap">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Status</span>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => {
              const m = STATUS_META[s];
              const active = form.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-150 ${
                    active
                      ? `${m.bg} ${m.text} ${m.activeBorder} shadow-sm`
                      : "bg-white text-stone-400 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? m.dot : "bg-stone-300"} transition-all`} />
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tab-bar flex gap-1 bg-white border border-stone-200 rounded-2xl p-1.5 mb-5 shadow-sm overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.id;
            const count = tabCounts[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex-1 justify-center uppercase tracking-wide ${
                  active
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-4 ${
                      active ? "bg-white/25 text-white" : "bg-orange-100 text-orange-600"
                    }`}
                  >
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
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm space-y-5">

              {/* Title */}
              <div>
                <FieldLabel>Title *</FieldLabel>
                <Input
                  placeholder="e.g. Q2 Planning Session"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  error={errors.title}
                />
                {errors.title && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-semibold">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 font-medium outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300 placeholder-stone-300 resize-none"
                  rows={3}
                  placeholder="What is this meeting about?"
                  value={form.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Start Time *</FieldLabel>
                  <input
                    type="datetime-local"
                    className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium outline-none transition-all ${
                      errors.startTime ? "border-red-400 ring-2 ring-red-100" : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300"
                    }`}
                    value={form.startTime}
                    onChange={(e) => set("startTime", e.target.value)}
                  />
                  {errors.startTime && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-semibold">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel>End Time</FieldLabel>
                  <input
                    type="datetime-local"
                    className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium outline-none transition-all ${
                      errors.endTime ? "border-red-400 ring-2 ring-red-100" : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300"
                    }`}
                    value={form.endTime || ""}
                    onChange={(e) => set("endTime", e.target.value)}
                  />
                  {errors.endTime && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-semibold">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-stone-100" />

              {/* ── Accessibility (UI-only, not submitted) ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FieldLabel>Accessibility</FieldLabel>
                  <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide -mt-1.5">UI only</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ACCESSIBILITY_OPTIONS.map((opt) => {
                    const active = accessibility === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAccessibility(opt.value)}
                        className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 text-xs font-bold transition-all duration-150 ${
                          active
                            ? "bg-orange-50 border-orange-400 text-orange-600 shadow-sm shadow-orange-100"
                            : "bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300 hover:bg-white hover:text-stone-600"
                        }`}
                      >
                        <span className={`${active ? "text-orange-500" : "text-stone-400"} transition-colors`}>
                          {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                        <span className={`text-[10px] font-normal ${active ? "text-orange-400" : "text-stone-300"}`}>
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Conditional fields based on accessibility ── */}
              {(showLocation || showMeetingLink) && (
                <div className={`grid grid-cols-1 gap-4 ${showLocation && showMeetingLink ? "sm:grid-cols-2" : ""}`}>
                  {showLocation && (
                    <div>
                      <FieldLabel>
                        Location {accessibility === "OFFLINE" ? "*" : ""}
                      </FieldLabel>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          className={`w-full bg-stone-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-800 font-medium outline-none transition-all placeholder-stone-300 ${
                            errors.location ? "border-red-400 ring-2 ring-red-100" : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300"
                          }`}
                          placeholder="Conference room, address..."
                          value={form.location || ""}
                          onChange={(e) => set("location", e.target.value)}
                        />
                      </div>
                      {errors.location && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-semibold">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                          {errors.location}
                        </p>
                      )}
                    </div>
                  )}
                  {showMeetingLink && (
                    <div>
                      <FieldLabel>
                        Meeting Link {accessibility === "ONLINE" ? "*" : ""}
                      </FieldLabel>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <input
                          className={`w-full bg-stone-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-800 font-medium outline-none transition-all placeholder-stone-300 ${
                            errors.meetingLink ? "border-red-400 ring-2 ring-red-100" : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300"
                          }`}
                          placeholder="https://meet.google.com/..."
                          value={form.meetingLink || ""}
                          onChange={(e) => set("meetingLink", e.target.value)}
                        />
                      </div>
                      {errors.meetingLink && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-semibold">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                          {errors.meetingLink}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ PARTICIPANTS ══════════════ */}
          {tab === "participants" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">Participants</h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">
                    Search admins or add external attendees
                  </p>
                </div>
                <SectionAddBtn onClick={addParticipant} />
              </div>

              {(form.participants || []).length === 0 ? (
                <EmptyState icon="👥" text="No participants yet" sub="Click Add to include someone" />
              ) : (
                <div className="space-y-3">
                  {(form.participants || []).map((p, i) => (
                    <div key={p.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </div>
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Participant</span>
                          {p.isCustom && (
                            <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">External</span>
                          )}
                          {p.adminId && (
                            <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-bold">Admin</span>
                          )}
                        </div>
                        <RemoveBtn onClick={() => removeP(p.id)} />
                      </div>

                      <div className="mb-3">
                        <FieldLabel>Name / Admin</FieldLabel>
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
                        <div className="flex items-end gap-4">
                          <div className="flex-1">
                            <FieldLabel>Email</FieldLabel>
                            <input
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 font-medium outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all placeholder-stone-300"
                              placeholder="email@example.com"
                              value={p.email || ""}
                              onChange={(e) => updateP(p.id, { email: e.target.value })}
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pb-2">
                            <Toggle checked={!!p.attended} onChange={(val) => updateP(p.id, { attended: val })} />
                            <span className="text-xs font-semibold text-stone-500">Attended</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ KEY POINTS ══════════════ */}
          {tab === "keypoints" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">Key Points</h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">Important topics & discussion notes</p>
                </div>
                <SectionAddBtn onClick={addKP} />
              </div>

              {(form.keyPoints || []).length === 0 ? (
                <EmptyState icon="📌" text="No key points recorded" sub="Add important topics from the meeting" />
              ) : (
                <div className="space-y-3">
                  {(form.keyPoints || []).map((k, i) => (
                    <div key={k.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Key Point</span>
                        </div>
                        <RemoveBtn onClick={() => removeKP(k.id)} />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <FieldLabel>Title</FieldLabel>
                          <input
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder-stone-300"
                            placeholder="e.g. Database Performance Issue"
                            value={k.title}
                            onChange={(e) => updateKP(k.id, "title", e.target.value)}
                          />
                        </div>
                        <div>
                          <FieldLabel>Notes</FieldLabel>
                          <textarea
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none placeholder-stone-300"
                            rows={3}
                            placeholder="Discussion notes and context..."
                            value={k.notes}
                            onChange={(e) => updateKP(k.id, "notes", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ ACTION ITEMS ══════════════ */}
          {tab === "actions" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">Action Items</h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">Tasks assigned from this meeting</p>
                </div>
                <SectionAddBtn onClick={addAI} />
              </div>

              {(form.actionItems || []).length === 0 ? (
                <EmptyState icon="⚡" text="No action items" sub="Assign tasks that came out of this meeting" />
              ) : (
                <div className="space-y-3">
                  {(form.actionItems || []).map((a, i) => (
                    <div
                      key={a.id}
                      className={`border rounded-xl p-4 transition-all ${
                        a.completed ? "bg-green-50/60 border-green-200" : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${a.completed ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"}`}>
                            {a.completed ? "✓" : i + 1}
                          </div>
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Action Item</span>
                          {a.completed && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">Completed</span>}
                        </div>
                        <RemoveBtn onClick={() => removeAI(a.id)} />
                      </div>

                      <div className="mb-3">
                        <FieldLabel>Task Description</FieldLabel>
                        <input
                          className={`w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder-stone-300 ${a.completed ? "line-through text-stone-400" : "text-stone-800"}`}
                          placeholder="e.g. Fix the API endpoint"
                          value={a.task}
                          onChange={(e) => updateAI(a.id, { task: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <FieldLabel>Assigned To</FieldLabel>
                          <AdminSearchInput
                            admins={admins}
                            value={a.assignedTo}
                            onChange={(val) => updateAI(a.id, { assignedTo: val, assignedToId: val?.adminId || "" })}
                            placeholder="Search admin or name..."
                          />
                        </div>
                        <div>
                          <FieldLabel>Due Date</FieldLabel>
                          <input
                            type="date"
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                            value={a.dueDate}
                            onChange={(e) => updateAI(a.id, { dueDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <Toggle checked={!!a.completed} onChange={(val) => updateAI(a.id, { completed: val })} />
                        <span className="text-xs font-semibold text-stone-500">Mark as completed</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ ATTACHMENTS ══════════════ */}
          {tab === "attachments" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">Attachments</h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">Files, slides, or documents for this meeting</p>
                </div>
              </div>

              {/* Drop zone */}
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-stone-200 hover:border-orange-300 bg-stone-50 hover:bg-orange-50/50 rounded-xl p-8 flex flex-col items-center gap-3 transition-all group mb-5"
              >
                <div className="w-14 h-14 bg-orange-100 group-hover:bg-orange-200 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                  <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-stone-600 group-hover:text-orange-600 transition-colors">
                    Click to upload files
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">PDF, Word, Excel, Images, and more</p>
                </div>
              </button>

              {(form.attachments || []).length === 0 ? (
                <EmptyState icon="📎" text="No files attached" sub="Upload files using the button above" />
              ) : (
                <div className="space-y-2">
                  {(form.attachments || []).map((att) => {
                    const icon = FILE_ICONS[att.fileType] || FILE_ICONS.default;
                    return (
                      <div key={att.id} className="flex items-center gap-3 bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-xl px-4 py-3 transition-all group">
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-800 truncate">{att.fileName}</p>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{att.fileType}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {att.fileUrl && (
                            <a
                              href={att.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAtt(att.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Submit Footer ── */}
          <div className="flex items-center justify-between mt-6 bg-white border border-stone-200 rounded-2xl px-6 py-4 shadow-sm">
            <div>
              {Object.keys(errors).length > 0 && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Please fix the errors in Details tab
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold transition-all shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Meeting")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
