import { useState, useRef } from "react";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED", "MISSED"];

const STATUS_META = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500", activeBorder: "border-yellow-400" },
  IN_PROGRESS: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", activeBorder: "border-blue-400" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", activeBorder: "border-green-400" },
  MISSED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", activeBorder: "border-red-400" },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// Helper to format ISO date to date input
function formatDateInput(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toISOString().slice(0, 10);
  } catch {
    return '';
  }
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

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
      {children} {required && <span className="text-red-400">*</span>}
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

function SectionAddBtn({ onClick, label = "Add" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-orange-200 hover:shadow-orange-300"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      {label}
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
  weekStart: "",
  weekEnd: "",
  status: "PENDING",
  progress: 0,
  tasks: [],
  reviewNotes: [],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WeeklyGoalForm({
  goal = null,
  currentAdmin = null,
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const isEdit = !!goal;

  // Initialize form state from goal prop when editing
  const [form, setForm] = useState(() => {
    if (goal) {
      // Parse reviewNotes if it's a string
      let parsedReviewNotes = [];
      if (goal.reviewNotes) {
        try {
          parsedReviewNotes = typeof goal.reviewNotes === 'string'
            ? JSON.parse(goal.reviewNotes)
            : goal.reviewNotes;
        } catch {
          parsedReviewNotes = [];
        }
      }

      // Parse tasks if needed
      let parsedTasks = [];
      if (goal.tasks) {
        try {
          parsedTasks = typeof goal.tasks === 'string'
            ? JSON.parse(goal.tasks)
            : goal.tasks;
          parsedTasks = parsedTasks.map(t => ({ ...t, id: t.id || uid() }));
        } catch {
          parsedTasks = [];
        }
      }

      return {
        title: goal.title || '',
        description: goal.description || '',
        weekStart: formatDateInput(goal.weekStart),
        weekEnd: formatDateInput(goal.weekEnd),
        status: goal.status || 'PENDING',
        progress: goal.progress || 0,
        tasks: parsedTasks,
        reviewNotes: parsedReviewNotes.map(r => ({ ...r, id: r.id || uid() })),
      };
    }
    return INITIAL_FORM;
  });

  const [tab, setTab] = useState("details");
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // Tasks
  const addTask = () =>
    set("tasks", [...(form.tasks || []), { id: uid(), title: "", description: "", done: false }]);
  const updateTask = (id, patch) =>
    set("tasks", (form.tasks || []).map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTask = (id) =>
    set("tasks", (form.tasks || []).filter((t) => t.id !== id));

  // Review Notes
  const addReviewNote = () => {
    if (!currentAdmin) return;
    set("reviewNotes", [...(form.reviewNotes || []), {
      id: uid(),
      adminId: currentAdmin.id,
      name: currentAdmin.adminName || currentAdmin.name || '',
      notes: ""
    }]);
  };
  const updateReviewNote = (id, notes) =>
    set("reviewNotes", (form.reviewNotes || []).map((r) => (r.id === id ? { ...r, notes } : r)));
  const removeReviewNote = (id) =>
    set("reviewNotes", (form.reviewNotes || []).filter((r) => r.id !== id));

  // Calculate progress from tasks
  const calculateProgress = () => {
    const tasks = form.tasks || [];
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.done).length;
    return Math.round((done / tasks.length) * 100);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.weekStart) e.weekStart = "Week start date is required";
    if (!form.weekEnd) e.weekEnd = "Week end date is required";
    if (form.weekEnd && form.weekStart && form.weekEnd < form.weekStart)
      e.weekEnd = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) { setTab("details"); return; }

    // Auto-calculate progress from tasks
    const progress = calculateProgress();
    onSubmit?.({ ...form, progress });
  };

  const tabCounts = {
    tasks: (form.tasks || []).length,
    review: (form.reviewNotes || []).length,
  };

  const TABS = [
    {
      id: "details", label: "Details",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      id: "tasks", label: "Tasks",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      id: "review", label: "Review Notes",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
    },
  ];

  // Get progress color
  const getProgressColor = () => {
    const p = form.progress || calculateProgress();
    if (p >= 80) return 'from-green-500 to-emerald-600';
    if (p >= 50) return 'from-blue-500 to-indigo-600';
    if (p >= 25) return 'from-yellow-500 to-amber-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 flex items-start justify-center px-4 py-10 pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .wgf-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; filter: invert(55%) sepia(90%) saturate(500%) hue-rotate(340deg); }
        .tab-bar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="wgf-wrap w-full max-w-3xl">

        {/* ── Header ── */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm shadow-orange-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">Weekly Goals</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {isEdit ? "Edit Weekly Goal" : "Create New Goal"}
          </h1>
          <p className="text-sm text-stone-400 mt-1 font-medium">
            {isEdit ? "Update the details of this goal" : "Set your objectives for the week"}
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
                  {s.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Progress</span>
            <span className="text-sm font-extrabold text-orange-500">{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-2 font-medium">
            {(form.tasks || []).filter(t => t.done).length} of {(form.tasks || []).length} tasks completed
          </p>
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
                <FieldLabel required>Title</FieldLabel>
                <Input
                  placeholder="e.g. Complete API Integration"
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
                  placeholder="What do you want to achieve this week?"
                  value={form.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              {/* Week Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Week Start</FieldLabel>
                  <input
                    type="date"
                    className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium outline-none transition-all ${
                      errors.weekStart ? "border-red-400 ring-2 ring-red-100" : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300"
                    }`}
                    value={form.weekStart}
                    onChange={(e) => set("weekStart", e.target.value)}
                  />
                  {errors.weekStart && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-semibold">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                      {errors.weekStart}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel required>Week End</FieldLabel>
                  <input
                    type="date"
                    className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm text-stone-800 font-medium outline-none transition-all ${
                      errors.weekEnd ? "border-red-400 ring-2 ring-red-100" : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-stone-300"
                    }`}
                    value={form.weekEnd || ""}
                    onChange={(e) => set("weekEnd", e.target.value)}
                  />
                  {errors.weekEnd && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-semibold">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                      {errors.weekEnd}
                    </p>
                  )}
                </div>
              </div>

              {isEdit && goal?.owner && (
                <div className="pt-4 border-t border-stone-100">
                  <FieldLabel>Owner</FieldLabel>
                  <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                      {initials(goal.owner.adminName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{goal.owner.adminName}</p>
                      <p className="text-xs text-stone-400">{goal.owner.adminEmail}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TASKS ══════════════ */}
          {tab === "tasks" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">Tasks</h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">
                    Break down your goal into actionable tasks
                  </p>
                </div>
                <SectionAddBtn onClick={addTask} label="Add Task" />
              </div>

              {(form.tasks || []).length === 0 ? (
                <EmptyState icon="✅" text="No tasks yet" sub="Click Add Task to create your first task" />
              ) : (
                <div className="space-y-3">
                  {(form.tasks || []).map((task, i) => (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-4 transition-all ${
                        task.done ? "bg-green-50/60 border-green-200" : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${task.done ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"}`}>
                            {task.done ? "✓" : i + 1}
                          </div>
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Task</span>
                          {task.done && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">Done</span>}
                        </div>
                        <RemoveBtn onClick={() => removeTask(task.id)} />
                      </div>

                      <div className="mb-3">
                        <FieldLabel>Task Title</FieldLabel>
                        <input
                          className={`w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder-stone-300 ${task.done ? "line-through text-stone-400" : "text-stone-800"}`}
                          placeholder="e.g. Design API endpoints"
                          value={task.title}
                          onChange={(e) => updateTask(task.id, { title: e.target.value })}
                        />
                      </div>

                      <div className="mb-3">
                        <FieldLabel>Description (optional)</FieldLabel>
                        <textarea
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none placeholder-stone-300"
                          rows={2}
                          placeholder="Additional details..."
                          value={task.description || ""}
                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <Toggle checked={!!task.done} onChange={(val) => updateTask(task.id, { done: val })} />
                        <span className="text-xs font-semibold text-stone-500">Mark as done</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ REVIEW NOTES ══════════════ */}
          {tab === "review" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">Review Notes</h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">
                    End-of-week reflections and notes from team members
                  </p>
                </div>
                {currentAdmin && (
                  <SectionAddBtn onClick={addReviewNote} label="Add Note" />
                )}
              </div>

              {(form.reviewNotes || []).length === 0 ? (
                <EmptyState icon="💬" text="No review notes yet" sub="Add reflections at the end of the week" />
              ) : (
                <div className="space-y-3">
                  {(form.reviewNotes || []).map((note, i) => (
                    <div key={note.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                            {initials(note.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-stone-800">{note.name}</p>
                            <p className="text-[10px] text-stone-400 font-medium">Team Member</p>
                          </div>
                        </div>
                        <RemoveBtn onClick={() => removeReviewNote(note.id)} />
                      </div>

                      <textarea
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none placeholder-stone-300"
                        rows={3}
                        placeholder="What went well? What could be improved?"
                        value={note.notes}
                        onChange={(e) => updateReviewNote(note.id, e.target.value)}
                      />
                    </div>
                  ))}
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
                {isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Goal")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
