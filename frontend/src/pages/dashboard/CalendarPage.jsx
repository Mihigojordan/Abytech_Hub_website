import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Edit, Trash2, Bell, Clock, X, AlertCircle, RefreshCw, CalendarDays, Music,
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- used as <motion.div>
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import calendarService from '../../services/calendarService';
import NotificationSoundModal from '../../components/dashboard/notification/NotificationSoundModal';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const REMINDER_OPTIONS = [
  { value: 0, label: 'At time of event' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
];

const COLORS = [ORG, TEAL, '#6366f1', '#22c55e', '#e84040'];

// YYYY-MM-DD / HH:mm in local time
const pad = (n) => String(n).padStart(2, '0');
const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const reminderLabel = (minutes) =>
  REMINDER_OPTIONS.find((o) => o.value === minutes)?.label || `${minutes} minutes before`;

const emptyForm = (dateKey) => {
  // Default new events to the next full hour
  const next = new Date();
  next.setHours(next.getHours() + 1, 0, 0, 0);
  return {
    title: '',
    description: '',
    date: dateKey,
    startTime: toTimeInput(next),
    endTime: '',
    reminderMinutes: 10,
    color: ORG,
  };
};

const CalendarPage = () => {
  const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
  const today = toDateKey(new Date());

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(() => emptyForm(today));
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);

  // 6-week grid that covers the whole visible month
  const gridDays = useMemo(() => {
    const start = new Date(currentMonth);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentMonth]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const from = new Date(gridDays[0]);
      const to = new Date(gridDays[gridDays.length - 1]);
      to.setHours(23, 59, 59, 999);
      const data = await calendarService.getEvents(from.toISOString(), to.toISOString());
      setEvents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [gridDays]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const event of events) {
      const key = toDateKey(new Date(event.startTime));
      (map[key] = map[key] || []).push(event);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDay[selectedDate] || [];

  const changeMonth = (offset) => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));
  };

  const goToToday = () => {
    const d = new Date();
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDate(today);
  };

  const openAddModal = (dateKey = selectedDate) => {
    setEditingEvent(null);
    setFormData(emptyForm(dateKey));
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (event) => {
    const start = new Date(event.startTime);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: toDateKey(start),
      startTime: toTimeInput(start),
      endTime: event.endTime ? toTimeInput(new Date(event.endTime)) : '',
      reminderMinutes: event.reminderMinutes,
      color: event.color || ORG,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'reminderMinutes' ? parseInt(value, 10) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.title.trim()) return setFormError('Title is required');
    if (!formData.date || !formData.startTime) return setFormError('Date and start time are required');

    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = formData.endTime ? new Date(`${formData.date}T${formData.endTime}`) : null;
    if (end && end < start) return setFormError('End time cannot be before start time');

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
      startTime: start.toISOString(),
      endTime: end ? end.toISOString() : null,
      reminderMinutes: formData.reminderMinutes,
      color: formData.color,
    };

    try {
      setSaving(true);
      if (editingEvent) {
        await calendarService.updateEvent(editingEvent.id, payload);
      } else {
        await calendarService.createEvent(payload);
      }
      closeModal();
      setSelectedDate(formData.date);
      await loadEvents();
    } catch (err) {
      setFormError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete event?',
      text: `"${event.title}" will be removed from your calendar.`,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#e84040',
    });
    if (!result.isConfirmed) return;
    try {
      await calendarService.deleteEvent(event.id);
      await loadEvents();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: ORG });
    }
  };

  const inputStyle = {
    width: '100%', background: bg3, border: `1px solid ${border}`, borderRadius: 4,
    padding: '8px 12px', color: textC, outline: 'none', ...ba(12),
  };
  const labelStyle = { ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) };

  const selectedDateLabel = new Date(`${selectedDate}T00:00`).toLocaleDateString([], {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div style={{ width: 3, height: 24, background: ORG, borderRadius: 2, marginRight: 4 }} />
                <CalendarDays className="w-5 h-5" style={{ color: ORG }} />
                <h1 style={bb(28, { color: ORG, lineHeight: 1 })}>My Calendar</h1>
              </div>
              <p className="text-xs" style={{ color: text2 }}>Plan your day and get a reminder when it's time</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={loadEvents} disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs disabled:opacity-50"
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: ORG }} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowSoundModal(true)}
                className="flex items-center space-x-2 px-3 py-2 text-xs"
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
                <Music className="w-3.5 h-3.5" style={{ color: ORG }} />
                <span className="hidden sm:inline">Ringtone</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => openAddModal()}
                className="flex items-center space-x-2 px-3 py-2 text-xs font-medium"
                style={{ background: ORG, color: '#fff', borderRadius: 4 }}>
                <Plus className="w-3.5 h-3.5" /><span>New Event</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4" style={{
            background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4,
            padding: 12, color: '#e84040', display: 'flex', alignItems: 'center', gap: 8, ...ba(12),
          }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Month grid */}
          <div className="lg:col-span-2" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={bc(16, 700, { color: textC })}>
                {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-1">
                <button onClick={() => changeMonth(-1)} aria-label="Previous month"
                  style={{ padding: 6, background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer' }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: textC }} />
                </button>
                <button onClick={goToToday}
                  style={{ padding: '5px 10px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer', color: textC, ...ba(12) }}>
                  Today
                </button>
                <button onClick={() => changeMonth(1)} aria-label="Next month"
                  style={{ padding: 6, background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer' }}>
                  <ChevronRight className="w-4 h-4" style={{ color: textC }} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} style={{ textAlign: 'center', padding: '4px 0', ...bc(10, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase' }) }}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {gridDays.map((day) => {
                const key = toDateKey(day);
                const dayEvents = eventsByDay[key] || [];
                const inMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = key === selectedDate;
                const isToday = key === today;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    onDoubleClick={() => openAddModal(key)}
                    style={{
                      minHeight: 76, padding: 4, textAlign: 'left', verticalAlign: 'top', cursor: 'pointer',
                      background: isSelected ? 'rgba(232,98,26,.12)' : bg3,
                      border: `1px solid ${isSelected ? ORG : border}`, borderRadius: 4,
                      opacity: inMonth ? 1 : 0.4, overflow: 'hidden',
                      display: 'flex', flexDirection: 'column', gap: 2,
                    }}
                  >
                    <span style={{
                      ...ba(11, isToday ? 700 : 500, { color: isToday ? '#fff' : textC }),
                      background: isToday ? ORG : 'transparent', borderRadius: 999,
                      width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {day.getDate()}
                    </span>
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span key={ev.id} className="hidden sm:block" style={{
                        ...ba(10, 500, { color: '#fff' }), background: ev.color || ORG, borderRadius: 3,
                        padding: '1px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {formatTime(ev.startTime)} {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 0 && (
                      <span className="sm:hidden" style={{ width: 6, height: 6, borderRadius: 999, background: ORG }} />
                    )}
                    {dayEvents.length > 2 && (
                      <span className="hidden sm:block" style={ba(10, 500, { color: text2 })}>+{dayEvents.length - 2} more</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p style={ba(11, 400, { color: text3, marginTop: 8 })}>Tip: double-click a day to add an event on it.</p>
          </div>

          {/* Day agenda */}
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={bc(14, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10 })}>{selectedDateLabel}</h3>
              <button onClick={() => openAddModal()} aria-label="Add event on this day"
                style={{ padding: 6, background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                <Plus className="w-3.5 h-3.5" style={{ color: '#fff' }} />
              </button>
            </div>

            {selectedEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', ...ba(12, 400, { color: text2 }) }}>
                Nothing scheduled for this day.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((ev) => {
                  const isPast = new Date(ev.endTime || ev.startTime) < new Date();
                  return (
                    <div key={ev.id} style={{
                      background: bg3, border: `1px solid ${border}`, borderLeft: `3px solid ${ev.color || ORG}`,
                      borderRadius: 4, padding: 10, opacity: isPast ? 0.6 : 1,
                    }}>
                      <div className="flex items-start justify-between gap-2">
                        <div style={{ minWidth: 0 }}>
                          <div style={ba(13, 600, { color: textC, wordBreak: 'break-word' })}>{ev.title}</div>
                          <div className="flex items-center gap-1" style={ba(11, 400, { color: text2, marginTop: 2 })}>
                            <Clock className="w-3 h-3" />
                            {formatTime(ev.startTime)}{ev.endTime ? ` – ${formatTime(ev.endTime)}` : ''}
                          </div>
                          <div className="flex items-center gap-1" style={ba(11, 400, { color: text2, marginTop: 2 })}>
                            <Bell className="w-3 h-3" />
                            {reminderLabel(ev.reminderMinutes)}{ev.notified ? ' · sent' : ''}
                          </div>
                          {ev.description && (
                            <p style={ba(12, 400, { color: textC, marginTop: 6, whiteSpace: 'pre-wrap' })}>{ev.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => openEditModal(ev)} aria-label="Edit event"
                            style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Edit className="w-3.5 h-3.5" style={{ color: TEAL }} />
                          </button>
                          <button onClick={() => handleDelete(ev)} aria-label="Delete event"
                            style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#e84040' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,.7)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 448, maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={bc(15, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10 })}>
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h3>
                <button onClick={closeModal} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X className="w-4 h-4" style={{ color: text2 }} />
                </button>
              </div>

              {formError && (
                <div style={{
                  background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, padding: 12,
                  color: '#e84040', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, ...ba(12),
                }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    placeholder="e.g. Call with client" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Start time *</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Notify me</label>
                  <select name="reminderMinutes" value={formData.reminderMinutes} onChange={handleChange} style={inputStyle}>
                    {REMINDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Color</label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })} aria-label={`Color ${c}`}
                        style={{
                          width: 24, height: 24, borderRadius: 999, background: c, cursor: 'pointer',
                          border: formData.color === c ? `2px solid ${textC}` : '2px solid transparent',
                        }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                    placeholder="Optional details" style={{ ...inputStyle, resize: 'none', height: 80 }} />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={closeModal}
                    style={{ padding: '8px 16px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, cursor: 'pointer', ...ba(12) }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{
                      padding: '8px 16px', background: ORG, border: 'none', borderRadius: 4, color: '#fff',
                      cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, ...bc(12, 600),
                    }}>
                    {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification sound settings (shared with the header menu) */}
      <NotificationSoundModal isOpen={showSoundModal} onClose={() => setShowSoundModal(false)} />
    </div>
  );
};

export default CalendarPage;
