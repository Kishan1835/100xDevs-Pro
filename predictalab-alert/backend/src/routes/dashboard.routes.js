const express = require('express');
const { 
  getStats, 
  getLocations, 
  getITIScores, 
  getCachedITIScores 
} = require('../controllers/dashboard.controller');

const router = express.Router();

// Dashboard statistics
router.get('/stats', getStats);

// ITI locations for map
router.get('/locations', getLocations);

// ITI scores (calculates fresh)
router.get('/iti-scores', getITIScores);

// Cached ITI scores (faster)
router.get('/iti-scores/cached', getCachedITIScores);

module.exports = router;
