# Machine Status Monitoring Service

## Overview

This is an **external background service** that continuously monitors the database for machines with `ALERT` or `CRITICAL` status. It runs independently of the main Express server and checks the database every 2 minutes.

## Flow Diagram

```
┌─────────────────┐
│  Monitor Service│
│  (Every 2 min)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check DB for   │
│  ALERT/CRITICAL │
│  machines       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  For each       │
│  machine:       │
└────────┬────────┘
         │
         ├──► Increment Machine.faults + 1
         │
         ├──► POST Maintenance Log
         │    (Create via maintenance algorithm)
         │
         ├──► Send Email to ATO & TO
         │    (Assistant Training Officer & Training Officer)
         │
         └──► Dashboard Notifications
             (Available via GET /api/notifications/latest)
```

## Features

1. **Automatic Database Monitoring**: Checks every 2 minutes for machines with `ALERT` or `CRITICAL` status
2. **Fault Tracking**: Automatically increments the `Faults` count for affected machines
3. **Maintenance Log Creation**: Creates maintenance logs automatically when alerts are detected
4. **Email Notifications**: Sends email alerts to ATO (Assistant Training Officer) and TO (Training Officer) workers
5. **Dashboard Integration**: Notifications are automatically available in dashboards via the existing `/api/notifications/latest` endpoint

## Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure Email Service** (Optional but recommended):

   Add these environment variables to your `.env` file:

   ```env
   # Email Configuration (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@predictalab.com
   ```

   **Note**: If email is not configured, the service will still work but skip email notifications.

## Usage

### Start the Monitoring Service

```bash
npm run monitor
```

Or directly:

```bash
node src/services/monitor-scheduler.js
```

### Running as a Background Service

#### On Linux/Mac (using PM2):

```bash
# Install PM2 globally
npm install -g pm2

# Start monitoring service
pm2 start src/services/monitor-scheduler.js --name "machine-monitor"

# View logs
pm2 logs machine-monitor

# Stop service
pm2 stop machine-monitor
```

#### On Windows (using Task Scheduler or as a service):

You can create a batch file or use a process manager like `node-windows` or `pm2-windows-service`.

### Running Alongside Main Server

The monitoring service runs **independently** of your main Express server. You can:

1. **Run in separate terminal**:

   ```bash
   # Terminal 1: Main server
   npm start

   # Terminal 2: Monitoring service
   npm run monitor
   ```

2. **Run both with PM2**:
   ```bash
   pm2 start src/server.js --name "api-server"
   pm2 start src/services/monitor-scheduler.js --name "machine-monitor"
   ```

## How It Works

### 1. Database Check

Every 2 minutes, the service queries the database for machines where:

- `Status = 'ALERT'` OR
- `Status = 'CRITICAL'`

### 2. For Each Alert Machine:

#### Step 1: Increment Faults

```javascript
Machine.faults = Machine.faults + 1;
```

#### Step 2: Create Maintenance Log

Creates a new entry in `Maintenance_Log` table with:

- `Issue_Reported`: Description of the alert
- `Severity`: "High" for CRITICAL, "Medium" for ALERT
- `Status`: "Pending"
- `Action_Taken`: "Automated alert generated - Pending review"
- Automatically assigns available maintenance workers and ITI workers

#### Step 3: Send Email Notifications

Sends email to all active ATO and TO workers for that ITI with:

- Machine details
- Alert type (ALERT/CRITICAL)
- ITI information
- Action required message

#### Step 4: Dashboard Notifications

The maintenance log is automatically available via:

- `GET /api/notifications/latest` - Returns latest 5 maintenance logs
- Dashboards (ATO, TO, Maintenance) can fetch these notifications

## Configuration

### Check Interval

Default: **2 minutes** (120,000 milliseconds)

To change the interval, edit `CHECK_INTERVAL` in `src/services/monitor-scheduler.js`:

```javascript
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

### Email Service

The email service uses Nodemailer. Configure SMTP settings in `.env`:

- **Gmail**: Use App Password (not regular password)
- **Other providers**: Check their SMTP settings

## Logs

The service logs all activities:

- ✅ Successful operations
- ⚠️ Warnings (e.g., no workers found)
- ❌ Errors

Example output:

```
🚀 Machine Status Monitoring Service Started
⏰ Checking database every 2 minutes
📊 Monitoring for machines with ALERT or CRITICAL status

============================================================
🔄 Starting monitoring cycle at 12/15/2024, 10:30:00 AM
============================================================
🔍 Found 2 machine(s) with ALERT/CRITICAL status

📋 Processing alert for Machine ID: 1 (Lathe Machine)
  ✅ Incremented faults count to 3
  ✅ Created maintenance log ID: 45
  ✅ Sent email notifications to 2 recipient(s)
============================================================
✅ Monitoring cycle completed in 1.23s
   Processed: 2 machine(s)
   Next check in 2 minutes...
============================================================
```

## Troubleshooting

### Email Not Sending

- Check SMTP credentials in `.env`
- Verify email service test on startup
- Check firewall/network settings
- For Gmail, ensure "Less secure app access" is enabled or use App Password

### Service Not Running

- Check database connection
- Verify `.env` file has correct `DATABASE_URL`
- Check console for error messages

### No Machines Detected

- Verify machines exist in database with `ALERT` or `CRITICAL` status
- Check Prisma connection
- Review database logs

## Integration with Existing System

The monitoring service integrates seamlessly:

1. **Maintenance Logs**: Uses existing `Maintenance_Log` table and repository
2. **Notifications**: Uses existing `/api/notifications/latest` endpoint
3. **Workers**: Fetches ATO/TO workers from existing `ITI_Workers` table
4. **Machines**: Uses existing `Machines` table and Prisma schema

## Stopping the Service

Press `Ctrl+C` to stop gracefully, or use:

```bash
pm2 stop machine-monitor  # if using PM2
```

## Next Steps

1. Install dependencies: `npm install`
2. Configure email (optional): Add SMTP settings to `.env`
3. Start monitoring: `npm run monitor`
4. Monitor logs for activity

The service will automatically handle all alert processing according to your flowchart!
