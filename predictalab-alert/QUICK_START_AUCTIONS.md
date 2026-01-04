# 🚀 Quick Start Guide - Auctions CRUD System

## Prerequisites
- Backend server running on port 5000
- Frontend server running on port 5173
- PostgreSQL database with Prisma schema applied

---

## 🏃 Start the System

### Step 1: Start Backend
```powershell
cd "c:\Ria\MCA\SIH FINALS\PredictaLab\backend"
node src/server.js
```

Expected output:
```
Server running on port 5000
```

### Step 2: Start Frontend (New Terminal)
```powershell
cd "c:\Ria\MCA\SIH FINALS\PredictaLab\frontend"
npm run dev
```

Expected output:
```
VITE ready in XXXms
Local: http://localhost:5173
```

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

Go to: **Auctions Management** page

---

## 🧪 Test the Backend First

Before using the frontend, test that the backend API works:

```powershell
cd "c:\Ria\MCA\SIH FINALS\PredictaLab\backend"
node test-auctions-api.js
```

This will run through all API endpoints and show you:
- ✅ What's working
- ❌ What needs attention
- ⚠️ Expected errors (like missing inventory items)

---

## 📝 How to Use the Frontend

### Adding an Auction

1. **Fill the form** at the top:
   - **Item ID**: Enter a number (must exist in Inventory table)
   - **ITI**: Select from dropdown (optional)
   - **Item Name**: Enter item name
   - **Quantity**: Enter quantity (must be > 0)
   - **Base Price**: Enter price (must be > 0)

2. **Click "Add Item"**

3. **See result**:
   - Success: Item appears in table below
   - Error: Alert shows what went wrong

### Editing an Auction

1. **Click "Edit"** on any row in the table

2. **Form fills automatically** with current data

3. **Modify any fields** except Item ID

4. **Click "Update Item"**

5. **Click "Cancel"** to abort editing

### Deleting an Auction

1. **Click "Delete"** on any row

2. **Confirm** in the dialog

3. **Item removed** from table

---

## 🔧 Common Issues & Solutions

### Issue: "Invalid Item ID or ITI ID"
**Cause**: The Item_ID doesn't exist in the Inventory table  
**Solution**: 
1. Check existing inventory: `http://localhost:5000/api/inventory`
2. Use an existing Item_ID, OR
3. Create the item in Inventory first

### Issue: "An auction with this Item ID already exists"
**Cause**: Trying to create duplicate auction  
**Solution**: Each Item_ID can only have one auction. Edit the existing one instead.

### Issue: Frontend shows "Failed to fetch auctions"
**Cause**: Backend not running  
**Solution**: Start backend server (see Step 1)

### Issue: Table is empty
**Cause**: No auctions in database yet  
**Solution**: Add an auction using the form

---

## 📊 Database Check

### View Data in Prisma Studio
```powershell
cd "c:\Ria\MCA\SIH FINALS\PredictaLab\backend"
npx prisma studio
```

Opens at: `http://localhost:5555`

Navigate to:
- **Auctions** - See all auction entries
- **Inventory** - See available items
- **ITI** - See available ITIs

---

## 🎯 Sample Workflow

### Complete Example

1. **Check what items exist**:
   ```
   GET http://localhost:5000/api/inventory
   ```
   Note an Item_ID (e.g., 1)

2. **Check what ITIs exist**:
   ```
   GET http://localhost:5000/api/iti
   ```
   Note an ITI_ID (e.g., 5)

3. **Create auction** via frontend:
   - Item ID: 1
   - ITI: Select "Government ITI Mumbai" (ID: 5)
   - Item Name: "CNC Machine Parts"
   - Quantity: 25
   - Base Price: 15000.50
   - Click "Add Item"

4. **See it in table** - new row appears

5. **Edit it**:
   - Click "Edit" on the row
   - Change Quantity to 30
   - Change Base Price to 16000.00
   - Click "Update Item"

6. **Delete it**:
   - Click "Delete"
   - Confirm
   - Row disappears

---

## 🔍 Debugging Tips

### Check Backend Logs
Watch the terminal where backend is running for:
- API requests
- Errors
- Database queries

### Check Browser Console
Press F12 in browser to see:
- Network requests
- JavaScript errors
- Response data

### Check Network Tab
In browser DevTools → Network:
- See all API calls
- Check request/response data
- Verify status codes

---

## 📚 API Reference

### Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| List all | GET | `/api/auctions` |
| Get one | GET | `/api/auctions/:itemId` |
| Create | POST | `/api/auctions` |
| Update | PUT | `/api/auctions/:itemId` |
| Delete | DELETE | `/api/auctions/:itemId` |
| Add bid | POST | `/api/auctions/:itemId/bid` |

### Test with cURL (Windows PowerShell)

**Get all auctions**:
```powershell
curl http://localhost:5000/api/auctions
```

**Create auction**:
```powershell
$body = @{
    itemId = 1
    itiId = 5
    itemName = "Test Item"
    quantity = 10
    basePrice = 5000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auctions" -Method POST -Body $body -ContentType "application/json"
```

---

## ✅ Checklist

Before reporting issues, verify:

- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 5173)
- [ ] Database is accessible
- [ ] Prisma migrations are applied
- [ ] Item_ID exists in Inventory table
- [ ] Browser console shows no errors
- [ ] Network tab shows successful requests

---

## 📖 Further Reading

- **Complete API Docs**: `backend/AUCTIONS_API_DOCUMENTATION.md`
- **Implementation Summary**: `AUCTIONS_IMPLEMENTATION_SUMMARY.md`
- **Prisma Schema**: `backend/prisma/schema.prisma`

---

## 🎉 You're Ready!

The system is fully functional. Start by:
1. Running the test script
2. Starting both servers
3. Opening the frontend
4. Adding your first auction

**Happy bidding! 🎊**
