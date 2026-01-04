// Minimal test server to verify the new endpoints work
const express = require('express');
const cors = require('cors');
const maintenanceRepo = require('./src/repositories/maintenance.repository');
const { success } = require('./src/utils/response');

const app = express();
app.use(cors());
app.use(express.json());

// Dashboard stats endpoint
app.get('/api/maintenance/dashboard/stats', async (req, res) => {
  try {
    console.log('[TEST] getDashboardStats called');
    const { itiId } = req.query;
    const stats = await maintenanceRepo.getMaintenanceDashboardStats(itiId);
    console.log('[TEST] Stats:', stats);
    success(res, stats);
  } catch (err) {
    console.error('[TEST] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dashboard logs endpoint
app.get('/api/maintenance/dashboard/logs', async (req, res) => {
  try {
    console.log('[TEST] getFilteredLogs called');
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      itiId: req.query.itiId,
      limit: req.query.limit || 10,
      offset: req.query.offset || 0
    };
    const logs = await maintenanceRepo.getFilteredMaintenanceLogs(filters);
    console.log(`[TEST] Retrieved ${logs.length} logs`);
    success(res, logs);
  } catch (err) {
    console.error('[TEST] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`- GET http://localhost:${PORT}/api/maintenance/dashboard/stats`);
  console.log(`- GET http://localhost:${PORT}/api/maintenance/dashboard/logs`);
});
