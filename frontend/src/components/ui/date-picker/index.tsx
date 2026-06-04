/**
 * @file src/components/ui/date-picker/index.tsx
 */

import { buildCalendar, formatDateDisplay, todayISO } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { DAYS, MONTHS } from "@/lib/constants";

import styles from "./styles.module.css";

export interface DatePickerProps {
  value: string; // ISO "YYYY-MM-DD" or ""
  minDate?: string; // ISO lower bound
  maxDate?: string; // ISO upper bound
  onChange: (date: string) => void;
  placeholder?: string;
  onBlur?: () => void;
  disabled?: boolean;
  touched?: boolean;
  error?: boolean;
  id?: string;
}

export function DatePicker({
  placeholder = "Select a date…",
  onChange,
  disabled,
  touched,
  minDate,
  maxDate,
  onBlur,
  error,
  value,
  id,
}: DatePickerProps) {
  const parsed = value ? new Date(value + "T00:00:00") : new Date();
  const today = todayISO();

  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());
  const [isOpen, setIsOpen] = useState(false);

  // Track the previous value prop to safely catch external changes during render
  const [prevValue, setPrevValue] = useState(value);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync calendar view immediately during render when value changes externally
  if (value !== prevValue) {
    setPrevValue(value);
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  }

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        if (isOpen) onBlur?.();
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onBlur]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const isOutOfRange = (iso: string) =>
    (!!minDate && iso < minDate) || (!!maxDate && iso > maxDate);

  const selectDay = (iso: string) => {
    if (isOutOfRange(iso)) return;
    onChange(iso);
    setIsOpen(false);
    // onBlur?.();
  };

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    if (!isOutOfRange(today)) {
      onChange(today);
      setIsOpen(false);
      // onBlur?.();
    }
  };

  const clearDate = () => {
    onChange("");
    setIsOpen(false);
    // onBlur?.();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const calendarDays = buildCalendar(viewYear, viewMonth);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className={[
          styles.trigger,
          touched && error ? styles.triggerError : "",
          touched && !error ? styles.triggerValid : "",
          isOpen ? styles.triggerOpen : "",
          disabled ? styles.triggerDisabled : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <CalendarIcon className={styles.calIcon} />
        <span
          className={value ? styles.triggerValue : styles.triggerPlaceholder}
        >
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        <ChevronIcon
          className={[styles.chevron, isOpen ? styles.chevronOpen : ""]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {/* Calendar popup */}
      {isOpen && (
        <div
          className={styles.popup}
          role="dialog"
          aria-label="Date picker"
          aria-modal="true"
        >
          {/* Header */}
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            <span className={styles.monthYear}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              className={styles.navBtn}
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* Day names */}
          <div className={styles.dayNames} aria-hidden="true">
            {DAYS.map((d) => (
              <span key={d} className={styles.dayName}>
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className={styles.grid} role="grid">
            {calendarDays.map(({ iso, day, currentMonth }) => {
              const isSelected = iso === value;
              const isToday = iso === today;
              const isDisabled = isOutOfRange(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  disabled={isDisabled}
                  aria-selected={isSelected}
                  aria-label={formatDateDisplay(iso)}
                  onClick={() => selectDay(iso)}
                  className={[
                    styles.day,
                    !currentMonth ? styles.dayOther : "",
                    isToday ? styles.dayToday : "",
                    isSelected ? styles.daySelected : "",
                    isDisabled ? styles.dayDisabled : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.todayBtn} onClick={goToday}>
              Today
            </button>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearDate}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline icons ────────────────────────────────────────────────────────────

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default DatePicker;
