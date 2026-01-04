const scheduleRepo = require('../repositories/schedule.repository');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await scheduleRepo.getAll();
    console.log('📋 Fetched schedules from repo:', schedules.length);
    if (schedules.length > 0) {
      console.log('First schedule:', JSON.stringify(schedules[0], null, 2));
    }
    sendSuccess(res, schedules);
  } catch (err) {
    console.error('Error in getAllSchedules:', err);
    next(err);
  }
};

exports.getSchedulesByITI = async (req, res, next) => {
  try {
    const schedules = await scheduleRepo.getByITI(parseInt(req.params.itiId));
    sendSuccess(res, schedules);
  } catch (err) {
    next(err);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleRepo.create(req.body);
    sendSuccess(res, schedule, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleRepo.update(parseInt(req.params.id), req.body);
    sendSuccess(res, schedule);
  } catch (err) {
    next(err);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    await scheduleRepo.remove(parseInt(req.params.id));
    sendSuccess(res, { message: 'Schedule deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Schedule machines to students for a specific ITI
 * POST /api/schedules/schedule-machines
 * Body: { itiId: number, workerId?: number, timeAllocation?: number }
 */
exports.scheduleMachines = async (req, res, next) => {
  try {
    const { itiId, workerId, timeAllocation } = req.body;

    // Validate required parameter
    if (!itiId) {
      return sendError(res, 'ITI_ID is required', 400);
    }

    // Call repository function
    const scheduledAssignments = await scheduleRepo.scheduleMachines(
      parseInt(itiId),
      workerId ? parseInt(workerId) : null,
      timeAllocation ? parseInt(timeAllocation) : 60
    );

    sendSuccess(res, {
      message: `Successfully scheduled ${scheduledAssignments.length} students to machines`,
      count: scheduledAssignments.length,
      assignments: scheduledAssignments
    }, 201);
  } catch (err) {
    console.error('Error in scheduleMachines controller:', err);
    next(err);
  }
};