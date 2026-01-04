# Auctions API Documentation

## Overview
This API provides full CRUD operations for managing auctions in the ITI system. Each auction represents an item available for bidding, linked to the Inventory and optionally to an ITI.

## Base URL
```
http://localhost:5000/api/auctions
```

---

## Endpoints

### 1. Get All Auctions
**GET** `/api/auctions`

Retrieves all auction items with related ITI and item information.

**Response Example:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "itemId": 1,
      "itiId": 5,
      "itiName": "Government ITI Mumbai",
      "itiCity": "Mumbai",
      "itiState": "Maharashtra",
      "itemName": "CNC Machine Parts",
      "quantity": 25,
      "basePrice": 15000.50,
      "bids": 3,
      "lastUpdated": "2025-12-03T10:30:00.000Z"
    },
    {
      "itemId": 2,
      "itiId": null,
      "itiName": "N/A",
      "itiCity": "",
      "itiState": "",
      "itemName": "Welding Equipment",
      "quantity": 10,
      "basePrice": 8500.00,
      "bids": 0,
      "lastUpdated": "2025-12-03T09:15:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Auction
**GET** `/api/auctions/:itemId`

Retrieves a specific auction by Item ID.

**Parameters:**
- `itemId` (path parameter) - The Item_ID of the auction

**Response Example:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "itemId": 1,
    "itiId": 5,
    "itiName": "Government ITI Mumbai",
    "itemName": "CNC Machine Parts",
    "quantity": 25,
    "basePrice": 15000.50,
    "bids": 3,
    "lastUpdated": "2025-12-03T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Auction not found"
}
```

---

### 3. Create New Auction
**POST** `/api/auctions`

Creates a new auction entry.

**Request Body:**
```json
{
  "itemId": 3,
  "itiId": 7,
  "itemName": "Electrical Tools Set",
  "quantity": 15,
  "basePrice": 5000.00
}
```

**Field Descriptions:**
- `itemId` (required, integer) - Must reference an existing Item_ID in Inventory table
- `itiId` (optional, integer) - Must reference an existing ITI_ID, or null
- `itemName` (required, string) - Name of the auction item
- `quantity` (required, integer) - Must be greater than 0
- `basePrice` (required, decimal) - Must be greater than 0

**Success Response (201):**
```json
{
  "success": true,
  "message": "Auction created successfully",
  "data": {
    "itemId": 3,
    "itiId": 7,
    "itiName": "ITI Pune",
    "itemName": "Electrical Tools Set",
    "quantity": 15,
    "basePrice": 5000.00,
    "bids": 0,
    "lastUpdated": "2025-12-03T11:00:00.000Z"
  }
}
```

**Error Responses:**

*Missing Fields (400):*
```json
{
  "success": false,
  "error": "Missing required fields: itemId, itemName, quantity, basePrice"
}
```

*Duplicate Item ID (409):*
```json
{
  "success": false,
  "error": "An auction with this Item ID already exists"
}
```

*Invalid Foreign Key (400):*
```json
{
  "success": false,
  "error": "Invalid Item ID or ITI ID - related record not found"
}
```

---

### 4. Update Auction
**PUT** `/api/auctions/:itemId`

Updates an existing auction. Only provide fields you want to update.

**Parameters:**
- `itemId` (path parameter) - The Item_ID of the auction to update

**Request Body (all fields optional):**
```json
{
  "itiId": 8,
  "itemName": "Updated Item Name",
  "quantity": 20,
  "basePrice": 6000.00,
  "bids": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Auction updated successfully",
  "data": {
    "itemId": 3,
    "itiId": 8,
    "itiName": "ITI Delhi",
    "itemName": "Updated Item Name",
    "quantity": 20,
    "basePrice": 6000.00,
    "bids": 5,
    "lastUpdated": "2025-12-03T11:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Auction not found"
}
```

---

### 5. Delete Auction
**DELETE** `/api/auctions/:itemId`

Deletes an auction entry.

**Parameters:**
- `itemId` (path parameter) - The Item_ID of the auction to delete

**Success Response (200):**
```json
{
  "success": true,
  "message": "Auction deleted successfully",
  "data": {
    "itemId": 3
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Auction not found"
}
```

---

### 6. Increment Bid Count
**POST** `/api/auctions/:itemId/bid`

Increments the bid count for an auction by 1.

**Parameters:**
- `itemId` (path parameter) - The Item_ID of the auction

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "itemId": 1,
    "bids": 4,
    "lastUpdated": "2025-12-03T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Auction not found"
}
```

---

## Database Schema

```prisma
model Auctions {
  Item_ID      Int      @id
  ITI_ID       Int?
  Item_Name    String
  Quantity     Int
  Base_Price   Decimal
  Last_Updated DateTime @default(now())
  Bids         Int      @default(0)

  item         Inventory @relation(fields: [Item_ID], references: [Item_ID])
  iti          ITI?      @relation(fields: [ITI_ID], references: [ITI_ID])
}
```

---

## Testing the API

### Using cURL

**Get All Auctions:**
```bash
curl http://localhost:5000/api/auctions
```

**Create Auction:**
```bash
curl -X POST http://localhost:5000/api/auctions \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "itiId": 5,
    "itemName": "CNC Machine Parts",
    "quantity": 25,
    "basePrice": 15000.50
  }'
```

**Update Auction:**
```bash
curl -X PUT http://localhost:5000/api/auctions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 30,
    "basePrice": 16000.00
  }'
```

**Delete Auction:**
```bash
curl -X DELETE http://localhost:5000/api/auctions/1
```

### Using JavaScript/Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Get all auctions
const auctions = await axios.get(`${API_BASE_URL}/auctions`);

// Create auction
const newAuction = await axios.post(`${API_BASE_URL}/auctions`, {
  itemId: 1,
  itiId: 5,
  itemName: "CNC Machine Parts",
  quantity: 25,
  basePrice: 15000.50
});

// Update auction
const updated = await axios.put(`${API_BASE_URL}/auctions/1`, {
  quantity: 30
});

// Delete auction
await axios.delete(`${API_BASE_URL}/auctions/1`);

// Place bid
await axios.post(`${API_BASE_URL}/auctions/1/bid`);
```

---

## Frontend Integration

The AuctionPage.jsx component provides a complete UI for:
- Viewing all auctions in a table
- Adding new auction items
- Editing existing auctions
- Deleting auctions
- Displaying ITI information
- Real-time bid count tracking
- Date formatting

### Key Features:
1. **Dynamic ITI Dropdown** - Fetches all ITIs for selection
2. **Form Validation** - Required fields and value constraints
3. **Edit Mode** - Click "Edit" to load data into form
4. **Error Handling** - User-friendly error messages
5. **Loading States** - Disabled buttons during operations
6. **Formatted Display** - Currency and date formatting

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## Notes

1. **Item_ID is Primary Key**: The Item_ID in the Auctions table must match an existing Item_ID in the Inventory table. You cannot create an auction without first having the item in inventory.

2. **ITI is Optional**: An auction can exist without being linked to a specific ITI (ITI_ID can be null).

3. **Automatic Timestamps**: The Last_Updated field is automatically set to the current timestamp on create and update.

4. **Bid Count**: Starts at 0 by default and can be incremented using the bid endpoint.

5. **Foreign Key Constraints**: Deleting an item from Inventory or an ITI will fail if there are auctions referencing them. Delete the auctions first.
