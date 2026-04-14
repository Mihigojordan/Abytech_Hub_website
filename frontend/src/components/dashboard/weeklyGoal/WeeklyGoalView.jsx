import { useState } from "react";

const STATUS_META = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500", label: "Pending" },
  IN_PROGRESS: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", label: "In Progress" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", label: "Completed" },
  MISSED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Missed" },
};

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatDateRange(start, end) {
  if (!start || !end) return "—";
  const s = new Date(start);
  const e = new Date(end);
  const startStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} — ${endStr}`;
}

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );
}

function SectionCard({ title, count, icon, children, empty, emptyIcon, emptyText }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <h3 className="font-bold text-stone-800 text-sm">{title}</h3>
          {count !== undefined && (
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
      </div>
      {count === 0 ? (
        <div className="flex flex-col items-center py-10 text-center px-6">
          <span className="text-4xl mb-2 opacity-40">{emptyIcon || "—"}</span>
          <p className="text-sm text-stone-400 font-medium">{emptyText || "Nothing here"}</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">{children}</div>
      )}
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Overview", icon: "◎" },
  { id: "tasks", label: "Tasks", icon: "✅" },
  { id: "review", label: "Review Notes", icon: "💬" },
];

export default function WeeklyGoalView({ goal, onEdit, onBack }) {
  const [tab, setTab] = useState("overview");

  if (!goal) return null;

  const status = STATUS_META[goal.status] || STATUS_META.PENDING;

  // Parse tasks and reviewNotes
  let tasks = [];
  if (goal.tasks) {
    try {
      tasks = typeof goal.tasks === 'string' ? JSON.parse(goal.tasks) : goal.tasks;
    } catch {
      tasks = [];
    }
  }

  let reviewNotes = [];
  if (goal.reviewNotes) {
    try {
      reviewNotes = typeof goal.reviewNotes === 'string' ? JSON.parse(goal.reviewNotes) : goal.reviewNotes;
    } catch {
      reviewNotes = [];
    }
  }

  const completedTasks = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : (goal.progress || 0);

  const tabCounts = {
    tasks: tasks.length,
    review: reviewNotes.length,
  };

  const getProgressColor = () => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-indigo-600';
    if (progress >= 25) return 'from-yellow-500 to-amber-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 px-4 py-10 pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .wgv-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .tab-scroll::-webkit-scrollbar { display: none; }
        .progress-bar { transition: width 0.6s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div className="wgv-wrap w-full  mx-auto">

        {/* Back + Edit bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-orange-600 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            All Goals
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Goal
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`${status.bg} ${status.text} border ${status.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </Badge>
              </div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight leading-tight mb-2">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-sm text-stone-500 font-medium leading-relaxed max-w-xl">{goal.description}</p>
              )}
            </div>

            {/* Progress Circle */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 text-center shrink-0">
              <div className="text-2xl font-extrabold text-orange-500 leading-none">{progress}%</div>
              <div className="text-[11px] font-bold text-orange-300 uppercase tracking-widest mt-1">Progress</div>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Week</div>
              <div className="text-sm font-semibold text-stone-700">{formatDateRange(goal.weekStart, goal.weekEnd)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Tasks</div>
              <div className="text-sm font-semibold text-stone-700">{completedTasks} / {tasks.length} done</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Owner</div>
              <div className="text-sm font-semibold text-stone-700">{goal.owner?.adminName || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Last Updated</div>
              <div className="text-sm font-semibold text-stone-700">{formatDate(goal.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Task Completion</span>
            <span className="text-sm font-extrabold text-orange-500">{progress}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <div
              className={`progress-bar h-full rounded-full bg-gradient-to-r ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-stone-400 font-medium">{completedTasks} done · {tasks.length - completedTasks} remaining</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Tasks", value: tasks.length, sub: `${completedTasks} done`, icon: "✅", color: "text-green-600", bg: "bg-green-50" },
            { label: "Notes", value: reviewNotes.length, sub: "reflections", icon: "💬", color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Status", value: status.label, sub: "current", icon: "📊", color: "text-blue-600", bg: "bg-blue-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-stone-200 rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-1">
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center text-sm mb-1`}>{s.icon}</div>
              <div className={`text-xl font-extrabold ${s.color} leading-none`}>{s.value}</div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{s.label}</div>
              <div className="text-[11px] text-stone-400">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-scroll flex gap-1 bg-white border border-stone-200 rounded-2xl p-1.5 mb-5 shadow-sm overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.id;
            const count = tabCounts[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex-1 justify-center uppercase tracking-wide ${
                  active ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                }`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
                {count !== undefined && count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-orange-100 text-orange-600"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-4">
            {/* Goal Info */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Goal Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Title</div>
                  <div className="text-sm font-semibold text-stone-700">{goal.title}</div>
                </div>
                {goal.description && (
                  <div>
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Description</div>
                    <div className="text-sm text-stone-600 font-medium leading-relaxed">{goal.description}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Week Start</div>
                    <div className="text-sm font-semibold text-stone-700">{formatDate(goal.weekStart)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Week End</div>
                    <div className="text-sm font-semibold text-stone-700">{formatDate(goal.weekEnd)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            {goal.owner && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Owner</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {initials(goal.owner.adminName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{goal.owner.adminName}</p>
                    <p className="text-xs text-stone-400">{goal.owner.adminEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tasks Preview */}
            {tasks.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                  <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Recent Tasks</h3>
                  <button type="button" onClick={() => setTab("tasks")} className="text-xs font-bold text-orange-500 hover:text-orange-700 transition-colors">
                    View all →
                  </button>
                </div>
                {tasks.slice(0, 3).map((task, idx) => (
                  <div key={task.id || idx} className={`flex items-center gap-3 px-6 py-3.5 border-b border-stone-50 last:border-0 ${task.done ? "opacity-60" : ""}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? "bg-green-500 border-green-500" : "border-stone-300"}`}>
                      {task.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${task.done ? "line-through text-stone-400" : "text-stone-800"}`}>{task.title}</p>
                      {task.description && <p className="text-xs text-stone-400 mt-0.5 truncate">{task.description}</p>}
                    </div>
                    <Badge className={task.done ? "bg-green-50 text-green-600 border border-green-200" : "bg-stone-50 text-stone-400 border border-stone-200"}>
                      {task.done ? "Done" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === "tasks" && (
          <div className="space-y-4">
            {/* Progress bar card */}
            {tasks.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Completion</span>
                  <span className="text-sm font-extrabold text-orange-500">{progress}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`progress-bar h-full rounded-full bg-gradient-to-r ${getProgressColor()}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-stone-400 font-medium">{completedTasks} done · {tasks.length - completedTasks} remaining</span>
                </div>
              </div>
            )}

            <SectionCard
              title="Tasks"
              count={tasks.length}
              icon="✅"
              emptyIcon="📋"
              emptyText="No tasks added to this goal"
            >
              {tasks.map((task, idx) => (
                <div key={task.id || idx} className={`flex items-start gap-4 px-6 py-4 hover:bg-stone-50/50 transition-colors ${task.done ? "opacity-70" : ""}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${task.done ? "bg-green-500 border-green-500" : "border-stone-300"}`}>
                    {task.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${task.done ? "line-through text-stone-400" : "text-stone-800"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                  <Badge className={task.done ? "bg-green-50 text-green-600 border border-green-200 shrink-0" : "bg-stone-50 text-stone-400 border border-stone-200 shrink-0"}>
                    {task.done ? "Done" : "Pending"}
                  </Badge>
                </div>
              ))}
            </SectionCard>
          </div>
        )}

        {/* REVIEW NOTES TAB */}
        {tab === "review" && (
          <SectionCard
            title="Review Notes"
            count={reviewNotes.length}
            icon="💬"
            emptyIcon="📝"
            emptyText="No review notes added yet"
          >
            {reviewNotes.map((note, idx) => (
              <div key={note.id || idx} className="px-6 py-5 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {initials(note.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{note.name}</p>
                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Team Member</p>
                  </div>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <p className="text-sm text-stone-600 font-medium leading-relaxed whitespace-pre-line">
                    {note.notes || <span className="text-stone-400 italic">No notes written</span>}
                  </p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Footer meta */}
        <div className="mt-6 flex items-center justify-between text-xs text-stone-400 font-medium px-1">
          <span>ID: {goal.id}</span>
          <span>Created {formatDate(goal.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
