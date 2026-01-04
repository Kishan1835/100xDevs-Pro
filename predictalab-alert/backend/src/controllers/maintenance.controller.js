const maintenanceRepo = require('../repositories/maintenance.repository');
const { success, error } = require('../utils/response');

exports.getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await maintenanceRepo.getAllLogs();
    success(res, logs);
  } catch (err) {
    next(err);
  }
};

exports.getMaintenanceWorkers = async (req, res, next) => {
  try {
    const workers = await maintenanceRepo.getAllWorkers();
    success(res, workers);
  } catch (err) {
    next(err);
  }
};

exports.getMaintenanceByITI = async (req, res, next) => {
  try {
    const data = await maintenanceRepo.getByITI(parseInt(req.params.itiId));
    success(res, data);
  } catch (err) {
    next(err);
  }
};

// Get machine statistics for dashboard cards
exports.getMaintenanceStats = async (req, res, next) => {
  try {
    const stats = await maintenanceRepo.getMachineStats();
    success(res, stats);
  } catch (err) {
    next(err);
  }
};

// Get detailed maintenance logs with joined data
exports.getMaintenanceLogsDetailed = async (req, res, next) => {
  try {
    const limit = req.query.limit || null;
    const logs = await maintenanceRepo.getMaintenanceLogsWithDetails(limit);
    success(res, logs);
  } catch (err) {
    next(err);
  }
};

// Get maintenance statistics for TO dashboard
exports.getTOMaintenanceStats = async (req, res, next) => {
  try {
    const stats = await maintenanceRepo.getMaintenanceStatistics();
    success(res, stats);
  } catch (err) {
    next(err);
  }
};

// Reopen a closed maintenance case
exports.reopenMaintenanceCase = async (req, res, next) => {
  try {
    const { logId } = req.params;
    const updatedLog = await maintenanceRepo.reopenMaintenanceCase(logId);
    success(res, updatedLog, 200, 'Case reopened successfully');
  } catch (err) {
    next(err);
  }
};

// Get dashboard statistics (healthyMachines, alertMachines, criticalMachines, pendingLogs)
exports.getDashboardStats = async (req, res, next) => {
  try {
    console.log('[getDashboardStats] Called with query:', req.query);
    const { itiId } = req.query;
    const stats = await maintenanceRepo.getMaintenanceDashboardStats(itiId);
    console.log('[getDashboardStats] Stats retrieved:', stats);
    success(res, stats);
  } catch (err) {
    console.error('[getDashboardStats] Error:', err.message);
    console.error(err.stack);
    next(err);
  }
};

// Get filtered maintenance logs with pagination
exports.getFilteredLogs = async (req, res, next) => {
  try {
    console.log('[getFilteredLogs] Called with query:', req.query);
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      itiId: req.query.itiId,
      limit: req.query.limit || 10,
      offset: req.query.offset || 0
    };
    const logs = await maintenanceRepo.getFilteredMaintenanceLogs(filters);
    console.log(`[getFilteredLogs] Retrieved ${logs.length} logs`);
    success(res, logs);
  } catch (err) {
    console.error('[getFilteredLogs] Error:', err.message);
    console.error(err.stack);
    next(err);
  }
};
