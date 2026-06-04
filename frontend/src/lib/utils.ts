/**
 * @file src/lib/utils.ts
 */

import type { PayloadAction } from "@reduxjs/toolkit";
import type { OperationState } from "./types";
import { MONTHS } from "./constants";
import { isAxiosError } from "axios";

function axiosErrorHandler(error: unknown) {
  if (isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    return typeof serverMessage === "string" ? serverMessage : error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

function formatTimeAgo(dateInput: Date | number | string): string {
  const date = new Date(dateInput);

  // 1. Validation: Prevent "Invalid Date" (NaN) from causing RangeError
  if (isNaN(date.getTime())) {
    return "invalid date";
  }

  const now = new Date();
  // 2. Calculation: format() needs the raw number (diff), not the Date
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  // Handle "just now" for very small differences
  if (Math.abs(diffInSeconds) < 60) return "just now";

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds) {
      // 3. Finite Check: Ensure result of division is a valid number
      const value = Math.floor(diffInSeconds / seconds);
      return rtf.format(value, unit);
    }
  }

  return "just now";
}

/**
 * Constrains the key 'K' to only those keys in 'State'
 * that are actually of type 'OperationState'.
 */
const handlePending = <
  State extends Record<K, OperationState>,
  K extends keyof State,
>(
  state: State,
  key: K,
): void => {
  state[key].status = "pending";
  state[key].error = null;
};

const handleRejected = <
  State extends Record<K, OperationState>,
  K extends keyof State,
>(
  state: State,
  key: K,
  action: PayloadAction<unknown>,
): void => {
  state[key].status = "failed";
  if (typeof action.payload === "string") {
    state[key].error = action.payload;
  }
};

// don't return boolean => return value is string if the condtion is true
/* const isString = (value: unknown): value is string => {
  return typeof value === "string";
}; */

export const cx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

// ── Date utilities ──────────────────────────────────────────────────────────

function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function toISO(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function todayISO(): string {
  return toISO(new Date());
}

interface CalendarDay {
  currentMonth: boolean;
  iso: string;
  day: number;
}

function buildCalendar(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstWeekday = new Date(year, month, 1).getDay(); // 3
  const prevMonthDays = new Date(year, month, 0).getDate(); // 31
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 28

  for (
    let i = firstWeekday - 1;
    i >= 0;
    i-- // 3
  )
    days.push({
      iso: toISO(new Date(year, month - 1, prevMonthDays - i)),
      day: prevMonthDays - i,
      currentMonth: false,
    });

  for (let d = 1; d <= daysInMonth; d++)
    days.push({
      iso: toISO(new Date(year, month, d)),
      currentMonth: true,
      day: d,
    });

  for (let d = 1; days.length < 42; d++)
    days.push({
      iso: toISO(new Date(year, month + 1, d)),
      day: d,
      currentMonth: false,
    });

  return days;
}

export {
  axiosErrorHandler,
  formatDateDisplay,
  getNestedValue,
  handleRejected,
  formatTimeAgo,
  handlePending,
  buildCalendar,
  todayISO,
};
