# Schedule Machines API Documentation

## Endpoint
```
POST /api/schedules/schedule-machines
```

## Description
Automatically assigns students to machines within the same ITI, ensuring fair distribution and prioritizing under-utilized machines.

## Request Body
```json
{
  "itiId": 1,           // Required: ITI ID
  "workerId": 5,        // Optional: Worker ID (defaults to student's assigned teacher)
  "timeAllocation": 60  // Optional: Time in minutes (default: 60)
}
```

## Algorithm Flow

### 1. Fetch Data
- Retrieves all machines for the specified ITI
- Retrieves all students for the specified ITI
- Both are filtered by `ITI_ID` to ensure they belong to the same ITI

### 2. Sort Machines
- Machines are sorted by `Last_used` date in **ascending order**
- This ensures under-utilized machines get assigned first

### 3. Filter Machines
- Machines with `Status = 'CRITICAL'` are excluded
- Only `HEALTHY` and `ALERT` machines are available for assignment

### 4. Assign Students to Machines
- Students are assigned cyclically to available machines
- Example with 10 students and 3 machines:
  - Student 0 → Machine 0
  - Student 1 → Machine 1
  - Student 2 → Machine 2
  - Student 3 → Machine 0 (cycles back)
  - Student 4 → Machine 1
  - etc.

### 5. Create Schedule Logs
For each assignment:
- Inserts a row into `Schedule_Logs` table with:
  - `S_Log_ID`: Auto-generated
  - `ITI_ID`: The ITI ID
  - `Machine_ID`: Assigned machine
  - `Worker_ID`: Provided worker or student's teacher
  - `Student_ID`: The student
  - `Time`: Allocated time in minutes
  - `Scheduled_On`: Current timestamp

### 6. Update Machines
- Updates each assigned machine's `Last_used` field to current timestamp
- Ensures next scheduling prioritizes other machines

### 7. Return Results
Returns joined data with:
- Machine ID and Name
- Student ID and Name
- Schedule details

## Response Format

### Success (201 Created)
```json
{
  "success": true,
  "data": {
    "message": "Successfully scheduled 10 students to machines",
    "count": 10,
    "assignments": [
      {
        "Machine_ID": 1,
        "MachineName": "CNC Lathe Machine",
        "Student_ID": 5,
        "StudentName": "John Doe",
        "Scheduled_On": "2025-12-02T10:30:00.000Z",
        "Time": 60,
        "S_Log_ID": 45
      },
      // ... more assignments
    ]
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "ITI_ID is required"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "No machines found for ITI_ID: 1"
}
```

```json
{
  "success": false,
  "message": "No students found for ITI_ID: 1"
}
```

```json
{
  "success": false,
  "message": "No available machines (all are CRITICAL) for ITI_ID: 1"
}
```

## Example Usage

### Using Fetch (JavaScript)
```javascript
const response = await fetch('http://localhost:5000/api/schedules/schedule-machines', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itiId: 1,
    workerId: 5,
    timeAllocation: 90
  })
});

const result = await response.json();
console.log(result.data.assignments);
```

### Using Axios (JavaScript)
```javascript
import axios from 'axios';

const result = await axios.post('http://localhost:5000/api/schedules/schedule-machines', {
  itiId: 1,
  workerId: 5,
  timeAllocation: 90
});

console.log(result.data.data.assignments);
```

### Using cURL
```bash
curl -X POST http://localhost:5000/api/schedules/schedule-machines \
  -H "Content-Type: application/json" \
  -d '{"itiId": 1, "workerId": 5, "timeAllocation": 90}'
```

## Database Schema Reference

### Schedule_Logs Table
```prisma
model Schedule_Logs {
  S_Log_ID     Int      @id @default(autoincrement())
  ITI_ID       Int
  Machine_ID   Int
  Worker_ID    Int
  Student_ID   Int
  Time         Int
  Scheduled_On DateTime
  Completed_At DateTime?
  
  iti     ITI        @relation(fields: [ITI_ID], references: [ITI_ID])
  machine Machines   @relation(fields: [Machine_ID], references: [Machine_ID])
  worker  ITI_Workers @relation(fields: [Worker_ID], references: [Worker_ID])
  student Students   @relation(fields: [Student_ID], references: [Student_ID])
}
```

### Machines Table (Relevant Fields)
```prisma
model Machines {
  Machine_ID   Int           @id @default(autoincrement())
  ITI_ID       Int
  Machine_Name String
  Status       MachineStatus  // HEALTHY, ALERT, CRITICAL
  Last_used    DateTime
  // ... other fields
}
```

### Students Table (Relevant Fields)
```prisma
model Students {
  Student_ID Int    @id @default(autoincrement())
  ITI_ID     Int
  Worker_ID  Int    // Assigned teacher
  Name       String
  // ... other fields
}
```

## Implementation Details

### Technology Stack
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Runtime**: Node.js (async/await)

### Error Handling
- All database operations are wrapped in try-catch
- Validation for required fields
- Meaningful error messages
- Proper HTTP status codes

### Performance Considerations
- Uses `Promise.all()` for parallel fetching of machines and students
- Batch operations minimize database round-trips
- Indexed foreign keys for efficient queries

## Testing
Run the test script:
```bash
# Start the server first
cd backend
node src/server.js

# In another terminal
node test-schedule-machines.js
```
