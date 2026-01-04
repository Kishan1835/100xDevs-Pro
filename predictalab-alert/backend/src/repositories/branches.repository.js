const prisma = require('../config/db');

/**
 * Get all ITIs with their stats for list view
 */
const getAllITIs = async () => {
  const itis = await prisma.iTI.findMany({
    select: {
      ITI_ID: true,
      Name: true,
      Address: true,
      City: true,
      State: true,
      Contact: true,
      ITI_score: true,
      Created_At: true,
      machines: {
        select: {
          Machine_ID: true,
          Status: true
        }
      },
      students: {
        select: {
          Student_ID: true
        }
      },
      workers: {
        select: {
          Worker_ID: true
        }
      },
      maintenanceWorkers: {
        select: {
          M_Worker_ID: true
        }
      }
    }
  });

  // Calculate stats for each ITI
  return itis.map(iti => {
    const totalMachines = iti.machines.length;
    const workingMachines = iti.machines.filter(
      m => m.Status === 'HEALTHY' || m.Status === 'ALERT'
    ).length;
    const totalStudents = iti.students.length;
    const workforceCount = iti.workers.length + iti.maintenanceWorkers.length;

    return {
      itiId: iti.ITI_ID,
      name: iti.Name,
      address: iti.Address,
      city: iti.City,
      state: iti.State,
      contact: iti.Contact,
      iti_score: iti.ITI_score || 0,
      totalMachines,
      workingMachines,
      totalStudents,
      workforceCount,
      createdAt: iti.Created_At
    };
  });
};

/**
 * Get single ITI with detailed stats
 */
const getITIById = async (itiId) => {
  const iti = await prisma.iTI.findUnique({
    where: { ITI_ID: parseInt(itiId) },
    select: {
      ITI_ID: true,
      Name: true,
      Address: true,
      City: true,
      State: true,
      Contact: true,
      ITI_score: true,
      Created_At: true,
      machines: {
        select: {
          Machine_ID: true,
          Status: true
        }
      },
      students: {
        select: {
          Student_ID: true,
          Placed: true
        }
      },
      workers: {
        select: {
          Worker_ID: true
        }
      },
      maintenanceWorkers: {
        select: {
          M_Worker_ID: true
        }
      },
      trades: {
        select: {
          Trade_Name: true
        }
      }
    }
  });

  if (!iti) {
    return null;
  }

  const totalMachines = iti.machines.length;
  const workingMachines = iti.machines.filter(
    m => m.Status === 'HEALTHY' || m.Status === 'ALERT'
  ).length;
  const healthyMachines = iti.machines.filter(m => m.Status === 'HEALTHY').length;
  const alertMachines = iti.machines.filter(m => m.Status === 'ALERT').length;
  const criticalMachines = iti.machines.filter(m => m.Status === 'CRITICAL').length;
  
  const totalStudents = iti.students.length;
  const placedStudents = iti.students.filter(s => s.Placed === true).length;
  const workforceCount = iti.workers.length + iti.maintenanceWorkers.length;
  const itiStaffCount = iti.workers.length;
  const maintenanceWorkersCount = iti.maintenanceWorkers.length;

  return {
    itiId: iti.ITI_ID,
    name: iti.Name,
    address: iti.Address,
    city: iti.City,
    state: iti.State,
    contact: iti.Contact,
    iti_score: iti.ITI_score || 0,
    createdAt: iti.Created_At,
    totalMachines,
    workingMachines,
    healthyMachines,
    alertMachines,
    criticalMachines,
    totalStudents,
    placedStudents,
    workforceCount,
    itiStaffCount,
    maintenanceWorkersCount,
    trades: iti.trades.map(t => t.Trade_Name)
  };
};

/**
 * Get recent activities (maintenance logs) for an ITI
 */
const getRecentActivities = async (itiId, limit = 3) => {
  const activities = await prisma.maintenance_Log.findMany({
    where: {
      ITI_ID: parseInt(itiId)
    },
    select: {
      ML_ID: true,
      Issue_Reported: true,
      Action_Taken: true,
      Status: true,
      Severity: true,
      Created_At: true,
      Report_Date: true
    },
    orderBy: {
      Created_At: 'desc'
    },
    take: limit
  });

  return activities.map(activity => ({
    id: activity.ML_ID,
    issue: activity.Issue_Reported,
    action: activity.Action_Taken,
    status: activity.Status,
    severity: activity.Severity,
    createdAt: activity.Created_At,
    reportDate: activity.Report_Date
  }));
};

/**
 * Get monthly complaint trend data
 */
const getMonthlyComplaintTrend = async (itiId) => {
  const logs = await prisma.maintenance_Log.findMany({
    where: {
      ITI_ID: parseInt(itiId)
    },
    select: {
      Created_At: true
    }
  });

  // Group by month
  const monthCounts = {};
  logs.forEach(log => {
    const date = new Date(log.Created_At);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  // Convert to array and sort
  const trendData = Object.entries(monthCounts)
    .map(([month, count]) => ({
      month,
      count
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months

  return trendData;
};

/**
 * Get report data for PDF generation
 */
const getReportData = async (itiId) => {
  const iti = await getITIById(itiId);
  
  if (!iti) {
    return null;
  }

  const monthlyTrend = await getMonthlyComplaintTrend(itiId);

  return {
    // Institute Profile
    instituteProfile: {
      name: iti.name,
      address: iti.address,
      state: iti.state,
      city: iti.city,
      establishedYear: iti.createdAt ? new Date(iti.createdAt).getFullYear() : 'N/A',
      contact: iti.contact,
      itiScore: iti.iti_score,
      tradesOffered: iti.trades
    },
    // Infrastructure
    infrastructure: {
      totalMachines: iti.totalMachines,
      healthyMachines: iti.healthyMachines
    },
    // Staff & Training
    staffTraining: {
      itiStaffCount: iti.itiStaffCount,
      maintenanceWorkersCount: iti.maintenanceWorkersCount
    },
    // Students
    students: {
      totalStudents: iti.totalStudents,
      placedStudents: iti.placedStudents
    },
    // Additional data for graphs
    machineHealthDistribution: {
      healthy: iti.healthyMachines,
      alert: iti.alertMachines,
      critical: iti.criticalMachines
    },
    monthlyComplaintTrend: monthlyTrend
  };
};

module.exports = {
  getAllITIs,
  getITIById,
  getRecentActivities,
  getMonthlyComplaintTrend,
  getReportData
};
