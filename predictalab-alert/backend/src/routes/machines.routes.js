const express = require('express');

const { 
  getAllMachines, 
  getMachinesByITI,
  getMachineStats,
  scheduleAllMachinesForITI,
  getMachineDetails,
  getMaintenanceHistory,
  getLatestSensorData,
  updateMaintenanceStatus,
  markFalseAlert
} = require('../controllers/machines.controller');

const router = express.Router();

router.get('/', getAllMachines);
router.get('/stats', getMachineStats);
router.get('/iti/:itiId', getMachinesByITI);

// New routes for machine details page
router.get('/:machineId/details', getMachineDetails);
router.get('/:machineId/maintenance-history', getMaintenanceHistory);
router.get('/:machineId/sensor-latest', getLatestSensorData);
router.patch('/:machineId/update-status', updateMaintenanceStatus);
router.post('/:machineId/false-alert', markFalseAlert);

router.post('/schedule/:itiId', scheduleAllMachinesForITI);

module.exports = router;