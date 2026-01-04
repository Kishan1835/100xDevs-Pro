const prisma = require('../config/db');

/**
 * Get complaint statistics for top cards
 * Returns:
 * - raisedCount: All maintenance_logs where status != "closed"
 * - inProgressCount: All maintenance_logs where status in ["in progress", "on hold", "reopened"]
 * - solvedCount: All maintenance_logs where status = "closed"
 */
exports.getComplaintStats = async () => {
  const [raisedCount, inProgressCount, solvedCount] = await Promise.all([
    // Raised = all open issues (status not closed)
    prisma.maintenance_Log.count({
      where: {
        Status: {
          not: 'Closed'
        }
      }
    }),
    
    // In Progress = specific statuses
    prisma.maintenance_Log.count({
      where: {
        Status: {
          in: ['In Progress', 'On Hold', 'Reopened']
        }
      }
    }),
    
    // Solved = closed status
    prisma.maintenance_Log.count({
      where: {
        Status: 'Closed'
      }
    })
  ]);

  return {
    raisedCount,
    inProgressCount,
    solvedCount
  };
};

/**
 * Get branch-level complaint summary for each ITI
 * Returns array of objects with:
 * - itiId
 * - name
 * - raisedCount
 * - inProgressCount
 * - solvedCount
 * - highestSeverity (based on machine status: critical > alert > healthy)
 * - score (ITI_score)
 * - lastUpdated (ITI Updated_At)
 */
exports.getBranchComplaintSummary = async () => {
  // Get all ITIs
  const itis = await prisma.ITI.findMany({
    include: {
      machines: {
        select: {
          Status: true
        }
      },
      maintenanceLogs: {
        select: {
          Status: true
        }
      }
    },
    orderBy: {
      Name: 'asc'
    }
  });

  // Process each ITI to calculate stats
  const branchSummaries = itis.map(iti => {
    // Count maintenance logs by status
    const raisedCount = iti.maintenanceLogs.filter(log => log.Status !== 'Closed').length;
    const inProgressCount = iti.maintenanceLogs.filter(log => 
      ['In Progress', 'On Hold', 'Reopened'].includes(log.Status)
    ).length;
    const solvedCount = iti.maintenanceLogs.filter(log => log.Status === 'Closed').length;

    // Determine highest severity based on machine status
    let highestSeverity = 'Healthy';
    const hasCritical = iti.machines.some(m => m.Status === 'CRITICAL');
    const hasAlert = iti.machines.some(m => m.Status === 'ALERT');

    if (hasCritical) {
      highestSeverity = 'Critical';
    } else if (hasAlert) {
      highestSeverity = 'High';
    } else if (iti.machines.length > 0) {
      highestSeverity = 'Low';
    }

    return {
      itiId: iti.ITI_ID,
      name: iti.Name,
      raisedCount,
      inProgressCount,
      solvedCount,
      highestSeverity,
      score: iti.ITI_score,
      lastUpdated: iti.Updated_At
    };
  });

  return branchSummaries;
};
