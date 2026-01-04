# 🔧 Maintenance Dashboard - Dynamic Implementation

## Overview
The Maintenance Dashboard has been converted from a static mockup to a fully dynamic, database-driven dashboard using React, Prisma, and PostgreSQL.

---

## 🎯 Features Implemented

### Backend Features
- ✅ Real-time machine status statistics (Healthy, Alert, Critical)
- ✅ Pending maintenance logs count
- ✅ Filtered maintenance logs with multiple criteria
- ✅ Pagination support (limit & offset)
- ✅ Date range filtering
- ✅ Status and priority filtering
- ✅ Days-since-report calculation (UTC-based)
- ✅ Joined queries with Machine, Worker, and ITI data
- ✅ Optional ITI filtering for multi-tenant support

### Frontend Features
- ✅ Dynamic stats cards with live data
- ✅ Real-time work orders table
- ✅ Filter controls:
  - Status dropdown (All, Pending, Open, In Progress, Closed, etc.)
  - Priority dropdown (All, High, Medium, Low, Critical)
  - Date range pickers (From/To)
  - Rows per page selector (5, 10, 20, 50)
- ✅ Pagination with Previous/Next buttons
- ✅ Refresh button to manually reload data
- ✅ Loading states for better UX
- ✅ Overdue highlighting (red background for >3 days, not closed)
- ✅ Color-coded status and priority badges
- ✅ Formatted dates
- ✅ Empty state handling
- ✅ Error handling with fallback values

---

## 📁 Files Modified/Created

### Backend
1. **`backend/src/repositories/maintenance.repository.js`**
   - `getMaintenanceDashboardStats(itiId)` - Stats for dashboard cards
   - `getFilteredMaintenanceLogs(filters)` - Filtered logs with pagination

2. **`backend/src/controllers/maintenance.controller.js`**
   - `getDashboardStats(req, res, next)` - Stats endpoint controller
   - `getFilteredLogs(req, res, next)` - Logs endpoint controller

3. **`backend/src/routes/maintenance.routes.js`**
   - Added routes for dashboard endpoints

### Frontend
4. **`frontend/src/dashboard/Maintenance/MaintenanceDashboard.jsx`**
   - Complete rewrite with dynamic data fetching
   - Filter and pagination implementation
   - UI enhancements

5. **`frontend/src/utils/dateUtils.js`**
   - Added `calcDaysSince()` function

### Documentation
6. **`MAINTENANCE_DASHBOARD_API_SAMPLES.md`** - API documentation with sample responses
7. **`MAINTENANCE_DASHBOARD_IMPLEMENTATION.md`** - Implementation summary
8. **`test-maintenance-dashboard-api.js`** - Test script for API endpoints

---

## 🚀 Quick Start

### 1. Start the Backend
```powershell
cd backend
node src/server.js
```

Expected output:
```
Server running on port 5000
Database connected successfully
```

### 2. Test the API (Optional)
```powershell
cd c:\Ria\MCA\SIH FINALS\PredictaLab
node test-maintenance-dashboard-api.js
```

### 3. Start the Frontend
```powershell
cd frontend
npm run dev
```

### 4. Access the Dashboard
Navigate to: `http://localhost:5173/maintenance` (or your configured route)

---

## 📡 API Endpoints

### GET `/api/maintenance/dashboard/stats`
Returns machine statistics and pending maintenance count.

**Query Parameters:**
- `itiId` (optional) - Filter by ITI

**Response:**
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

### GET `/api/maintenance/dashboard/logs`
Returns filtered maintenance logs with pagination.

**Query Parameters:**
- `status` - Filter by status (Pending, Open, In Progress, Closed, etc.)
- `priority` - Filter by priority (High, Medium, Low, Critical)
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `itiId` - Filter by ITI
- `limit` - Results per page (default: 10)
- `offset` - Pagination offset (default: 0)

**Example Request:**
```
GET /api/maintenance/dashboard/logs?status=Pending&priority=High&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "mlId": 243,
      "reportDate": "2024-11-28T10:30:00.000Z",
      "daysSinceReport": 5,
      "status": "Pending",
      "issueReported": "Abnormal noise detected",
      "machineId": 1003,
      "machineName": "Lathe Machine",
      "machineCode": "LM-1003",
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

## 🎨 UI Components

### Stats Cards
Four cards displaying:
1. **Healthy Machines** (Green) - Machines with Status = "HEALTHY"
2. **Alert Machines** (Yellow) - Machines with Status = "ALERT"
3. **Critical Machines** (Red) - Machines with Status = "CRITICAL"
4. **Pending Maintenance** (Blue) - Maintenance logs with Status = "Pending"

### Work Orders Table
Columns:
- **Work Order ID** - Format: WO-0001, WO-0002, etc.
- **Machine** - Machine name with model code
- **Issue** - Issue description
- **Priority** - Color-coded badge (High/Critical=red, Medium=orange, Low=yellow)
- **Status** - Color-coded badge (Pending=yellow, In Progress=blue, Closed=green)
- **Assigned To** - Worker name
- **Reported** - Formatted date
- **Days Since** - Days since report (red if >3 days and not closed)

### Filters
- **Status Dropdown** - Filter by work order status
- **Priority Dropdown** - Filter by severity/priority
- **Date Range** - Filter by report date range
- **Rows Per Page** - Select number of results (5, 10, 20, 50)

### Pagination
- **Previous Button** - Go to previous page (disabled on first page)
- **Next Button** - Go to next page (disabled on last page)
- **Page Counter** - Shows current page and result count

---

## 🔧 Configuration

### Backend Configuration
The backend uses environment variables. Ensure `.env` is configured:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
PORT=5000
```

### Frontend Configuration
API base URL is set in the component:

```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

Change this if your backend runs on a different port.

---

## 🧪 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Stats endpoint returns valid data
- [ ] Logs endpoint returns valid data
- [ ] Stats cards display correct counts
- [ ] Work orders table displays logs
- [ ] Status filter works (try "Pending")
- [ ] Priority filter works (try "High")
- [ ] Date range filter works
- [ ] Rows per page selector works
- [ ] Pagination Previous/Next buttons work
- [ ] Refresh button reloads data
- [ ] Overdue rows highlighted in red (>3 days)
- [ ] Loading states display correctly
- [ ] Empty state shows when no data

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Server won't start
- Check if port 5000 is available
- Verify DATABASE_URL in `.env`
- Run `npm install` to ensure dependencies are installed

**Problem:** Database errors
- Ensure PostgreSQL is running
- Run `npx prisma migrate dev` to apply migrations
- Run `npx prisma generate` to regenerate Prisma client

**Problem:** Empty data
- Check if database has records in `Machines` and `Maintenance_Log` tables
- Run seed script if available: `node prisma/seed.js`

### Frontend Issues

**Problem:** Stats showing 0
- Check browser console for errors
- Verify backend is running and accessible
- Check network tab for failed API calls
- Ensure CORS is enabled on backend

**Problem:** Table showing "No work orders found"
- Check if database has maintenance logs
- Try changing filters to "All"
- Check browser console for errors

**Problem:** Axios errors
- Verify `axios` is installed: `npm install axios`
- Check API_BASE_URL matches backend URL
- Check backend CORS configuration

---

## 📚 Database Schema

### Machines
- Machine_ID (PK)
- ITI_ID (FK)
- Machine_Name
- Status (HEALTHY | ALERT | CRITICAL)
- Model_No

### Maintenance_Log
- ML_ID (PK)
- ITI_ID (FK)
- Machine_ID (FK)
- M_Worker_ID (FK)
- Issue_Reported
- Status (Pending | Open | In Progress | Closed | Completed | Reopened)
- Severity (Low | Medium | High | Critical)
- Report_Date

### Maintenance_Workers
- M_Worker_ID (PK)
- Name
- Contact

### ITI
- ITI_ID (PK)
- Name

---

## 🔮 Future Enhancements

Potential improvements:
1. Add search functionality for machine names or issues
2. Add column sorting (click headers to sort)
3. Add export to CSV/PDF
4. Add real-time updates with WebSockets
5. Add ITI filter dropdown for multi-ITI views
6. Add row click to view detailed log information
7. Add "Create New Work Order" modal
8. Add bulk actions (assign multiple logs to worker)
9. Add worker assignment from dashboard
10. Add status update functionality

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation in `MAINTENANCE_DASHBOARD_API_SAMPLES.md`
3. Check implementation details in `MAINTENANCE_DASHBOARD_IMPLEMENTATION.md`
4. Run the test script: `node test-maintenance-dashboard-api.js`

---

## ✅ Success Criteria

The implementation is successful if:
- ✅ Stats cards show real database counts
- ✅ Work orders table displays maintenance logs from database
- ✅ Filters modify the displayed results
- ✅ Pagination works correctly
- ✅ Overdue rows are highlighted
- ✅ No console errors
- ✅ Loading states work properly
- ✅ API endpoints return valid JSON

---

**Status:** ✅ Implementation Complete
**Last Updated:** December 3, 2025
