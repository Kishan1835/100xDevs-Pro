# 🚀 Quick Start Guide - Dynamic Complaints Page

## ✅ What Was Changed

### 🗑️ Removed
- ❌ Search bar component completely deleted
- ❌ Static `complaintsData` array removed
- ❌ "View More" column removed from table
- ❌ Change percentage indicators from stat cards

### ✨ Added
- ✅ Real-time data fetching from database
- ✅ Loading states and error handling
- ✅ Two new API endpoints for complaints
- ✅ Dynamic rendering of all components

---

## 📁 Files Created/Modified

### Backend Files Created:
1. `backend/src/repositories/complaints.repository.js` - Database queries
2. `backend/src/controllers/complaints.controller.js` - Request handlers
3. `backend/src/routes/complaints.routes.js` - Route definitions

### Backend Files Modified:
4. `backend/src/routes/index.js` - Added complaints routes

### Frontend Files Modified:
5. `frontend/src/dashboard/NCVET/ComplaintsPage.jsx` - Complete rewrite

### Documentation:
6. `COMPLAINTS_API_DOCUMENTATION.md` - Full API docs
7. `COMPLAINTS_API_SAMPLES.json` - Sample responses
8. `test-complaints-api.js` - API test suite
9. `QUICK_START_COMPLAINTS.md` - This file

---

## 🔧 How to Test

### 1. Start Backend Server
```powershell
cd backend
npm run dev
```

### 2. Test API Endpoints (Optional)
```powershell
# In project root
node test-complaints-api.js
```

### 3. Start Frontend
```powershell
cd frontend
npm run dev
```

### 4. Access the Page
Navigate to the Complaints Page in your NCVET dashboard

---

## 📊 API Endpoints

### GET /api/complaints/stats
**Returns:** Top card statistics
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

### GET /api/complaints/branches
**Returns:** Branch-level complaint data
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
    }
  ]
}
```

---

## 🎨 Frontend Component Structure

```jsx
ComplaintsPage
├── Header Icons (Filters, Profile)
├── Stat Cards (3 cards)
│   ├── Raised
│   ├── In Progress
│   └── Solved
└── Branch Table
    ├── Branch Name
    ├── Issue Raised
    ├── In Progress
    ├── Solved
    ├── Highest Severity
    ├── ITI Score (with progress bar)
    └── Last Updated
```

---

## 🔍 Data Flow

1. **Component Mounts** → `useEffect` triggers `fetchComplaintData()`
2. **Parallel API Calls** → Fetches both stats and branches simultaneously
3. **State Updates** → `setStats()` and `setBranches()`
4. **Render** → Dynamic data displays in cards and table

---

## 📝 Key Features

### Dynamic Top Cards
- **Raised**: Count of all open maintenance logs (status != "Closed")
- **In Progress**: Count of logs with status in ["In Progress", "On Hold", "Reopened"]
- **Solved**: Count of logs with status = "Closed"

### Dynamic Table
Each row shows:
- **Branch Name**: ITI name from database
- **Issue Raised**: Count of open logs for that ITI
- **In Progress**: Count of active logs for that ITI
- **Solved**: Count of closed logs for that ITI
- **Highest Severity**: Based on machine status (Critical > High > Low)
- **ITI Score**: Progress bar showing ITI_score
- **Last Updated**: ITI.Updated_At formatted as YYYY-MM-DD

### Severity Calculation
- **Critical**: ITI has at least one machine with status "CRITICAL"
- **High**: ITI has at least one machine with status "ALERT"
- **Low**: All machines are "HEALTHY"
- **Healthy**: No machines or all healthy

---

## 🛠️ Database Tables Used

### Maintenance_Log
- Fields: `Status`, `ITI_ID`, `ML_ID`
- Used for: Counting complaints by status

### ITI
- Fields: `ITI_ID`, `Name`, `ITI_score`, `Updated_At`
- Used for: Branch information and scores

### Machines
- Fields: `Machine_ID`, `ITI_ID`, `Status`
- Used for: Determining highest severity

---

## ✨ Error Handling

The component includes:
- **Loading State**: Shows "Loading complaint data..." while fetching
- **Error State**: Shows red error banner if API calls fail
- **Empty State**: Shows "No branch data available" if no ITIs exist

---

## 🎯 Status Values Reference

### Maintenance Log Status
- `Closed` → Considered "Solved"
- `In Progress` → Considered "In Progress"
- `On Hold` → Considered "In Progress"
- `Reopened` → Considered "In Progress"
- `Pending` → Considered "Raised"
- Any other → Considered "Raised"

### Machine Status → Severity
- `CRITICAL` → "Critical"
- `ALERT` → "High"
- `HEALTHY` → "Low"

---

## 📞 Troubleshooting

### Backend not responding
```powershell
# Check if backend is running
cd backend
npm run dev
```

### Frontend showing errors
```powershell
# Verify backend URL in ComplaintsPage.jsx
# Should be: http://localhost:5000/api
```

### Empty data
```powershell
# Check database has ITIs and maintenance_logs
# Run Prisma Studio to verify:
cd backend
npx prisma studio
```

---

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend dev server running
- [ ] No search bar visible on page
- [ ] Three stat cards showing real numbers
- [ ] Table showing ITI branches with real data
- [ ] No "View More" column in table
- [ ] Loading state appears briefly on mount
- [ ] Date formatting works correctly
- [ ] Severity badges display properly
- [ ] Score progress bars render correctly

---

## 🎉 Success Criteria

Your implementation is successful if:
1. ✅ Page loads without errors
2. ✅ Top cards display real complaint counts
3. ✅ Table shows all ITIs from database
4. ✅ Each row has accurate counts
5. ✅ Severity levels match machine statuses
6. ✅ No static data arrays remain
7. ✅ Search bar is completely removed
8. ✅ "View More" column is removed

---

## 📚 Additional Resources

- Full API Documentation: `COMPLAINTS_API_DOCUMENTATION.md`
- Sample JSON Responses: `COMPLAINTS_API_SAMPLES.json`
- Test Suite: `test-complaints-api.js`
- Prisma Schema: `backend/prisma/schema.prisma`

---

**Created on:** December 4, 2025  
**Component:** ComplaintsPage (NCVET Dashboard)  
**Status:** ✅ Fully Dynamic - Database Driven
