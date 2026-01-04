/**
 * Format a date object or ISO string to a user-friendly format
 * @param {Date|string} date - The date to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = true) => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('en-IN', options);
};

/**
 * Format a number as Indian Rupees
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string} date - The date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateObj, false);
};

/**
 * Calculate days since a given date
 * @param {Date|string} date - The date to compare
 * @returns {number} Number of days since the date
 */
export const daysSinceDate = (date) => {
  if (!date) return 0;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  const diffDays = Math.floor(diffMs / 86400000);
  
  return diffDays;
};

/**
 * Calculate the number of days since a given date (UTC-based to avoid timezone bugs)
 * @param {string|Date} reportDate - The date to calculate from
 * @returns {number} - Number of days (integer)
 */
export const calcDaysSince = (reportDate) => {
  if (!reportDate) return 0;
  
  const currentDate = new Date();
  const report = new Date(reportDate);
  
  // Use UTC to avoid timezone bugs
  const currentUTC = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const reportUTC = Date.UTC(report.getFullYear(), report.getMonth(), report.getDate());
  
  const diffMs = currentUTC - reportUTC;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
