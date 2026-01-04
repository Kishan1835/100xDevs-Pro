# Maintenance Dashboard API Documentation

## Overview
This document provides sample JSON responses for the maintenance dashboard endpoints.

---

## Endpoints

### 1. GET `/api/maintenance/dashboard/stats`

**Description:** Returns dashboard statistics including machine counts and pending maintenance logs.

**Query Parameters:**
- `itiId` (optional): Filter by specific ITI ID

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "healthyMachines": 152,
    "alertMachines": 9,
    "criticalMachines": 3,
    "pendingLogs": 6
  }
}
```

---

### 2. GET `/api/maintenance/dashboard/logs`

**Description:** Returns filtered maintenance logs with pagination support.

**Query Parameters:**
- `status` (optional): Filter by status (Pending, Open, In Progress, Closed, Completed, Reopened)
- `priority` (optional): Filter by priority/severity (High, Medium, Low, Critical)
- `startDate` (optional): Filter logs from this date (YYYY-MM-DD)
- `endDate` (optional): Filter logs until this date (YYYY-MM-DD)
- `itiId` (optional): Filter by specific ITI ID
- `limit` (default: 10): Number of records per page
- `offset` (default: 0): Pagination offset

**Sample Request:**
```
GET /api/maintenance/dashboard/logs?status=Pending&limit=10&offset=0
```

**Sample Response:**
```json
{
  "success": true,
  "data": [
    {
      "mlId": 243,
      "reportDate": "2024-11-28T10:30:00.000Z",
      "daysSinceReport": 5,
      "status": "Pending",
      "issueReported": "Abnormal noise detected during operation",
      "machineId": 1003,
      "machineName": "Lathe Machine",
      "machineCode": "LM-1003-2024",
      "workerId": 5,
      "workerName": "John Smith",
      "itiId": 1,
      "itiName": "Government ITI Mumbai",
      "priority": "High"
    },
    {
      "mlId": 242,
      "reportDate": "2024-11-27T14:15:00.000Z",
      "daysSinceReport": 6,
      "status": "In Progress",
      "issueReported": "Scheduled maintenance for belt replacement",
      "machineId": 1005,
      "machineName": "Milling Machine",
      "machineCode": "MM-1005-2024",
      "workerId": 7,
      "workerName": "Sarah Johnson",
      "itiId": 1,
      "itiName": "Government ITI Mumbai",
      "priority": "Medium"
    },
    {
      "mlId": 241,
      "reportDate": "2024-11-25T09:00:00.000Z",
      "daysSinceReport": 8,
      "status": "Pending",
      "issueReported": "Machine overheating issue",
      "machineId": 1003,
      "machineName": "Lathe Machine",
      "machineCode": "LM-1003-2024",
      "workerId": 5,
      "workerName": "John Smith",
      "itiId": 1,
      "itiName": "Government ITI Mumbai",
      "priority": "High"
    }
  ]
}
```

---

## Frontend Integration

### Using the API in React

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Fetch stats
const fetchStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/maintenance/dashboard/stats`);
  return response.data.data;
};

// Fetch logs with filters
const fetchLogs = async (filters) => {
  const params = new URLSearchParams();
  if (filters.status !== 'All') params.append('status', filters.status);
  if (filters.priority !== 'All') params.append('priority', filters.priority);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('limit', filters.limit);
  params.append('offset', filters.offset);

  const response = await axios.get(
    `${API_BASE_URL}/maintenance/dashboard/logs?${params.toString()}`
  );
  return response.data.data;
};
```

---

## Database Schema Reference

### Machines Table
- `Machine_ID` (PK)
- `ITI_ID` (FK)
- `Machine_Name`
- `Status` (HEALTHY, ALERT, CRITICAL)
- `Model_No`

### Maintenance_Log Table
- `ML_ID` (PK)
- `ITI_ID` (FK)
- `Machine_ID` (FK)
- `M_Worker_ID` (FK)
- `Issue_Reported`
- `Status` (Pending, Open, In Progress, Closed, Completed, Reopened)
- `Severity` (Low, Medium, High, Critical)
- `Report_Date`

### Maintenance_Workers Table
- `M_Worker_ID` (PK)
- `Name`
- `Contact`

### ITI Table
- `ITI_ID` (PK)
- `Name`

---

## Features Implemented

### Backend
1. ✅ Dashboard stats endpoint with machine status counts
2. ✅ Filtered logs endpoint with pagination
3. ✅ Support for status, priority, and date range filters
4. ✅ Days since report calculation (UTC-based)
5. ✅ Joined queries with machine, worker, and ITI details

### Frontend
1. ✅ Dynamic stats cards with real-time data
2. ✅ Work orders table with live database data
3. ✅ Filter controls (status, priority, date range)
4. ✅ Pagination with limit and offset
5. ✅ Refresh button for manual updates
6. ✅ Overdue highlighting (red background for >3 days)
7. ✅ Loading states and error handling
8. ✅ Formatted dates and status badges
9. ✅ Rows per page selector

---

## Testing

To test the endpoints, ensure the backend server is running:

```bash
cd backend
node src/server.js
```

Then access the frontend:

```bash
cd frontend
npm run dev
```

Navigate to the Maintenance Dashboard to see the dynamic data in action.
