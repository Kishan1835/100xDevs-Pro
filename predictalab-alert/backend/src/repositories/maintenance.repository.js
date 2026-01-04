const prisma = require('../config/db');

exports.getAllLogs = () => prisma.maintenance_Log.findMany({
  include: { iti: true, machine: true, maintenanceWorker: true, worker: true }
});

exports.getAllWorkers = () => prisma.maintenance_Workers.findMany({
  include: { iti: true }
});

exports.getByITI = (itiId) => prisma.maintenance_Log.findMany({
  where: { ITI_ID: itiId },
  include: { machine: true, maintenanceWorker: true }
});

// Get machine statistics (total, healthy, alert, critical)
exports.getMachineStats = async () => {
  const machines = await prisma.machines.findMany({
    select: {
      Status: true
    }
  });

  const totalMachines = machines.length;
  const healthy = machines.filter(m => m.Status === 'HEALTHY').length;
  const alert = machines.filter(m => m.Status === 'ALERT').length;
  const critical = machines.filter(m => m.Status === 'CRITICAL').length;

  return {
    totalMachines,
    healthy,
    alert,
    critical
  };
};

// Get maintenance statistics for TO dashboard
exports.getMaintenanceStatistics = async () => {
  // Count active machines (HEALTHY status)
  const activeMachines = await prisma.machines.count({
    where: { Status: 'HEALTHY' }
  });

  // Count machines under maintenance (In Progress status)
  const underMaintenance = await prisma.maintenance_Log.count({
    where: { Status: 'In Progress' }
  });

  // Count upcoming maintenance (Pending status)
  const upcomingMaintenance = await prisma.maintenance_Log.count({
    where: { Status: 'Pending' }
  });

  return {
    activeMachines,
    underMaintenance,
    upcomingMaintenance
  };
};

// Get maintenance logs with details (joined with machines and workers)
exports.getMaintenanceLogsWithDetails = async (limit = null) => {
  const queryOptions = {
    include: {
      machine: {
        select: {
          Machine_ID: true,
          Machine_Name: true
        }
      },
      maintenanceWorker: {
        select: {
          M_Worker_ID: true,
          Name: true,
          Contact: true
        }
      },
      iti: {
        select: {
          ITI_ID: true,
          Name: true
        }
      }
    },
    orderBy: {
      Report_Date: 'desc'
    }
  };

  // Add limit if specified
  if (limit) {
    queryOptions.take = parseInt(limit);
  }

  const logs = await prisma.maintenance_Log.findMany(queryOptions);

  // Calculate days since report for each log
  const currentDate = new Date();
  const logsWithDays = logs.map(log => {
    const reportDate = new Date(log.Report_Date);
    const daysSinceReport = Math.floor((currentDate - reportDate) / (1000 * 60 * 60 * 24));

    return {
      logId: log.ML_ID,
      machineId: log.machine.Machine_ID,
      machineName: log.machine.Machine_Name,
      workerId: log.maintenanceWorker.M_Worker_ID,
      workerName: log.maintenanceWorker.Name,
      workerContact: log.maintenanceWorker.Contact,
      itiId: log.iti.ITI_ID,
      itiName: log.iti.Name,
      requestType: log.Issue_Reported,
      description: log.Issue_Reported,
      actionTaken: log.Action_Taken,
      reportDate: log.Report_Date,
      daysSinceReport,
      status: log.Status,
      severity: log.Severity
    };
  });

  return logsWithDays;
};

// Reopen a closed maintenance case
exports.reopenMaintenanceCase = async (logId) => {
  const updatedLog = await prisma.maintenance_Log.update({
    where: { ML_ID: parseInt(logId) },
    data: {
      Status: 'Reopened',
      Updated_At: new Date()
    },
    include: {
      machine: {
        select: {
          Machine_ID: true,
          Machine_Name: true
        }
      },
      maintenanceWorker: {
        select: {
          M_Worker_ID: true,
          Name: true,
          Contact: true
        }
      },
      iti: {
        select: {
          ITI_ID: true,
          Name: true
        }
      }
    }
  });

  // Calculate days since report for the reopened log
  const currentDate = new Date();
  const reportDate = new Date(updatedLog.Report_Date);
  const daysSinceReport = Math.floor((currentDate - reportDate) / (1000 * 60 * 60 * 24));

  return {
    logId: updatedLog.ML_ID,
    machineId: updatedLog.machine.Machine_ID,
    machineName: updatedLog.machine.Machine_Name,
    workerId: updatedLog.maintenanceWorker.M_Worker_ID,
    workerName: updatedLog.maintenanceWorker.Name,
    workerContact: updatedLog.maintenanceWorker.Contact,
    itiId: updatedLog.iti.ITI_ID,
    itiName: updatedLog.iti.Name,
    requestType: updatedLog.Issue_Reported,
    description: updatedLog.Issue_Reported,
    actionTaken: updatedLog.Action_Taken,
    reportDate: updatedLog.Report_Date,
    daysSinceReport,
    status: updatedLog.Status,
    severity: updatedLog.Severity
  };
};

// Get dashboard statistics
// Sample response:
// {
//   healthyMachines: 152,
//   alertMachines: 9,
//   criticalMachines: 3,
//   pendingLogs: 6
// }
exports.getMaintenanceDashboardStats = async (itiId = null) => {
  const machineWhere = itiId ? { ITI_ID: parseInt(itiId) } : {};
  const logWhere = itiId ? { ITI_ID: parseInt(itiId) } : {};

  const [healthyMachines, alertMachines, criticalMachines, pendingLogs] = await Promise.all([
    prisma.machines.count({
      where: { ...machineWhere, Status: 'HEALTHY' }
    }),
    prisma.machines.count({
      where: { ...machineWhere, Status: 'ALERT' }
    }),
    prisma.machines.count({
      where: { ...machineWhere, Status: 'CRITICAL' }
    }),
    prisma.maintenance_Log.count({
      where: { ...logWhere, Status: 'Pending' }
    })
  ]);

  return {
    healthyMachines,
    alertMachines,
    criticalMachines,
    pendingLogs
  };
};

// Get filtered maintenance logs with pagination
// Sample response:
// [
//   {
//     mlId: 1,
//     reportDate: "2024-04-14T10:30:00.000Z",
//     daysSinceReport: 5,
//     status: "Pending",
//     issueReported: "Abnormal noise detected",
//     machineId: 1003,
//     machineName: "Lathe Machine",
//     workerId: 5,
//     workerName: "John Smith",
//     itiId: 1,
//     itiName: "Government ITI Mumbai",
//     priority: "High"
//   }
// ]
exports.getFilteredMaintenanceLogs = async (filters = {}) => {
  const {
    status,
    priority,
    startDate,
    endDate,
    itiId,
    limit = 10,
    offset = 0
  } = filters;

  // Build where clause
  const where = {};
  
  if (status && status !== 'All') {
    where.Status = status;
  }
  
  if (priority && priority !== 'All') {
    where.Severity = priority;
  }
  
  if (itiId) {
    where.ITI_ID = parseInt(itiId);
  }
  
  if (startDate || endDate) {
    where.Report_Date = {};
    if (startDate) {
      where.Report_Date.gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of day
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      where.Report_Date.lte = endDateTime;
    }
  }

  const logs = await prisma.maintenance_Log.findMany({
    where,
    include: {
      machine: {
        select: {
          Machine_ID: true,
          Machine_Name: true,
          Model_No: true
        }
      },
      maintenanceWorker: {
        select: {
          M_Worker_ID: true,
          Name: true
        }
      },
      iti: {
        select: {
          ITI_ID: true,
          Name: true
        }
      }
    },
    orderBy: {
      Report_Date: 'desc'
    },
    skip: parseInt(offset),
    take: parseInt(limit)
  });

  // Calculate days since report for each log
  const currentDate = new Date();
  const logsWithDays = logs.map(log => {
    const reportDate = new Date(log.Report_Date);
    const daysSinceReport = Math.floor((currentDate - reportDate) / (1000 * 60 * 60 * 24));

    return {
      mlId: log.ML_ID,
      reportDate: log.Report_Date,
      daysSinceReport,
      status: log.Status,
      issueReported: log.Issue_Reported,
      machineId: log.machine.Machine_ID,
      machineName: log.machine.Machine_Name,
      machineCode: log.machine.Model_No,
      workerId: log.maintenanceWorker.M_Worker_ID,
      workerName: log.maintenanceWorker.Name,
      itiId: log.iti.ITI_ID,
      itiName: log.iti.Name,
      priority: log.Severity
    };
  });

  return logsWithDays;
};
