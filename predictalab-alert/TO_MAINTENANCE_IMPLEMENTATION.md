# TO Maintenance Page - Dynamic Implementation

## Overview
Successfully converted `TOMaintenancePage.jsx` from a static UI to a fully dynamic, database-driven component that fetches real-time maintenance data.

---

## 📊 Database Table: `maintenance_logs`

### Relations Used:
- **Machine Name** → `Machines.Machine_Name`
- **Worker Name** → `Maintenance_Workers.Name`
- **Worker Contact** → `Maintenance_Workers.Contact`
- **ITI Name** → `ITI.Name`

---

## 🔧 Backend Implementation

### 1. Repository Layer (`maintenance.repository.js`)

#### New Function: `getMaintenanceStatistics()`
Fetches real-time counts for:
- **Active Machines**: Count of machines with `Status = "HEALTHY"`
- **Under Maintenance**: Count of logs with `Status = "Open"`
- **Upcoming Maintenance**: Count of logs with `Status = "Pending"`

```javascript
exports.getMaintenanceStatistics = async () => {
  const activeMachines = await prisma.machines.count({
    where: { Status: 'HEALTHY' }
  });
  const underMaintenance = await prisma.maintenance_Log.count({
    where: { Status: 'Open' }
  });
  const upcomingMaintenance = await prisma.maintenance_Log.count({
    where: { Status: 'Pending' }
  });
  return { activeMachines, underMaintenance, upcomingMaintenance };
};
```

#### Enhanced Function: `getMaintenanceLogsWithDetails(limit)`
- Accepts optional `limit` parameter
- Joins: `machine`, `maintenanceWorker`, `iti`
- Includes worker contact information
- Calculates `daysSinceReport` for each log
- Returns formatted data with all required fields

### 2. Controller Layer (`maintenance.controller.js`)

#### New Endpoint: `getTOMaintenanceStats()`
```javascript
exports.getTOMaintenanceStats = async (req, res, next) => {
  try {
    const stats = await maintenanceRepo.getMaintenanceStatistics();
    success(res, stats);
  } catch (err) {
    next(err);
  }
};
```

#### Enhanced Endpoint: `getMaintenanceLogsDetailed()`
Now supports `?limit=5` query parameter for fetching recent logs.

### 3. Routes Layer (`maintenance.routes.js`)

Added new route:
```javascript
router.get('/to-stats', getTOMaintenanceStats);
```

Existing route supports query params:
```javascript
router.get('/logs/detailed', getMaintenanceLogsDetailed);
// Usage: /api/maintenance/logs/detailed?limit=5
```

---

## 🎨 Frontend Implementation

### Component: `TOMaintenancePage.jsx`

#### Features Implemented:

##### ✅ 1. Dynamic Stats Cards
- Fetches real-time data from `/api/maintenance/to-stats`
- Displays:
  - Active Machines (green)
  - Under Maintenance (blue)
  - Upcoming Maintenance (yellow)

##### ✅ 2. Recent Maintenance Requests Table
- Fetches last 5 logs from `/api/maintenance/logs/detailed?limit=5`
- Displays:
  - Machine Name
  - Request Type
  - Report Date (formatted: "Nov 25, 2025")
  - Days since report
  - Status with color coding:
    - **Pending** → yellow
    - **Completed/Closed** → green
    - **Open** → blue
  - Call icon for worker contact

##### ✅ 3. Overdue Highlighting
- Rows highlighted in **red** if:
  - `daysSinceReport > 3` AND
  - `status != "Closed"` AND `status != "Completed"`
- Status cell shows "(Overdue)" label

##### ✅ 4. Worker Contact Popup
- Phone icon in each row
- Clicking opens modal with:
  - Worker Name
  - Contact Number
  - "Call Now" button (tel: link)
  - "Close" button

##### ✅ 5. Loading & Error States
- Loading spinner while fetching data
- Error message with retry button
- Empty state when no logs found

##### ✅ 6. Request Details Cards
- Shows first 2 detailed logs
- Includes all log information
- "Contact Worker" button with phone icon

---

## 🛠️ Utility Functions

### File: `dateUtils.js`

#### New Function: `daysSinceDate()`
```javascript
export const daysSinceDate = (date) => {
  if (!date) return 0;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  return Math.floor(diffMs / 86400000);
};
```

#### Existing Function: `formatDate()`
Used to format dates as "Nov 25, 2025"

---

## 📡 API Endpoints

### GET `/api/maintenance/to-stats`
**Response:**
```json
{
  "data": {
    "activeMachines": 12,
    "underMaintenance": 3,
    "upcomingMaintenance": 5
  }
}
```

### GET `/api/maintenance/logs/detailed?limit=5`
**Response:**
```json
{
  "data": [
    {
      "logId": 1,
      "machineId": 5,
      "machineName": "CNC Machine A",
      "workerId": 2,
      "workerName": "Rajesh Kumar",
      "workerContact": "+91-9876543210",
      "itiId": 1,
      "itiName": "ITI Delhi",
      "requestType": "Oil Leakage",
      "description": "Machine Oil Leakage",
      "reportDate": "2025-11-25T00:00:00.000Z",
      "daysSinceReport": 8,
      "status": "Open",
      "severity": "High"
    }
  ]
}
```

---

## 🎯 Key Features Checklist

- [x] **Dynamic Stats Cards** - Real-time counts from database
- [x] **Recent Logs Table** - Last 5 maintenance requests
- [x] **Date Formatting** - "Nov 25, 2025" format
- [x] **Days Since Report** - Calculated and displayed
- [x] **Status Color Coding** - Pending/Open/Completed colors
- [x] **Overdue Highlighting** - Red background for overdue items
- [x] **Worker Contact Popup** - Modal with name and phone
- [x] **Call Icon** - Phone icon instead of trash icon
- [x] **Loading State** - Spinner while fetching
- [x] **Error Handling** - Error message with retry
- [x] **Empty State** - Message when no data
- [x] **Tailwind Styling** - Consistent theme
- [x] **Backend API** - All routes and queries implemented

---

## 🚀 Testing the Implementation

### 1. Start Backend Server
```bash
cd backend
node src/server.js
```

### 2. Start Frontend Server
```bash
cd frontend
npm start
```

### 3. Navigate to TO Maintenance Page
The page should now display real-time data from the database.

### 4. Test Features:
- ✓ Stats cards show actual counts
- ✓ Recent logs table populated from DB
- ✓ Click phone icon to see worker contact
- ✓ Overdue items highlighted in red
- ✓ Date formatting works correctly
- ✓ Loading/error states function properly

---

## 📝 Notes

1. **Database Required**: Ensure the database has sample data in:
   - `machines` table (with Status field)
   - `maintenance_logs` table (with Status, Report_Date)
   - `maintenance_workers` table (with Contact field)
   - `iti` table

2. **API Base URL**: Currently set to `http://localhost:3000`. Update if your backend runs on a different port.

3. **Prisma Relations**: The implementation relies on proper foreign key relationships defined in `schema.prisma`.

4. **Icons**: Uses `react-icons` (FiPhone, FiX from Feather Icons). Already installed in package.json.

---

## 🔄 Future Enhancements

- Add pagination for "View All" functionality
- Implement filtering by status/severity
- Add export functionality for reports
- Real-time updates using WebSocket
- Search functionality for machines/workers
- Detailed view page for each maintenance log

---

**Implementation Date**: December 3, 2025  
**Status**: ✅ Complete and Ready for Testing
