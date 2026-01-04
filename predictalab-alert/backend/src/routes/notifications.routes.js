const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');

// GET /api/notifications/latest - Get latest 5 notifications
router.get('/latest', notificationsController.getLatestNotifications);

module.exports = router;
