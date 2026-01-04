const express = require('express');
const router = express.Router();
const scheduleLogsController = require('../controllers/scheduleLogs.controller');

/**
 * @route   GET /api/schedule-logs
 * @desc    Get all schedule logs with optional filters
 * @query   date - Filter by specific date (YYYY-MM-DD)
 * @query   start - Filter by start date (YYYY-MM-DD)
 * @query   end - Filter by end date (YYYY-MM-DD)
 * @query   limit - Number of records to return
 * @query   offset - Number of records to skip
 */
router.get('/', scheduleLogsController.getScheduleLogs);

module.exports = router;
