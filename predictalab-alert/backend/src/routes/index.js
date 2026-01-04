const express = require('express');
const itiRoutes = require('./iti.routes');
const machinesRoutes = require('./machines.routes');
const studentsRoutes = require('./students.routes');
const maintenanceRoutes = require('./maintenance.routes');
const inventoryRoutes = require('./inventory.routes');
const scheduleRoutes = require('./schedule.routes');
const scheduleLogsRoutes = require('./scheduleLogs.routes');
const notificationsRoutes = require('./notifications.routes');
const dashboardRoutes = require('./dashboard.routes');
const mapRoutes = require('./map.routes');
const branchesRoutes = require('./branches.routes');
const auctionsRoutes = require('./auctions.routes');
const complaintsRoutes = require('./complaints.routes');


const router = express.Router();

router.use('/iti', itiRoutes);
router.use('/machines', machinesRoutes);
router.use('/students', studentsRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/schedule-logs', scheduleLogsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/map', mapRoutes);
router.use('/branches', branchesRoutes);
router.use('/auctions', auctionsRoutes);
router.use('/complaints', complaintsRoutes);

module.exports = router;
