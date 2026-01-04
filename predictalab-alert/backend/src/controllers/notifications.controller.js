const notificationsRepository = require('../repositories/notifications.repository');
const { success, error } = require('../utils/response');

/**
 * Calculate time ago from a given date
 * @param {Date} date 
 * @returns {string}
 */
function calculateTimeAgo(date) {
  const now = new Date();
  const reportDate = new Date(date);
  const diffInMs = now - reportDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return reportDate.toLocaleDateString();
}

/**
 * Get latest notifications
 */
async function getLatestNotifications(req, res) {
  try {
    const notifications = await notificationsRepository.getLatestNotifications();

    // Transform the data to match the required format
    const formattedNotifications = notifications.map(log => ({
      machineId: log.Machine_ID,
      machineName: log.machine.Machine_Name,
      issue: log.Issue_Reported,
      reportedAt: log.Report_Date,
      timeAgo: calculateTimeAgo(log.Report_Date)
    }));

    return success(res, formattedNotifications, 200, 'Latest notifications fetched successfully');
  } catch (error) {
    console.error('Error in getLatestNotifications controller:', error);
    return error(res, 'Failed to fetch notifications', 500);
  }
}

module.exports = {
  getLatestNotifications
};
