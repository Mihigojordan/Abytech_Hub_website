import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2, CheckCircle2,
  Calendar, Clock, Users, Zap, ListTodo, MessageSquare,
  X, AlertCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../utils/homeConstants';

const uid = () => Math.random().toString(36).slice(2, 9);

const formatDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().slice(0, 10);
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'PENDING', color: '#f59e0b', icon: Clock },
  { value: 'IN_PROGRESS', label: 'IN PROGRESS', color: TEAL, icon: Zap },
  { value: 'COMPLETED', label: 'COMPLETED', color: '#10b981', icon: CheckCircle2 },
  { value: 'MISSED', label: 'MISSED', color: '#ef4444', icon: AlertCircle },
];

const TABS = [
  { id: 'details', label: 'CORE DETAILS', icon: FileText },
  { id: 'tasks', label: 'TASK PROTOCOL', icon: ListTodo },
  { id: 'review', label: 'TEAM REFLECTIONS', icon: MessageSquare },
];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const INITIAL_FORM = {
  title: '',
  description: '',
  weekStart: '',
  weekEnd: '',
  status: 'PENDING',
  progress: 0,
  tasks: [],
  reviewNotes: [],
};

export default function WeeklyGoalForm({
  goal = null,
  currentAdmin = null,
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
  const isEdit = !!goal;
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(() => {
    if (goal) {
      let parsedTasks = [];
      try { parsedTasks = typeof goal.tasks === 'string' ? JSON.parse(goal.tasks) : (goal.tasks || []); } catch { parsedTasks = []; }
      
      let parsedReviewNotes = [];
      try { parsedReviewNotes = typeof goal.reviewNotes === 'string' ? JSON.parse(goal.reviewNotes) : (goal.reviewNotes || []); } catch { parsedReviewNotes = []; }

      return {
        title: goal.title || '',
        description: goal.description || '',
        weekStart: formatDateTimeLocal(goal.weekStart),
        weekEnd: formatDateTimeLocal(goal.weekEnd),
        status: goal.status || 'PENDING',
        progress: goal.progress || 0,
        tasks: parsedTasks.map(t => ({ ...t, id: t.id || uid() })),
        reviewNotes: parsedReviewNotes.map(r => ({ ...r, id: r.id || uid() })),
      };
    }
    return INITIAL_FORM;
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const addTask = () => {
    setForm(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: uid(), title: '', description: '', done: false }]
    }));
  };

  const updateTask = (id, patch) => {
    setForm(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...patch } : t)
    }));
  };

  const removeTask = (id) => {
    setForm(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const addReviewNote = () => {
    if (!currentAdmin) return;
    setForm(prev => ({
      ...prev,
      reviewNotes: [...prev.reviewNotes, {
        id: uid(),
        adminId: currentAdmin.id,
        name: currentAdmin.adminName || currentAdmin.name || '',
        notes: ''
      }]
    }));
  };

  const updateReviewNote = (id, notes) => {
    setForm(prev => ({
      ...prev,
      reviewNotes: prev.reviewNotes.map(r => r.id === id ? { ...r, notes } : r)
    }));
  };

  const removeReviewNote = (id) => {
    setForm(prev => ({
      ...prev,
      reviewNotes: prev.reviewNotes.filter(r => r.id !== id)
    }));
  };

  const calculateProgress = () => {
    const tasks = form.tasks || [];
    if (tasks.length === 0) return form.progress || 0;
    const done = tasks.filter(t => t.done).length;
    return Math.round((done / tasks.length) * 100);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.weekStart) errs.weekStart = 'Start date is required';
    if (!form.weekEnd) errs.weekEnd = 'End date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('details');
      return;
    }
    onSubmit({
      ...form,
      progress: calculateProgress()
    });
  };

  const SectionLabel = ({ icon: Icon, label, required = false }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, ...bc(11, 800, { color: text3, letterSpacing: '0.05em' }) }}>
      <Icon size={14} style={{ color: ORG }} />
      {label.toUpperCase()} {required && <span style={{ color: ORG }}>*</span>}
    </label>
  );

  return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 100 }}>
      <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto px-6 py-12">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: text3, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...bc(12, 700) }}
          >
            <ArrowLeft size={16} /> DISCARD & EXIT
          </button>
          <div style={{ ...bc(12, 800, { color: text3, letterSpacing: '0.1em' }) }}>
            GOALS / <span style={{ color: ORG }}>{isEdit ? 'EDIT' : 'CREATE'} SESSION</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: 0, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.02)' }}
        >
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${border}` }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  flex: 1, padding: '20px', background: activeTab === tab.id ? bg : 'transparent', 
                  border: 'none', color: activeTab === tab.id ? ORG : text3, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...bc(11, 800),
                  transition: 'all 0.2s', borderBottom: activeTab === tab.id ? `2px solid ${ORG}` : 'none'
                }}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 48 }}>
            <AnimatePresence mode="wait">
              {/* Core Details */}
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
                >
                  <div>
                    <SectionLabel icon={FileText} label="Goal Title" required />
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g. Q2 Performance Optimization"
                      style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${errors.title ? '#ef4444' : border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none' }}
                    />
                  </div>

                  <div>
                    <SectionLabel icon={Zap} label="Strategic Intent" />
                    <textarea
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="High-level description of what this goal accomplishes..."
                      rows={4}
                      style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none', resize: 'none' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <SectionLabel icon={Calendar} label="Week Start" required />
                      <input
                        type="date"
                        value={form.weekStart}
                        onChange={(e) => handleChange('weekStart', e.target.value)}
                        style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${errors.weekStart ? '#ef4444' : border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none' }}
                      />
                    </div>
                    <div>
                      <SectionLabel icon={CheckCircle2} label="Week End" required />
                      <input
                        type="date"
                        value={form.weekEnd}
                        onChange={(e) => handleChange('weekEnd', e.target.value)}
                        style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${errors.weekEnd ? '#ef4444' : border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <SectionLabel icon={Clock} label="Current Status" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('status', opt.value)}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12, border: `1px solid ${form.status === opt.value ? opt.color : border}`,
                            background: form.status === opt.value ? `${opt.color}10` : bg, color: form.status === opt.value ? opt.color : text3,
                            cursor: 'pointer', ...bc(11, 800), transition: 'all 0.2s'
                          }}
                        >
                          <opt.icon size={14} /> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Task Protocol */}
              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 4, height: 16, background: ORG, borderRadius: 2 }}></div>
                      <h4 style={{ ...bc(14, 800, { color: textC, margin: 0 }) }}>ACTIVE TASK UNITS</h4>
                    </div>
                    <button
                      type="button"
                      onClick={addTask}
                      style={{ background: 'none', border: 'none', color: ORG, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', ...bc(11, 800) }}
                    >
                      <Plus size={14} /> INITIALIZE TASK
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {form.tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 24, position: 'relative' }}
                      >
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          style={{ position: 'absolute', top: 24, right: 24, color: text3, cursor: 'pointer', background: 'none', border: 'none' }}
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button
                              type="button"
                              onClick={() => updateTask(task.id, { done: !task.done })}
                              style={{ 
                                width: 24, height: 24, borderRadius: 8, border: `2px solid ${task.done ? '#10b981' : border}`,
                                background: task.done ? '#10b981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              {task.done && <CheckCircle2 size={14} color="#fff" />}
                            </button>
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => updateTask(task.id, { title: e.target.value })}
                              placeholder="Task Title..."
                              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: `1px solid ${border}`, color: textC, ...ba(14, 700), padding: '8px 0', outline: 'none', textDecoration: task.done ? 'line-through' : 'none' }}
                            />
                          </div>
                          <textarea
                            value={task.description}
                            onChange={(e) => updateTask(task.id, { description: e.target.value })}
                            placeholder="Supporting details or methodology..."
                            rows={2}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: text2, ...ba(14, 500), outline: 'none', resize: 'none' }}
                          />
                        </div>
                      </motion.div>
                    ))}
                    {form.tasks.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: text3, ...ba(14, 500), border: `1px dashed ${border}`, borderRadius: 32 }}>No tasks defined.</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Team Reflections */}
              {activeTab === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 4, height: 16, background: '#8b5cf6', borderRadius: 2 }}></div>
                      <h4 style={{ ...bc(14, 800, { color: textC, margin: 0 }) }}>RETROSPECTIVE LOGS</h4>
                    </div>
                    {currentAdmin && (
                      <button
                        type="button"
                        onClick={addReviewNote}
                        style={{ background: 'none', border: 'none', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', ...bc(11, 800) }}
                      >
                        <Plus size={14} /> LOG REFLECTION
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {form.reviewNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        style={{ display: 'flex', gap: 20 }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ORG}15`, color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', ...bc(14, 800), flexShrink: 0 }}>
                          {initials(note.name)}
                        </div>
                        <div style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 24, position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => removeReviewNote(note.id)}
                            style={{ position: 'absolute', top: 24, right: 24, color: text3, cursor: 'pointer', background: 'none', border: 'none' }}
                          >
                            <X size={16} />
                          </button>
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ ...bc(12, 800, { color: textC, margin: 0 }) }}>{note.name?.toUpperCase()}</p>
                            <p style={{ ...bc(10, 800, { color: text3, margin: 0 }) }}>TEAM MEMBER</p>
                          </div>
                          <textarea
                            value={note.notes}
                            onChange={(e) => updateReviewNote(note.id, e.target.value)}
                            placeholder="Share your reflections on this week's progress..."
                            rows={3}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: text2, ...ba(14, 500), outline: 'none', resize: 'none' }}
                          />
                        </div>
                      </motion.div>
                    ))}
                    {form.reviewNotes.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: text3, ...ba(14, 500), border: `1px dashed ${border}`, borderRadius: 32 }}>No team reflections logged yet.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div style={{ 
          marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '20px 32px'
        }}>
          <div>
            {Object.keys(errors).length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', ...bc(11, 800) }}>
                <AlertCircle size={14} /> CORE PROTOCOLS INCOMPLETE
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ background: 'none', border: 'none', color: text3, ...bc(13, 700), cursor: 'pointer' }}
            >
              DISCARD
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ 
                padding: '12px 32px', borderRadius: 12, background: ORG, color: '#fff', border: 'none', 
                cursor: 'pointer', ...bc(13, 700), display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: `0 8px 24px ${ORG}40`, opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <><div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" /> SAVING...</>
              ) : (
                <><Save size={18} /> {isEdit ? 'SAVE MODIFICATIONS' : 'INITIALIZE GOAL'}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
