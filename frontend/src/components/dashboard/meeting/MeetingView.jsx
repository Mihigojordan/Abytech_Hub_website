import { useState } from "react";

// Constants
const STATUS_META = {
  SCHEDULED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", label: "Scheduled" },
  ONGOING:   { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "Ongoing" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", label: "Completed" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Cancelled" },
};

const FILE_META = {
  pdf:  { icon: "📄", color: "bg-red-50 text-red-500 border-red-100" },
  doc:  { icon: "📝", color: "bg-blue-50 text-blue-500 border-blue-100" },
  docx: { icon: "📝", color: "bg-blue-50 text-blue-500 border-blue-100" },
  xls:  { icon: "📊", color: "bg-green-50 text-green-600 border-green-100" },
  xlsx: { icon: "📊", color: "bg-green-50 text-green-600 border-green-100" },
  ppt:  { icon: "📑", color: "bg-orange-50 text-orange-500 border-orange-100" },
  pptx: { icon: "📑", color: "bg-orange-50 text-orange-500 border-orange-100" },
  png:  { icon: "🖼️", color: "bg-purple-50 text-purple-500 border-purple-100" },
  jpg:  { icon: "🖼️", color: "bg-purple-50 text-purple-500 border-purple-100" },
  jpeg: { icon: "🖼️", color: "bg-purple-50 text-purple-500 border-purple-100" },
  default: { icon: "📎", color: "bg-stone-50 text-stone-500 border-stone-100" },
};

// Helpers
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(dt) {
  if (!dt) return "—";
  return `${formatDate(dt)} · ${formatTime(dt)}`;
}

function duration(start, end) {
  if (!start || !end) return null;
  const diff = (new Date(end) - new Date(start)) / 60000;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
}

function getFileExtension(fileName) {
  if (!fileName) return 'default';
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'default';
}

// Sub-components
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

// Tabs config
const TABS = [
  { id: "overview",      label: "Overview",     icon: "◎" },
  { id: "participants",  label: "Participants",  icon: "👥" },
  { id: "keypoints",     label: "Key Points",   icon: "📌" },
  { id: "actions",       label: "Action Items", icon: "⚡" },
  { id: "attachments",   label: "Attachments",  icon: "📎" },
];

// Main Component
export default function MeetingView({ meeting, onEdit, onBack }) {
  const [tab, setTab] = useState("overview");

  if (!meeting) return null;

  const m = meeting;
  const status = STATUS_META[m.status] || STATUS_META.SCHEDULED;
  const dur = duration(m.startTime, m.endTime);

  // Handle different data structures from API
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 px-4 py-10 pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .mv-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .tab-scroll::-webkit-scrollbar { display: none; }
        .progress-bar { transition: width 0.6s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div className="mv-wrap w-full  mx-auto">

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
            All Meetings
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Meeting
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
                {m.location && (
                  <Badge className="bg-stone-50 text-stone-500 border border-stone-200">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    In-person
                  </Badge>
                )}
                {m.meetingLink && (
                  <Badge className="bg-blue-50 text-blue-600 border border-blue-100">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                    Online
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight leading-tight mb-2">
                {m.title}
              </h1>
              {m.description && (
                <p className="text-sm text-stone-500 font-medium leading-relaxed max-w-xl">{m.description}</p>
              )}
            </div>

            {/* Duration pill */}
            {dur && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 text-center shrink-0">
                <div className="text-2xl font-extrabold text-orange-500 leading-none">{dur}</div>
                <div className="text-[11px] font-bold text-orange-300 uppercase tracking-widest mt-1">Duration</div>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Date</div>
              <div className="text-sm font-semibold text-stone-700">{formatDate(m.startTime)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Time</div>
              <div className="text-sm font-semibold text-stone-700">
                {formatTime(m.startTime)}{m.endTime ? ` → ${formatTime(m.endTime)}` : ""}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Created By</div>
              <div className="text-sm font-semibold text-stone-700">{m.createdBy?.adminName || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Last Updated</div>
              <div className="text-sm font-semibold text-stone-700">{formatDate(m.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Participants", value: participants.length, sub: `${attendedCount} attended`, icon: "👥", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Key Points", value: keyPoints.length, sub: "recorded", icon: "📌", color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Action Items", value: actionItems.length, sub: `${completedAI} done`, icon: "⚡", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Attachments", value: attachments.length, sub: "files", icon: "📎", color: "text-green-600", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-stone-200 rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-1">
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center text-sm mb-1`}>{s.icon}</div>
              <div className={`text-2xl font-extrabold ${s.color} leading-none`}>{s.value}</div>
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

            {/* Location / Link */}
            {(m.location || m.meetingLink) && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Where</h3>
                <div className="space-y-3">
                  {m.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Location</div>
                        <div className="text-sm font-semibold text-stone-700 mt-0.5">{m.location}</div>
                      </div>
                    </div>
                  )}
                  {m.meetingLink && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Meeting Link</div>
                        <a
                          href={m.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 truncate block mt-0.5 transition-colors"
                        >
                          {m.meetingLink}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Items Progress */}
            {actionItems.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Action Progress</h3>
                  <span className="text-sm font-extrabold text-orange-500">{completionPct}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="progress-bar h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-stone-400 font-medium">{completedAI} of {actionItems.length} completed</span>
                  <span className="text-xs text-stone-400 font-medium">{actionItems.length - completedAI} remaining</span>
                </div>
              </div>
            )}

            {/* Participants snapshot */}
            {participants.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                    Participants · {attendedCount}/{participants.length} attended
                  </h3>
                  <button type="button" onClick={() => setTab("participants")} className="text-xs font-bold text-orange-500 hover:text-orange-700 transition-colors">
                    View all →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {participants.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        p.attended ? "bg-green-50 border-green-200 text-green-700" : "bg-stone-50 border-stone-200 text-stone-500"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${p.attended ? "bg-green-500" : "bg-stone-300"}`}>
                        {initials(p.adminName || p.name)}
                      </div>
                      {p.adminName || p.name}
                      {p.isCustom && <span className="text-[10px] bg-amber-100 text-amber-600 px-1 rounded font-bold">EXT</span>}
                      {p.attended ? (
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-3 h-3 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent action items */}
            {actionItems.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                  <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Recent Actions</h3>
                  <button type="button" onClick={() => setTab("actions")} className="text-xs font-bold text-orange-500 hover:text-orange-700 transition-colors">
                    View all →
                  </button>
                </div>
                {actionItems.slice(0, 3).map((a, idx) => (
                  <div key={a.id || idx} className={`flex items-center gap-3 px-6 py-3.5 border-b border-stone-50 last:border-0 ${a.completed ? "opacity-60" : ""}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${a.completed ? "bg-green-500 border-green-500" : "border-stone-300"}`}>
                      {a.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${a.completed ? "line-through text-stone-400" : "text-stone-800"}`}>{a.title || a.task}</p>
                      {a.assignedTo && <p className="text-xs text-stone-400 mt-0.5">{typeof a.assignedTo === 'string' ? a.assignedTo : a.assignedTo.name}</p>}
                    </div>
                    {a.dueDate && (
                      <span className="text-[11px] font-bold text-stone-400 shrink-0">
                        {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PARTICIPANTS TAB */}
        {tab === "participants" && (
          <SectionCard
            title="Participants"
            count={participants.length}
            icon="👥"
            emptyIcon="👤"
            emptyText="No participants recorded"
          >
            {participants.map((p, i) => (
              <div key={p.id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${p.isCustom ? "bg-gradient-to-br from-amber-400 to-orange-400" : "bg-gradient-to-br from-orange-400 to-amber-500"}`}>
                  {initials(p.adminName || p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-stone-800">{p.adminName || p.name}</span>
                    {p.isCustom && <Badge className="bg-amber-50 text-amber-600 border border-amber-100">External</Badge>}
                    {p.adminId && <Badge className="bg-blue-50 text-blue-500 border border-blue-100">Admin</Badge>}
                    {p.role && <Badge className="bg-stone-50 text-stone-500 border border-stone-200">{p.role}</Badge>}
                  </div>
                  {(p.adminEmail || p.email) && <p className="text-xs text-stone-400 mt-0.5 font-medium">{p.adminEmail || p.email}</p>}
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${p.attended ? "bg-green-50 text-green-600 border border-green-200" : "bg-stone-50 text-stone-400 border border-stone-200"}`}>
                  {p.attended ? (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      Attended
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                      Absent
                    </>
                  )}
                </div>
              </div>
            ))}
            {/* Attendance summary footer */}
            <div className="px-6 py-3 bg-stone-50 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Attendance Rate</span>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full progress-bar"
                    style={{ width: `${participants.length ? (attendedCount / participants.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-stone-600">{attendedCount}/{participants.length}</span>
              </div>
            </div>
          </SectionCard>
        )}

        {/* KEY POINTS TAB */}
        {tab === "keypoints" && (
          <SectionCard
            title="Key Points"
            count={keyPoints.length}
            icon="📌"
            emptyIcon="📋"
            emptyText="No key points recorded"
          >
            {keyPoints.map((k, i) => (
              <div key={k.id || i} className="px-6 py-5 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-stone-800">{k.content || k.title || "Untitled Point"}</h4>
                      {k.important && <Badge className="bg-red-50 text-red-500 border border-red-100">Important</Badge>}
                    </div>
                    {k.notes && (
                      <p className="text-sm text-stone-500 font-medium leading-relaxed whitespace-pre-line">{k.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* ACTION ITEMS TAB */}
        {tab === "actions" && (
          <div className="space-y-4">
            {/* Progress bar card */}
            {actionItems.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Completion</span>
                  <span className="text-sm font-extrabold text-orange-500">{completionPct}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="progress-bar h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-stone-400 font-medium">{completedAI} done · {actionItems.length - completedAI} remaining</span>
                </div>
              </div>
            )}

            <SectionCard
              title="Action Items"
              count={actionItems.length}
              icon="⚡"
              emptyIcon="✅"
              emptyText="No action items assigned"
            >
              {actionItems.map((a, idx) => (
                <div key={a.id || idx} className={`flex items-start gap-4 px-6 py-4 hover:bg-stone-50/50 transition-colors ${a.completed ? "opacity-70" : ""}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${a.completed ? "bg-green-500 border-green-500" : "border-stone-300"}`}>
                    {a.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${a.completed ? "line-through text-stone-400" : "text-stone-800"}`}>
                      {a.title || a.task}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {a.assignedTo && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-[9px] font-bold text-white">
                            {initials(typeof a.assignedTo === 'string' ? a.assignedTo : a.assignedTo.name)}
                          </div>
                          <span className="text-xs text-stone-500 font-medium">{typeof a.assignedTo === 'string' ? a.assignedTo : a.assignedTo.name}</span>
                          {(typeof a.assignedTo === 'object' && a.assignedTo.isCustom) && <Badge className="bg-amber-50 text-amber-500 border border-amber-100 text-[9px] py-0">EXT</Badge>}
                        </div>
                      )}
                      {a.dueDate && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span className="text-xs text-stone-400 font-medium">
                            Due {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={a.completed ? "bg-green-50 text-green-600 border border-green-200 shrink-0" : "bg-stone-50 text-stone-400 border border-stone-200 shrink-0"}>
                    {a.completed ? "Done" : "Pending"}
                  </Badge>
                </div>
              ))}
            </SectionCard>
          </div>
        )}

        {/* ATTACHMENTS TAB */}
        {tab === "attachments" && (
          <SectionCard
            title="Attachments"
            count={attachments.length}
            icon="📎"
            emptyIcon="📂"
            emptyText="No files attached to this meeting"
          >
            {attachments.map((att, idx) => {
              const fileType = att.fileType || getFileExtension(att.fileName);
              const meta = FILE_META[fileType] || FILE_META.default;
              return (
                <div key={att.id || idx} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-800 truncate">{att.fileName}</p>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mt-0.5">{fileType} file</p>
                  </div>
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3 py-1.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download
                  </a>
                </div>
              );
            })}
          </SectionCard>
        )}

        {/* Footer meta */}
        <div className="mt-6 flex items-center justify-between text-xs text-stone-400 font-medium px-1">
          <span>ID: {m.id}</span>
          <span>Created {formatDateTime(m.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
