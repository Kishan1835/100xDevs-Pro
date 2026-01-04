const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branches.controller');

// Get all ITIs with stats
router.get('/', branchesController.getAllBranches);

// Get single ITI with detailed stats
router.get('/:itiId', branchesController.getBranchById);

// Get recent activities for an ITI
router.get('/:itiId/recent-activities', branchesController.getRecentActivities);

// Get monthly complaint trend
router.get('/:itiId/complaint-trend', branchesController.getComplaintTrend);

// Get report data for PDF generation
router.get('/:itiId/report-data', branchesController.getReportData);

module.exports = router;
