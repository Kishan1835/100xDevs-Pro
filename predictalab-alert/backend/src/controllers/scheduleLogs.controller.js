const scheduleLogsRepository = require('../repositories/scheduleLogs.repository');

/**
 * @desc    Get all schedule logs with optional filters
 * @route   GET /api/schedule-logs
 * @access  Public
 */
async function getScheduleLogs(req, res) {
  try {
    const { date, start, end, limit, offset } = req.query;

    // Prepare filter parameters
    const filterParams = {
      date: date || null,
      startDate: start || null,
      endDate: end || null,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : 0
    };

    // Fetch logs and total count
    const [logs, totalCount] = await Promise.all([
      scheduleLogsRepository.getAllScheduleLogs(filterParams),
      scheduleLogsRepository.getScheduleLogsCount({
        date: filterParams.date,
        startDate: filterParams.startDate,
        endDate: filterParams.endDate
      })
    ]);

    // Transform data to match frontend requirements
    const transformedLogs = logs.map(log => ({
      logId: log.S_Log_ID,
      itiId: log.ITI_ID,
      itiName: log.iti.Name,
      machineId: log.Machine_ID,
      machineName: log.machine.Machine_Name,
      workerId: log.Worker_ID,
      workerName: log.worker.Name,
      studentId: log.Student_ID,
      studentName: log.student.Name,
      scheduledOn: log.Scheduled_On,
      time: log.Time
    }));

    res.status(200).json({
      success: true,
      count: transformedLogs.length,
      total: totalCount,
      data: transformedLogs
    });
  } catch (error) {
    console.error('Error in getScheduleLogs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule logs',
      error: error.message
    });
  }
}

module.exports = {
  getScheduleLogs
};
