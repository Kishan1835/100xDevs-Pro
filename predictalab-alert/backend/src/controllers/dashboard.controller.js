const dashboardRepo = require('../repositories/dashboard.repository');
const { success, error } = require('../utils/response');

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const stats = await dashboardRepo.getStats();
    success(res, stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    next(err);
  }
};

/**
 * Get all ITI locations for map
 * GET /api/dashboard/locations
 */
exports.getLocations = async (req, res, next) => {
  try {
    const locations = await dashboardRepo.getLocations();
    success(res, locations);
  } catch (err) {
    console.error('Error fetching ITI locations:', err);
    next(err);
  }
};

/**
 * Get ITI scores (calculates and updates scores in DB)
 * GET /api/dashboard/iti-scores
 */
exports.getITIScores = async (req, res, next) => {
  try {
    // Calculate fresh scores every time
    const scores = await dashboardRepo.calculateITIScores();
    success(res, scores);
  } catch (err) {
    console.error('Error calculating ITI scores:', err);
    next(err);
  }
};

/**
 * Get pre-calculated ITI scores from database (faster)
 * GET /api/dashboard/iti-scores/cached
 */
exports.getCachedITIScores = async (req, res, next) => {
  try {
    const scores = await dashboardRepo.getITIScores();
    success(res, scores);
  } catch (err) {
    console.error('Error fetching cached ITI scores:', err);
    next(err);
  }
};
