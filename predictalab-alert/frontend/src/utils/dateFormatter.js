/**
 * Format date to dd/mm/yyyy
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time in hours
 * @param {number} hours - Time in hours
 * @returns {string} Formatted time string
 */
export function formatTime(hours) {
  if (hours === null || hours === undefined) return 'N/A';
  
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}

/**
 * Convert date to YYYY-MM-DD format for input fields
 * @param {Date} date - Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export function toInputDateFormat(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export function getTodayDate() {
  return toInputDateFormat(new Date());
}
