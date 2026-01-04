# Testing Guide - TO Maintenance Page

## 🧪 Pre-Test Checklist

Before testing, ensure the following:

- [ ] Backend server is running on port 3000
- [ ] Frontend dev server is running
- [ ] Database has sample data in the following tables:
  - `machines`
  - `maintenance_logs` (with various statuses: Open, Pending, Closed)
  - `maintenance_workers` (with contact numbers)
  - `iti`

---

## 🚀 Step-by-Step Testing

### Step 1: Start Backend Server

```bash
cd backend
node src/server.js
```

**Expected Output:**
```
Server running on port 3000
Database connected successfully
```

### Step 2: Test Backend API Endpoints

#### Test Stats Endpoint
```bash
# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/maintenance/to-stats" -Method GET
```

**Expected Response:**
```json
{
  "data": {
    "activeMachines": 12,
    "underMaintenance": 3,
    "upcomingMaintenance": 5
  }
}
```

#### Test Logs Endpoint
```bash
# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/maintenance/logs/detailed?limit=5" -Method GET
```

**Expected Response:**
```json
{
  "data": [
    {
      "logId": 1,
      "machineName": "CNC Machine A",
      "workerName": "Rajesh Kumar",
      "workerContact": "+91-9876543210",
      "requestType": "Oil Leakage",
      "reportDate": "2025-11-25T00:00:00.000Z",
      "daysSinceReport": 8,
      "status": "Open"
    }
  ]
}
```

### Step 3: Start Frontend Server

```bash
cd frontend
npm run dev
```

### Step 4: Navigate to TO Maintenance Page

Open browser and go to the TO Maintenance page URL (typically within your TO dashboard route).

---

## ✅ UI Feature Testing

### Test 1: Stats Cards Display

**What to Check:**
- [ ] Three cards are displayed
- [ ] "Active Machines" shows correct count from database
- [ ] "Under Maintenance" shows count of logs with Status = "Open"
- [ ] "Upcoming Maintenance" shows count of logs with Status = "Pending"
- [ ] Cards have proper colors (green, blue, yellow)

**How to Verify:**
1. Compare card numbers with database query results
2. Check that numbers update if database changes

---

### Test 2: Recent Maintenance Requests Table

**What to Check:**
- [ ] Table shows last 5 maintenance logs
- [ ] Machine names are displayed correctly
- [ ] Request types are shown
- [ ] Dates are formatted as "Nov 25, 2025"
- [ ] Days since report is calculated and shown
- [ ] Status colors are correct:
  - Pending = yellow
  - Open = blue
  - Completed/Closed = green
- [ ] Phone icon appears in each row

**How to Verify:**
1. Check that data matches database records
2. Verify date formatting is human-readable
3. Confirm status colors match the specification

---

### Test 3: Overdue Highlighting

**What to Check:**
- [ ] Rows with `daysSinceReport > 3` AND status != "Closed" are highlighted in red
- [ ] Overdue status shows "(Overdue)" label
- [ ] Completed/Closed items are NOT highlighted even if old

**How to Test:**
1. Look for logs older than 3 days with "Open" or "Pending" status
2. Verify entire row has red background (`bg-red-50`)
3. Check status cell shows red text

---

### Test 4: Worker Contact Popup

**What to Check:**
- [ ] Clicking phone icon opens popup
- [ ] Popup displays worker name
- [ ] Popup displays worker contact number
- [ ] Phone icon appears next to contact number
- [ ] "Call Now" button has proper `tel:` link
- [ ] "Close" button closes the popup
- [ ] X button in top-right closes popup
- [ ] Clicking outside popup doesn't close it (modal behavior)

**How to Test:**
1. Click phone icon in any row
2. Verify popup appears with correct worker info
3. Test all close methods
4. Try clicking "Call Now" (should trigger phone app on mobile)

---

### Test 5: Loading State

**What to Check:**
- [ ] Loading spinner appears on page load
- [ ] "Loading maintenance data..." message is shown
- [ ] Loading state disappears after data loads

**How to Test:**
1. Refresh the page
2. Watch for spinner and loading message
3. Optionally: Throttle network in browser DevTools to slow down loading

---

### Test 6: Error Handling

**What to Check:**
- [ ] Error message appears if backend is down
- [ ] "Retry" button is functional
- [ ] Clicking retry re-attempts the API call

**How to Test:**
1. Stop the backend server
2. Refresh the page
3. Verify error message appears
4. Restart backend
5. Click "Retry" button
6. Verify data loads successfully

---

### Test 7: Empty State

**What to Check:**
- [ ] Message "No maintenance requests found" appears when logs array is empty
- [ ] Table structure still renders
- [ ] No errors in console

**How to Test:**
1. Temporarily modify repository to return empty array
2. Or test with empty database
3. Verify graceful handling

---

### Test 8: Request Details Cards

**What to Check:**
- [ ] Bottom section shows first 2 detailed logs
- [ ] Each card displays:
  - Machine name
  - Worker assigned
  - Date requested
  - Description
  - Status (with color)
  - "Contact Worker" button
- [ ] Clicking "Contact Worker" opens popup

**How to Test:**
1. Scroll to bottom of page
2. Verify 2 detailed cards are shown
3. Check all fields are populated
4. Test contact button

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" or CORS Error
**Solution:**
- Ensure backend is running on port 3000
- Check CORS is enabled in backend
- Verify API URL in frontend matches backend port

### Issue 2: Stats Show 0
**Solution:**
- Check database has records in `machines` table with Status = "HEALTHY"
- Verify `maintenance_logs` table has records with Status = "Open" or "Pending"

### Issue 3: No Logs Displayed
**Solution:**
- Verify `maintenance_logs` table has records
- Check Prisma relations are properly set up
- Ensure foreign keys are valid

### Issue 4: Date Format Issues
**Solution:**
- Check `dateUtils.js` is properly imported
- Verify date fields in database are valid Date objects

### Issue 5: Worker Contact Not Showing
**Solution:**
- Ensure `maintenance_workers` table has `Contact` field populated
- Check Prisma include is fetching worker data

---

## 📊 Database Seed Data (Optional)

If you need to add test data:

```sql
-- Add test machines
INSERT INTO "Machines" ("ITI_ID", "Machine_Name", "Type", "Model_No", "Manufacturer", "Installation_Date", "Last_Service_Date", "Warranty_Expiry_Date", "Status", "Last_used", "Faults")
VALUES (1, 'CNC Machine A', 'CNC', 'CNC-2000', 'Siemens', '2023-01-15', '2025-11-01', '2026-01-15', 'HEALTHY', NOW(), 0);

-- Add test maintenance workers
INSERT INTO "Maintenance_Workers" ("ITI_ID", "Name", "Experience", "Salary", "Contact", "last_worked", "Active_Status", "Solved_cases", "pending")
VALUES (1, 'Rajesh Kumar', 5.5, '35000', '+91-9876543210', NOW(), true, 45, '2');

-- Add test maintenance logs
INSERT INTO "Maintenance_Log" ("ITI_ID", "Machine_ID", "M_Worker_ID", "Worker_ID", "Issue_Reported", "Action_Taken", "Severity", "Status", "Report_Date", "Next_Service_Date")
VALUES (1, 1, 1, 1, 'Oil Leakage', 'Replaced seal', 'High', 'Open', '2025-11-25', '2025-12-10');
```

---

## ✅ Final Validation Checklist

After all tests pass:

- [ ] All 3 stats cards display correct data
- [ ] Recent requests table shows up to 5 logs
- [ ] Dates are properly formatted
- [ ] Status colors are correct
- [ ] Overdue items are highlighted
- [ ] Worker contact popup works
- [ ] Loading state displays on initial load
- [ ] Error handling works when backend is down
- [ ] No console errors
- [ ] UI is responsive on mobile/tablet
- [ ] All Tailwind styles render correctly

---

## 📝 Test Results Template

Use this template to document your test results:

```
Date Tested: __________
Tester: __________

Backend Tests:
- [ ] Stats endpoint working
- [ ] Logs endpoint working
- [ ] Limit parameter working

Frontend Tests:
- [ ] Stats cards display correctly
- [ ] Table renders with data
- [ ] Date formatting correct
- [ ] Status colors correct
- [ ] Overdue highlighting works
- [ ] Worker popup functional
- [ ] Loading state works
- [ ] Error handling works

Issues Found:
1. ___________________
2. ___________________

Overall Status: [ ] PASS  [ ] FAIL

Notes:
_______________________________
```

---

**Happy Testing! 🎉**
