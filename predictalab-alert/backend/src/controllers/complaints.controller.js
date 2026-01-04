const complaintsRepo = require('../repositories/complaints.repository');
const { success, error } = require('../utils/response');

/**
 * Get complaint statistics for top cards
 * GET /api/complaints/stats
 */
exports.getComplaintStats = async (req, res, next) => {
  try {
    const stats = await complaintsRepo.getComplaintStats();
    success(res, stats);
  } catch (err) {
    next(err);
  }
};

/**
 * Get branch-level complaint summary for table
 * GET /api/complaints/branches
 */
exports.getBranchComplaintSummary = async (req, res, next) => {
  try {
    const branches = await complaintsRepo.getBranchComplaintSummary();
    success(res, branches);
  } catch (err) {
    next(err);
  }
};
