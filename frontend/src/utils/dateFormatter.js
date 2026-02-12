import { format } from "date-fns";

/**
 * Format a date string to a readable format.
 * @param {string | Date} date - The date to format.
 * @param {string} dateFormat - The format string (default: 'PPP').
 * @returns {string} - Formatted date.
 */
export function dateFormatter(date, dateFormat = "ppp") {
  if (!date) return "";

  try {
    return format(new Date(date), dateFormat);
  } catch {
    console.log("Invalid date passed:", date);
    return "";
  }
}

/* "PPP" is a built-in format for a human-readable long date. You can change it to something like "dd/MM/yyyy" if you prefer. */

export const DATE_FORMATS = {
  long: "PPP",
  short: "MM/dd/yyyy",
  numeric: "yyyy-MM-dd",
  pretty: "MMM do, yyyy",
};

/**
 * MMM → Short month (Apr)
 * do → Day of month with ordinal (3rd)
 * yyyy → Full year (2025)
 */
