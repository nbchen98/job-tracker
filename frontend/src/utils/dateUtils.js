/**
 * Utility functions for handling dates consistently across the application
 * This helps avoid timezone issues when working with date-only values
 */

/**
 * Extracts the YYYY-MM-DD part of a date string. Also accepts a full ISO
 * timestamp, which is what the API returned before it sent plain dates.
 */
const toDateOnly = (dateString) => dateString.slice(0, 10);

/**
 * Converts a date string (YYYY-MM-DD) to a proper Date object
 * by adding T00:00:00 to ensure it's treated as local time, not UTC
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} - Date object representing the date in local timezone
 */
export const parseDateString = (dateString) => {
  if (!dateString) return null;
  return new Date(toDateOnly(dateString) + 'T00:00:00');
};

/**
 * Formats a date string for display using the user's locale
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  return parseDateString(dateString).toLocaleDateString();
};

/**
 * Gets the date used to order a job: when it was applied to, or else when it was
 * created, or else the epoch so undated jobs still sort consistently
 * @param {object} job - Job from the API
 * @returns {Date} - Date to sort the job by
 */
export const getJobSortDate = (job) => {
  return job.date_applied ? parseDateString(job.date_applied) : new Date(job.created_at || 0);
};

/**
 * Moves a date back by whole months, staying in the target month when it's
 * shorter (March 31 minus one month is the last day of February)
 */
const subtractMonths = (date, months) => {
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() - months);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDayOfMonth));
};

/**
 * Gets the earliest date included by a date filter, at local midnight because
 * job dates are parsed to local midnight
 * @param {string} range - 'today', 'week', 'month' or '3months'
 * @returns {Date|null} - The cutoff, or null for an unknown range
 */
export const getDateFilterCutoff = (range) => {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);

  switch (range) {
    case 'today':
      return cutoff;
    case 'week':
      cutoff.setDate(cutoff.getDate() - 7);
      return cutoff;
    case 'month':
      subtractMonths(cutoff, 1);
      return cutoff;
    case '3months':
      subtractMonths(cutoff, 3);
      return cutoff;
    default:
      return null;
  }
};

/**
 * Converts a date string from the database to the format expected by HTML date inputs
 * Takes the date text as-is: going through toISOString would convert local
 * midnight to UTC and give the previous day in timezones ahead of UTC
 * @param {string} dateString - Date string from database
 * @returns {string} - Date string in YYYY-MM-DD format for HTML input
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return toDateOnly(dateString);
};

