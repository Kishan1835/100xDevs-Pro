const branchesRepository = require('../repositories/branches.repository');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get all ITIs with stats
 * GET /api/branches
 */
const getAllBranches = async (req, res) => {
  try {
    console.log('[BRANCHES] getAllBranches called');
    const branches = await branchesRepository.getAllITIs();
    console.log(`[BRANCHES] Retrieved ${branches.length} branches`);
    return sendSuccess(res, branches, 200, 'Branches retrieved successfully');
  } catch (error) {
    console.error('Error in getAllBranches controller:', error);
    console.error('Stack:', error.stack);
    return sendError(res, 'Failed to retrieve branches', 500);
  }
};

/**
 * Get single ITI with detailed stats
 * GET /api/branches/:itiId
 */
const getBranchById = async (req, res) => {
  try {
    const { itiId } = req.params;
    const branch = await branchesRepository.getITIById(itiId);
    
    if (!branch) {
      return sendError(res, 'Branch not found', 404);
    }
    
    return sendSuccess(res, branch, 200, 'Branch retrieved successfully');
  } catch (error) {
    console.error('Error in getBranchById controller:', error);
    return sendError(res, 'Failed to retrieve branch', 500);
  }
};

/**
 * Get recent activities for an ITI
 * GET /api/branches/:itiId/recent-activities
 */
const getRecentActivities = async (req, res) => {
  try {
    const { itiId } = req.params;
    const activities = await branchesRepository.getRecentActivities(itiId);
    
    return sendSuccess(res, activities, 200, 'Activities retrieved successfully');
  } catch (error) {
    console.error('Error in getRecentActivities controller:', error);
    return sendError(res, 'Failed to retrieve activities', 500);
  }
};

/**
 * Get monthly complaint trend for an ITI
 * GET /api/branches/:itiId/complaint-trend
 */
const getComplaintTrend = async (req, res) => {
  try {
    const { itiId } = req.params;
    const trend = await branchesRepository.getMonthlyComplaintTrend(itiId);
    
    return sendSuccess(res, trend, 200, 'Complaint trend retrieved successfully');
  } catch (error) {
    console.error('Error in getComplaintTrend controller:', error);
    return sendError(res, 'Failed to retrieve complaint trend', 500);
  }
};

/**
 * Get report data for PDF generation
 * GET /api/branches/:itiId/report-data
 */
const getReportData = async (req, res) => {
  try {
    const { itiId } = req.params;
    const reportData = await branchesRepository.getReportData(itiId);
    
    if (!reportData) {
      return sendError(res, 'Branch not found', 404);
    }
    
    return sendSuccess(res, reportData, 200, 'Report data retrieved successfully');
  } catch (error) {
    console.error('Error in getReportData controller:', error);
    return sendError(res, 'Failed to retrieve report data', 500);
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  getRecentActivities,
  getComplaintTrend,
  getReportData
};
