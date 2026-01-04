const express = require('express');
const { 
  getAllSchedules, 
  getSchedulesByITI,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  scheduleMachines
} = require('../controllers/schedule.controller');

const router = express.Router();

router.get('/', getAllSchedules);
router.get('/iti/:itiId', getSchedulesByITI);
router.post('/', createSchedule);
router.post('/schedule-machines', scheduleMachines);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;