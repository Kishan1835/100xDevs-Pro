require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mock data
const schedules = [
  {
    S_Log_ID: 1,
    ITI_ID: 101,
    Machine_ID: 1001,
    Worker_ID: 501,
    Student_ID: 301,
    Time: 45,
    Scheduled_On: new Date('2025-01-10T09:00'),
    Completed_At: new Date('2025-01-10T09:45'),
    iti: { Name: 'ITI 101' },
    machine: { Machine_Name: 'Lathe' },
    worker: { Name: 'Worker 1' },
    student: { Name: 'Student 1' }
  }
];

app.get('/api/schedules', (req, res) => {
  console.log('Responding with schedules');
  res.json({
    success: true,
    data: schedules
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
