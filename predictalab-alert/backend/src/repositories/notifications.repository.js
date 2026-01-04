const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get the latest 5 notifications from Maintenance_Log
 * @returns {Promise<Array>}
 */
async function getLatestNotifications() {
  try {
    const notifications = await prisma.maintenance_Log.findMany({
      orderBy: {
        Report_Date: 'desc'
      },
      take: 5,
      include: {
        machine: true
      }
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

module.exports = {
  getLatestNotifications
};
