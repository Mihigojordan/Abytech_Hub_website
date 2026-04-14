import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface CalendarFilterProps {
  onDateRangeSelect: (startDate: Date | null, endDate: Date | null) => void;
  onClose?: () => void;
}

export default function CalendarFilter({ onDateRangeSelect, onClose }: CalendarFilterProps) {
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
    if (!date) return 'Select';
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = isSameDay(date, today);
      const isStart = startDate && isSameDay(date, startDate);
      const isEnd = endDate && isSameDay(date, endDate);
      const inRange = isInRange(date);

      let className = 'relative p-2 text-center text-sm transition-all duration-200 cursor-pointer ';
      
      if (isStart || isEnd) {
        className += 'bg-gradient-to-br from-[rgb(81,96,146)] to-[rgb(81,96,146)] text-white font-bold rounded-lg shadow-md z-10 ';
      } else if (inRange) {
        className += 'bg-primary-100 text-primary-900 ';
      } else if (isToday) {
        className += 'bg-gray-200 font-semibold rounded-lg ';
      } else {
        className += 'hover:bg-gray-100 rounded-lg text-gray-700 ';
      }

      days.push(
        <div key={day} onClick={() => handleDateClick(day)} className={className}>
          {day}
          {isToday && !isStart && !isEnd && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[rgb(81,96,146)] rounded-full"></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-[rgb(81,96,146)] to-[rgb(81,96,146)] rounded-lg">
              <Calendar className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-[rgb(81,96,146)] bg-clip-text text-transparent">
                {monthNames[currentDate.getMonth()]}
              </h2>
              <p className="text-xs text-gray-500 font-medium">{currentDate.getFullYear()}</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-1 bg-gradient-to-br from-[rgb(81,96,146)] to-[rgb(81,96,146)] hover:from-primary-600 hover:to-[rgb(81,96,146)] text-white rounded-lg transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 bg-gradient-to-br from-[rgb(81,96,146)] to-[rgb(81,96,146)] hover:from-primary-600 hover:to-[rgb(81,96,146)] text-white rounded-lg transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Date Range Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex-1">
              <span className="text-gray-500 font-medium">From: </span>
              <span className="text-gray-900 font-semibold">{formatDateShort(startDate)}</span>
            </div>
            <div className="flex-1 text-right">
              <span className="text-gray-500 font-medium">To: </span>
              <span className="text-gray-900 font-semibold">{formatDateShort(endDate)}</span>
            </div>
          </div>
          {isSelectingRange && (
            <p className="text-xs text-primary-600 mt-2 text-center">Select end date...</p>
          )}
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="p-2 text-center text-xs font-bold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {renderCalendar()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="flex-1 px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate}
            className="flex-1 px-3 py-2 text-sm font-medium bg-gradient-to-br from-[rgb(81,96,146)] to-[rgb(81,96,146)] hover:from-primary-600 hover:to-[rgb(81,96,146)] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Filter
          </button>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-br from-[rgb(81,96,146)] to-[rgb(81,96,146)] rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary-100 rounded"></div>
              <span>Range</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}