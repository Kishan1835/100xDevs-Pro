# Complaints API Documentation

## Overview
This API provides endpoints for managing and retrieving complaint statistics and branch-level complaint summaries for the NCVET Complaints Page.

---

## Endpoints

### 1. Get Complaint Statistics
**Endpoint:** `GET /api/complaints/stats`

**Description:** Returns aggregate statistics for the top cards (Raised, In Progress, Solved)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "raisedCount": 123,
    "inProgressCount": 45,
    "solvedCount": 78
  }
}
```

**Fields:**
- `raisedCount`: Count of all maintenance_logs where status != "Closed"
- `inProgressCount`: Count of maintenance_logs where status in ["In Progress", "On Hold", "Reopened"]
- `solvedCount`: Count of maintenance_logs where status = "Closed"

---

### 2. Get Branch Complaint Summary
**Endpoint:** `GET /api/complaints/branches`

**Description:** Returns complaint statistics for each ITI branch for the table display

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "itiId": 1,
      "name": "Government ITI Mumbai",
      "raisedCount": 25,
      "inProgressCount": 10,
      "solvedCount": 15,
      "highestSeverity": "Critical",
      "score": 60,
      "lastUpdated": "2025-11-15T10:30:00.000Z"
    },
    {
      "itiId": 2,
      "name": "Government ITI Delhi",
      "raisedCount": 30,
      "inProgressCount": 5,
      "solvedCount": 25,
      "highestSeverity": "High",
      "score": 83,
      "lastUpdated": "2025-11-14T08:20:00.000Z"
    },
    {
      "itiId": 3,
      "name": "Government ITI Bangalore",
      "raisedCount": 20,
      "inProgressCount": 15,
      "solvedCount": 5,
      "highestSeverity": "Critical",
      "score": 25,
      "lastUpdated": "2025-11-13T14:45:00.000Z"
    }
  ]
}
```

**Fields per Branch:**
- `itiId`: ITI unique identifier
- `name`: ITI name
- `raisedCount`: Count of maintenance_logs for this ITI where status != "Closed"
- `inProgressCount`: Count where status in ["In Progress", "On Hold", "Reopened"]
- `solvedCount`: Count where status = "Closed"
- `highestSeverity`: Highest machine status for this ITI (Critical > High > Low > Healthy)
  - Based on machine.Status: CRITICAL → "Critical", ALERT → "High", HEALTHY → "Low"
- `score`: ITI_score from ITI table
- `lastUpdated`: ITI.Updated_At timestamp

---

## Implementation Details

### Backend Structure

**Repository:** `backend/src/repositories/complaints.repository.js`
- `getComplaintStats()`: Aggregates maintenance log counts
- `getBranchComplaintSummary()`: Fetches ITI data with related maintenance logs and machines

**Controller:** `backend/src/controllers/complaints.controller.js`
- `getComplaintStats()`: Handles /stats endpoint
- `getBranchComplaintSummary()`: Handles /branches endpoint

**Routes:** `backend/src/routes/complaints.routes.js`
- Defines the two GET endpoints

### Frontend Integration

**Component:** `frontend/src/dashboard/NCVET/ComplaintsPage.jsx`

**Features:**
- ✅ Removed search bar completely
- ✅ Dynamic top cards fetching from `/api/complaints/stats`
- ✅ Dynamic table fetching from `/api/complaints/branches`
- ✅ Removed "View More" column
- ✅ Loading state and error handling
- ✅ Maintained Tailwind styling
- ✅ Date formatting for lastUpdated field

**API Calls:**
```javascript
axios.get('http://localhost:5000/api/complaints/stats')
axios.get('http://localhost:5000/api/complaints/branches')
```

---

## Database Schema Reference

### Maintenance_Log Table
```prisma
model Maintenance_Log {
  ML_ID             Int      @id @default(autoincrement())
  ITI_ID            Int
  Machine_ID        Int
  M_Worker_ID       Int
  Worker_ID         Int
  Issue_Reported    String
  Action_Taken      String
  Severity          String
  Status            String    // "Closed", "In Progress", "On Hold", "Reopened", "Pending"
  Report_Date       DateTime
  Next_Service_Date DateTime
  Created_At        DateTime @default(now())
  Updated_At        DateTime @updatedAt
}
```

### ITI Table
```prisma
model ITI {
  ITI_ID            Int       @id @default(autoincrement())
  Name              String
  City              String
  State             String
  ITI_score         Int
  Created_At        DateTime  @default(now())
  Updated_At        DateTime  @updatedAt
}
```

### Machines Table
```prisma
model Machines {
  Machine_ID        Int       @id @default(autoincrement())
  ITI_ID            Int
  Status            MachineStatus  // HEALTHY, ALERT, CRITICAL
}
```

---

## Testing

Test the endpoints using:

```bash
# Terminal 1 - Start backend server
cd backend
npm run dev

# Terminal 2 - Test endpoints
curl http://localhost:5000/api/complaints/stats
curl http://localhost:5000/api/complaints/branches
```

Or use the test files in the backend directory.

---

## Status Mappings

### Maintenance Log Status Values:
- `Closed` → Solved
- `In Progress` → In Progress
- `On Hold` → In Progress
- `Reopened` → In Progress
- `Pending` → Raised
- (Any other status) → Raised

### Machine Status to Severity:
- `CRITICAL` → "Critical"
- `ALERT` → "High"
- `HEALTHY` → "Low"
- No machines → "Healthy"

---

## Example Use Case

When the ComplaintsPage component loads:

1. Fetches stats: Shows "Raised: 123, In Progress: 45, Solved: 78"
2. Fetches branches: Displays table with all ITIs and their complaint counts
3. Each row shows:
   - Branch name
   - Issue counts
   - Highest severity badge
   - ITI score with progress bar
   - Last updated date

All data is live from the database with no static arrays.
