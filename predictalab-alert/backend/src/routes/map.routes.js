const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');

// Search ITIs by query
router.get('/search', mapController.search);

// Filter ITIs by city and/or state
router.get('/filter', mapController.filter);

// Get all ITI locations
router.get('/locations', mapController.getLocations);

// Get maintenance statistics
router.get('/stats', mapController.getStats);

// Get filter options (cities and states)
router.get('/filter-options', mapController.getFilterOptions);

module.exports = router;
