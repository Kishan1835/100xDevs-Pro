const mapRepository = require('../repositories/map.repository');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Search ITIs by query string
 * GET /api/map/search?query=<string>
 */
const search = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await mapRepository.searchITIs(query);
    
    return sendSuccess(res, results, 200, 'Search completed successfully');
  } catch (error) {
    console.error('Error in search controller:', error);
    return sendError(res, 'Failed to search ITIs', 500);
  }
};

/**
 * Filter ITIs by city and/or state
 * GET /api/map/filter?city=<city>&state=<state>
 */
const filter = async (req, res) => {
  try {
    const { city, state } = req.query;
    const results = await mapRepository.filterITIs(city, state);
    
    return sendSuccess(res, results, 200, 'Filter applied successfully');
  } catch (error) {
    console.error('Error in filter controller:', error);
    return sendError(res, 'Failed to filter ITIs', 500);
  }
};

/**
 * Get all ITI locations
 * GET /api/map/locations
 */
const getLocations = async (req, res) => {
  try {
    const locations = await mapRepository.getAllLocations();
    
    return sendSuccess(res, locations, 200, 'Locations retrieved successfully');
  } catch (error) {
    console.error('Error in getLocations controller:', error);
    return sendError(res, 'Failed to retrieve locations', 500);
  }
};

/**
 * Get maintenance statistics
 * GET /api/map/stats
 */
const getStats = async (req, res) => {
  try {
    const stats = await mapRepository.getStats();
    
    return sendSuccess(res, stats, 200, 'Stats retrieved successfully');
  } catch (error) {
    console.error('Error in getStats controller:', error);
    return sendError(res, 'Failed to retrieve stats', 500);
  }
};

/**
 * Get filter options (cities and states)
 * GET /api/map/filter-options
 */
const getFilterOptions = async (req, res) => {
  try {
    const [cities, states] = await Promise.all([
      mapRepository.getUniqueCities(),
      mapRepository.getUniqueStates()
    ]);

    return sendSuccess(res, { cities, states }, 200, 'Filter options retrieved successfully');
  } catch (error) {
    console.error('Error in getFilterOptions controller:', error);
    return sendError(res, 'Failed to retrieve filter options', 500);
  }
};

module.exports = {
  search,
  filter,
  getLocations,
  getStats,
  getFilterOptions
};
