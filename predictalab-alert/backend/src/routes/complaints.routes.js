const express = require('express');
const { 
  getComplaintStats, 
  getBranchComplaintSummary 
} = require('../controllers/complaints.controller');

const router = express.Router();

// Get complaint statistics for top cards (Raised, In Progress, Solved)
router.get('/stats', getComplaintStats);

// Get branch-level complaint summary for table
router.get('/branches', getBranchComplaintSummary);

module.exports = router;
