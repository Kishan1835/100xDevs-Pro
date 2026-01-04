const prisma = require('../config/db');

/**
 * Get all schedule logs with joined data
 * Supports filtering by date, date range, and pagination
 */
async function getAllScheduleLogs({ date, startDate, endDate, limit, offset }) {
  const whereClause = {};

  // Single date filter
  if (date) {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    whereClause.Scheduled_On = {
      gte: targetDate,
      lt: nextDay
    };
  }
  
  // Date range filter
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Include the end date
    
    whereClause.Scheduled_On = {
      gte: start,
      lt: end
    };
  }

  try {
    const logs = await prisma.schedule_Logs.findMany({
      where: whereClause,
      include: {
        iti: {
          select: {
            ITI_ID: true,
            Name: true
          }
        },
        machine: {
          select: {
            Machine_ID: true,
            Machine_Name: true
          }
        },
        worker: {
          select: {
            Worker_ID: true,
            Name: true
          }
        },
        student: {
          select: {
            Student_ID: true,
            Name: true
          }
        }
      },
      orderBy: [
        { Scheduled_On: 'asc' },
        { S_Log_ID: 'asc' }
      ],
      skip: offset ? parseInt(offset) : undefined,
      take: limit ? parseInt(limit) : undefined
    });

    return logs;
  } catch (error) {
    console.error('Error fetching schedule logs:', error);
    throw error;
  }
}

/**
 * Get total count of schedule logs (for pagination)
 */
async function getScheduleLogsCount({ date, startDate, endDate }) {
  const whereClause = {};

  // Single date filter
  if (date) {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    whereClause.Scheduled_On = {
      gte: targetDate,
      lt: nextDay
    };
  }
  
  // Date range filter
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    
    whereClause.Scheduled_On = {
      gte: start,
      lt: end
    };
  }

  try {
    const count = await prisma.schedule_Logs.count({
      where: whereClause
    });
    return count;
  } catch (error) {
    console.error('Error counting schedule logs:', error);
    throw error;
  }
}

module.exports = {
  getAllScheduleLogs,
  getScheduleLogsCount
};
