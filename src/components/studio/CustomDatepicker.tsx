'use client';

// ============================================================
// CustomDatepicker — Custom calendar datepicker for Studio CMS
// Replaces native <input type="date"> with a React + Tailwind
// calendar popup supporting keyboard navigation and accessibility.
// Requirements: 9.1, 9.2
// ============================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ── Props ─────────────────────────────────────────────────────

export interface CustomDatepickerProps {
  id: string;
  label: string;
  value: string; // ISO date string (YYYY-MM-DD) or empty
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// ── Helpers ───────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(value: string): { year: number; month: number; day: number } | null {
  if (!value) return null;
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ── Component ─────────────────────────────────────────────────

export function CustomDatepicker({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select date',
}: CustomDatepickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedDate, setFocusedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Current calendar view month/year
  const today = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }, []);

  const parsed = useMemo(() => parseDate(value), [value]);

  const [viewYear, setViewYear] = useState(() => parsed?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(() => parsed?.month ?? today.month);

  // Sync view when value changes externally
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [parsed]);

  // ── Calendar grid data ──────────────────────────────────────

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days: (number | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Day numbers
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [viewYear, viewMonth]);

  // ── Open/close handlers ─────────────────────────────────────

  const openCalendar = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    // Set initial focus to selected date or today
    if (parsed) {
      setFocusedDate({ ...parsed });
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    } else {
      setFocusedDate({ ...today });
      setViewYear(today.year);
      setViewMonth(today.month);
    }
  }, [disabled, parsed, today]);

  const closeCalendar = useCallback(() => {
    setIsOpen(false);
    setFocusedDate(null);
  }, []);

  const selectDate = useCallback((day: number) => {
    const dateStr = formatDate(viewYear, viewMonth, day);
    onChange(dateStr);
    closeCalendar();
  }, [viewYear, viewMonth, onChange, closeCalendar]);

  // ── Month navigation ────────────────────────────────────────

  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  // ── Click outside ───────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeCalendar();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeCalendar]);

  // ── Keyboard navigation ─────────────────────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || !focusedDate) return;

    const { year, month, day } = focusedDate;
    let newDay = day;
    let newMonth = month;
    let newYear = year;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newDay = day - 1;
        if (newDay < 1) {
          newMonth = month - 1;
          if (newMonth < 0) {
            newMonth = 11;
            newYear = year - 1;
          }
          newDay = getDaysInMonth(newYear, newMonth);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        newDay = day + 1;
        if (newDay > getDaysInMonth(year, month)) {
          newDay = 1;
          newMonth = month + 1;
          if (newMonth > 11) {
            newMonth = 0;
            newYear = year + 1;
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        newDay = day - 7;
        if (newDay < 1) {
          newMonth = month - 1;
          if (newMonth < 0) {
            newMonth = 11;
            newYear = year - 1;
          }
          newDay = getDaysInMonth(newYear, newMonth) + newDay;
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        newDay = day + 7;
        const maxDays = getDaysInMonth(year, month);
        if (newDay > maxDays) {
          newDay = newDay - maxDays;
          newMonth = month + 1;
          if (newMonth > 11) {
            newMonth = 0;
            newYear = year + 1;
          }
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectDate(day);
        return;
      case 'Escape':
        e.preventDefault();
        closeCalendar();
        return;
      default:
        return;
    }

    setFocusedDate({ year: newYear, month: newMonth, day: newDay });
    setViewYear(newYear);
    setViewMonth(newMonth);
  }, [isOpen, focusedDate, selectDate, closeCalendar]);

  // ── Focus management ────────────────────────────────────────

  useEffect(() => {
    if (isOpen && gridRef.current) {
      gridRef.current.focus();
    }
  }, [isOpen]);

  // ── Display value ───────────────────────────────────────────

  const displayValue = useMemo(() => {
    if (!value) return '';
    const p = parseDate(value);
    if (!p) return value;
    return `${MONTH_NAMES[p.month]} ${p.day}, ${p.year}`;
  }, [value]);

  // ── Render ──────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      <label
        htmlFor={id}
        className="block font-heading text-xs uppercase tracking-wider text-text-secondary mb-1.5"
      >
        {label}
      </label>

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={isOpen ? closeCalendar : openCalendar}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${label}: ${displayValue || placeholder}`}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left',
          'bg-bg-deep/60 border border-white/10',
          'font-body text-sm',
          'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
          'transition-colors duration-150',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-white/20',
        )}
      >
        <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
        <span className={cn(
          'flex-1 truncate',
          displayValue ? 'text-text-primary' : 'text-text-tertiary',
        )}>
          {displayValue || placeholder}
        </span>
      </button>

      {/* Calendar popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Choose date for ${label}`}
          className={cn(
            'absolute z-50 mt-1 p-3 rounded-lg',
            'bg-bg-surface border border-white/10 shadow-xl',
            'w-[280px]',
          )}
        >
          {/* Month/Year header with navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="Previous month"
              className={cn(
                'p-1.5 rounded-md',
                'text-text-secondary hover:text-text-primary hover:bg-white/5',
                'transition-colors duration-150',
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-heading text-sm font-bold text-text-primary">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Next month"
              className={cn(
                'p-1.5 rounded-md',
                'text-text-secondary hover:text-text-primary hover:bg-white/5',
                'transition-colors duration-150',
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAY_LABELS.map((dayLabel) => (
              <div
                key={dayLabel}
                className="text-center text-[10px] font-heading uppercase tracking-wider text-text-tertiary py-1"
              >
                {dayLabel}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div
            ref={gridRef}
            role="grid"
            aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="grid grid-cols-7 gap-0 outline-none"
          >
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="p-1" />;
              }

              const isToday =
                day === today.day &&
                viewMonth === today.month &&
                viewYear === today.year;

              const isSelected =
                parsed !== null &&
                day === parsed.day &&
                viewMonth === parsed.month &&
                viewYear === parsed.year;

              const isFocused =
                focusedDate !== null &&
                day === focusedDate.day &&
                viewMonth === focusedDate.month &&
                viewYear === focusedDate.year;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  tabIndex={-1}
                  onClick={() => selectDate(day)}
                  className={cn(
                    'w-8 h-8 mx-auto rounded-md text-xs font-medium',
                    'flex items-center justify-center',
                    'transition-colors duration-100',
                    // Default state
                    'text-text-secondary hover:bg-white/10 hover:text-text-primary',
                    // Today highlight
                    isToday && !isSelected && 'ring-1 ring-accent-primary/50 text-accent-primary',
                    // Selected state
                    isSelected && 'bg-accent-primary text-white hover:bg-accent-primary/90',
                    // Focused state (keyboard navigation)
                    isFocused && !isSelected && 'ring-2 ring-accent-primary/70 bg-accent-primary/10',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => selectDate(today.day)}
              className={cn(
                'w-full px-2 py-1.5 rounded-md text-xs font-medium text-center',
                'text-accent-primary hover:bg-accent-primary/10',
                'transition-colors duration-150',
              )}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
