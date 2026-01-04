const express = require('express');
const { 
  getMaintenanceLogs, 
  getMaintenanceWorkers,
  getMaintenanceByITI,
  getMaintenanceStats,
  getMaintenanceLogsDetailed,
  getTOMaintenanceStats,
  reopenMaintenanceCase,
  getDashboardStats,
  getFilteredLogs
} = require('../controllers/maintenance.controller');

const router = express.Router();

// Dashboard endpoints
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/logs', getFilteredLogs);

// Existing endpoints
router.get('/logs', getMaintenanceLogs);
router.get('/workers', getMaintenanceWorkers);
router.get('/iti/:itiId', getMaintenanceByITI);
router.get('/stats', getMaintenanceStats);
router.get('/logs/detailed', getMaintenanceLogsDetailed);
router.get('/to-stats', getTOMaintenanceStats);
router.put('/reopen/:logId', reopenMaintenanceCase);

module.exports = router;
