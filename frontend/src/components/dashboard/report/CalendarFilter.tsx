import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../utils/homeConstants';

interface CalendarFilterProps {
  onDateRangeSelect: (startDate: Date | null, endDate: Date | null) => void;
  onClose?: () => void;
}

export default function CalendarFilter({ onDateRangeSelect, onClose }: CalendarFilterProps) {
  const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (!isSelectingRange) {
      setStartDate(clickedDate);
      setEndDate(null);
      setIsSelectingRange(true);
    } else {
      if (startDate && clickedDate < startDate) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
      setIsSelectingRange(false);
    }
  };

  const handleApply = () => {
    onDateRangeSelect(startDate, endDate);
    if (onClose) onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setIsSelectingRange(false);
    onDateRangeSelect(null, null);
  };

  const formatDateShort = (date: Date | null) => {
    if (!date) return '—';
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: 8 }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = isSameDay(date, today);
      const isStart = startDate && isSameDay(date, startDate);
      const isEnd = endDate && isSameDay(date, endDate);
      const inRange = isInRange(date);

      let dayStyle: React.CSSProperties = {
        position: 'relative',
        padding: 8,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: 12,
        transition: 'all 0.2s',
        ...ba(14, 600),
        color: textC
      };
      
      if (isStart || isEnd) {
        dayStyle = { ...dayStyle, background: ORG, color: '#fff', fontWeight: 800, boxShadow: `0 4px 12px ${ORG}40` };
      } else if (inRange) {
        dayStyle = { ...dayStyle, background: `${ORG}15`, color: ORG };
      } else if (isToday) {
        dayStyle = { ...dayStyle, background: `${TEAL}10`, color: TEAL, border: `1px solid ${TEAL}30` };
      }

      days.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(day)} 
          style={dayStyle}
          className="hover-scale"
        >
          {day}
          {isToday && !isStart && !isEnd && (
            <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, background: TEAL, borderRadius: '50%' }}></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 400, 
      background: bg2, 
      borderRadius: 32, 
      border: `1px solid ${border}`, 
      padding: 32,
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: ORG, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} className="text-white" />
          </div>
          <div>
            <h2 style={{ ...bc(20, 800, { color: textC, margin: 0 }) }}>{monthNames[currentDate.getMonth()].toUpperCase()}</h2>
            <p style={{ ...ba(12, 600, { color: text3, margin: 0 }) }}>{currentDate.getFullYear()}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={prevMonth} style={{ padding: 6, borderRadius: 8, background: bg, border: `1px solid ${border}`, color: text3, cursor: 'pointer' }}><ChevronLeft size={18} /></button>
          <button onClick={goToToday} style={{ padding: '6px 12px', borderRadius: 8, background: bg, border: `1px solid ${border}`, color: text3, cursor: 'pointer', ...bc(10, 800) }}>TODAY</button>
          <button onClick={nextMonth} style={{ padding: 6, borderRadius: 8, background: bg, border: `1px solid ${border}`, color: text3, cursor: 'pointer' }}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Selected Range Display */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', padding: '16px 20px', 
        background: bg, borderRadius: 16, border: `1px solid ${border}`, marginBottom: 24 
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ ...bc(10, 800, { color: text3, margin: '0 0 2px' }) }}>FROM</p>
          <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{formatDateShort(startDate)}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ ...bc(10, 800, { color: text3, margin: '0 0 2px' }) }}>TO</p>
          <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{formatDateShort(endDate)}</p>
        </div>
      </div>

      {/* Week Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {daysOfWeek.map((day, i) => (
          <div key={i} style={{ textAlign: 'center', ...bc(11, 800, { color: text3, padding: 8 }) }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 32 }}>
        {renderCalendar()}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleClear}
          style={{ flex: 1, padding: '12px', borderRadius: 12, background: bg, border: `1px solid ${border}`, color: text2, cursor: 'pointer', ...bc(12, 800) }}
        >
          CLEAR
        </button>
        <button
          onClick={handleApply}
          disabled={!startDate}
          style={{ 
            flex: 1, padding: '12px', borderRadius: 12, background: ORG, border: 'none', color: '#fff', 
            cursor: 'pointer', ...bc(12, 800), opacity: !startDate ? 0.5 : 1, boxShadow: `0 8px 20px ${ORG}40`
          }}
        >
          APPLY FILTER
        </button>
      </div>

      <style>{`
        .hover-scale:hover { transform: scale(1.1); background: ${border}; }
      `}</style>
    </div>
  );
};