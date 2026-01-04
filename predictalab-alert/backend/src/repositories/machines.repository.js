const prisma = require('../config/db');
const { MachineStatus } = require('@prisma/client');

/**
 * Helper function to parse machine ID
 * Handles both integer IDs and string IDs like "MACHINE_001"
 */
const parseMachineId = (machineId) => {
  if (typeof machineId === 'number') return machineId;
  if (typeof machineId === 'string') {
    // Extract number from strings like "MACHINE_001" or just "1"
    const match = machineId.match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  throw new Error(`Invalid machine ID format: ${machineId}`);
};

module.exports = {
  getAll: () => prisma.machines.findMany({ 
    include: { 
      iti: true,
      maintenanceLogs: {
        take: 5,
        orderBy: { Report_Date: 'desc' }
      }
    } 
  }),

  getByITI: (itiId) => prisma.machines.findMany({
    where: { ITI_ID: itiId },
    include: { 
      iti: true,
      maintenanceLogs: {
        take: 5,
        orderBy: { Report_Date: 'desc' }
      }
    },
    orderBy: { Last_used: 'desc' }
  }),

  getMachineStats: async () => {
    const totalMachines = await prisma.machines.count();
    
    const healthyMachines = await prisma.machines.count({
      where: { Status: MachineStatus.HEALTHY }
    });
    
    const criticalMachines = await prisma.machines.count({
      where: { Status: MachineStatus.CRITICAL }
    });
    
    const alertMachines = await prisma.machines.count({
      where: { Status: MachineStatus.ALERT }
    });

    const underMaintenance = await prisma.maintenance_Log.count({
      where: { 
        Status: { in: ['IN_PROGRESS', 'PENDING'] }
      }
    });

    // Calculate status distribution for pie chart
    const statusDistribution = [
      { name: 'Working', value: healthyMachines },
      { name: 'Alert', value: alertMachines },
      { name: 'Critical', value: criticalMachines }
    ];

    return {
      totalMachines,
      healthyMachines,
      criticalMachines,
      alertMachines,
      underMaintenance,
      statusDistribution
    };
  },

  findForScheduling: async (itiId) => {
    return prisma.machines.findMany({
      where: {
        ITI_ID: itiId,
        Status: {
          in: [MachineStatus.HEALTHY, MachineStatus.ALERT],
        },
      },
      orderBy: {
        Last_used: 'asc',  // Least recently used first (good for scheduling)
      },
    });
  },

  // FIXED: Proper bulk update for transaction
  updateLastUsedBulk: async (machineIds) => {
    return prisma.$transaction(
      machineIds.map(id =>
        prisma.machines.update({
          where: { Machine_ID: id },
          data: { Last_used: new Date() }
        })
      )
    );
  },

  /**
   * Get machine details by ID
   */
  getMachineById: async (machineId) => {
    try {
      const numericId = parseMachineId(machineId);
      
      const machine = await prisma.machines.findUnique({
        where: { Machine_ID: numericId },
        include: {
          iti: {
            select: {
              ITI_ID: true,
              Name: true,
              City: true,
              State: true,
            },
          },
        },
      });

      if (!machine) return null;

      return {
        machineId: machine.Machine_ID,
        name: machine.Machine_Name,
        type: machine.Type,
        location: `${machine.iti?.City || 'N/A'}, ${machine.iti?.State || 'N/A'}`,
        healthStatus: machine.Status,
        lastMaintenanceDate: machine.Last_Service_Date,
        criticalEnd: machine.Critical_End,
        status: machine.Status,
        itiId: machine.ITI_ID,
        itiName: machine.iti?.Name || "N/A",
      };
    } catch (error) {
      throw new Error(`Error fetching machine details: ${error.message}`);
    }
  },

  /**
   * Get last N maintenance logs for a machine
   */
  getMaintenanceHistory: async (machineId, limit = 3) => {
    try {
      const numericId = parseMachineId(machineId);
      
      const logs = await prisma.maintenance_Log.findMany({
        where: { Machine_ID: numericId },
        orderBy: { Report_Date: "desc" },
        take: limit,
        include: {
          maintenanceWorker: {
            select: {
              Name: true,
            },
          },
        },
      });

      return logs.map((log) => ({
        logId: log.ML_ID,
        date: log.Report_Date,
        issueReported: log.Issue_Reported,
        status: log.Status,
        workerName: log.maintenanceWorker?.Name || "Unassigned",
        description: log.Action_Taken,
        onHoldReason: log.On_Hold_Reason,
      }));
    } catch (error) {
      throw new Error(`Error fetching maintenance history: ${error.message}`);
    }
  },

  /**
   * Get latest sensor readings from Firebase (placeholder - actual data from Firebase)
   */
  getLatestSensorData: async (machineId) => {
    // This will be populated from Firebase in the controller
    // Returning placeholder structure
    return [];
  },

  /**
   * Update maintenance log status
   */
  updateMaintenanceStatus: async (machineId, newStatus, reason = null) => {
    try {
      const numericId = parseMachineId(machineId);
      
      // Get the latest maintenance log for this machine
      let latestLog = await prisma.maintenance_Log.findFirst({
        where: { Machine_ID: numericId },
        orderBy: { Report_Date: "desc" },
      });

      // If no maintenance log exists, create one
      if (!latestLog) {
        const machine = await prisma.machines.findUnique({
          where: { Machine_ID: numericId },
          include: { iti: true }
        });

        if (!machine) {
          throw new Error("Machine not found");
        }

        // Get first available maintenance worker for this ITI
        const worker = await prisma.maintenance_Workers.findFirst({
          where: { ITI_ID: machine.ITI_ID, Active_Status: true }
        });

        // Get first available ITI worker
        const itiWorker = await prisma.iTI_Workers.findFirst({
          where: { ITI_ID: machine.ITI_ID, Active_Status: true }
        });

        if (!worker || !itiWorker) {
          throw new Error("No active workers found for this ITI");
        }

        // Create initial maintenance log
        latestLog = await prisma.maintenance_Log.create({
          data: {
            ITI_ID: machine.ITI_ID,
            Machine_ID: numericId,
            M_Worker_ID: worker.M_Worker_ID,
            Worker_ID: itiWorker.Worker_ID,
            Issue_Reported: "Predictive maintenance alert",
            Action_Taken: "Pending review",
            Severity: "Medium",
            Status: "Pending",
            Report_Date: new Date(),
            Next_Service_Date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          }
        });
      }

      // Prepare update data
      const updateData = {
        Status: newStatus,
        Updated_At: new Date(),
      };

      // Add on-hold reason if applicable
      if (reason && newStatus === "On Hold") {
        updateData.On_Hold_Reason = reason;
      }

      // Update action taken based on status
      if (newStatus === "In Progress") {
        updateData.Action_Taken = "Maintenance in progress";
      } else if (newStatus === "Closed") {
        updateData.Action_Taken = "Maintenance completed";
      } else if (newStatus === "On Hold") {
        updateData.Action_Taken = `On hold: ${reason}`;
      }

      // Update the maintenance log
      const updatedLog = await prisma.maintenance_Log.update({
        where: { ML_ID: latestLog.ML_ID },
        data: updateData,
      });

      // If status is "Closed", update the machine status
      if (newStatus === "Closed") {
        await prisma.machines.update({
          where: { Machine_ID: numericId },
          data: {
            Status: MachineStatus.HEALTHY,
            Critical_End: new Date(),
          },
        });
      }

      return updatedLog;
    } catch (error) {
      throw new Error(`Error updating maintenance status: ${error.message}`);
    }
  },

  /**
   * Create a new maintenance log
   */
  createMaintenanceLog: async (data) => {
    try {
      return await prisma.maintenance_Log.create({
        data: {
          Machine_ID: data.machineId,
          Issue_Reported: data.issueReported,
          Status: data.status || "Pending",
          Worker_Name: data.workerName,
          Description: data.description,
          Report_Date: new Date(),
          Updated_At: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Error creating maintenance log: ${error.message}`);
    }
  },

  /**
   * Mark alert as false
   */
  markFalseAlert: async (machineId) => {
    try {
      const numericId = parseMachineId(machineId);
      
      let latestLog = await prisma.maintenance_Log.findFirst({
        where: { Machine_ID: numericId },
        orderBy: { Report_Date: "desc" },
      });

      // If no maintenance log exists, create one first
      if (!latestLog) {
        const machine = await prisma.machines.findUnique({
          where: { Machine_ID: numericId },
          include: { iti: true }
        });

        if (!machine) {
          throw new Error("Machine not found");
        }

        const worker = await prisma.maintenance_Workers.findFirst({
          where: { ITI_ID: machine.ITI_ID, Active_Status: true }
        });

        const itiWorker = await prisma.iTI_Workers.findFirst({
          where: { ITI_ID: machine.ITI_ID, Active_Status: true }
        });

        if (!worker || !itiWorker) {
          throw new Error("No active workers found for this ITI");
        }

        latestLog = await prisma.maintenance_Log.create({
          data: {
            ITI_ID: machine.ITI_ID,
            Machine_ID: numericId,
            M_Worker_ID: worker.M_Worker_ID,
            Worker_ID: itiWorker.Worker_ID,
            Issue_Reported: "Predictive maintenance alert",
            Action_Taken: "Marked as false alert",
            Severity: "Low",
            Status: "False Alert",
            Report_Date: new Date(),
            Next_Service_Date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        });
      } else {
        // Update existing log
        latestLog = await prisma.maintenance_Log.update({
          where: { ML_ID: latestLog.ML_ID },
          data: {
            Status: "False Alert",
            Action_Taken: "Marked as false alert",
            Updated_At: new Date(),
          },
        });
      }

      // Update machine status to healthy
      await prisma.machines.update({
        where: { Machine_ID: numericId },
        data: {
          Status: MachineStatus.HEALTHY,
          Critical_End: new Date(),
        },
      });

      return latestLog;
    } catch (error) {
      throw new Error(`Error marking false alert: ${error.message}`);
    }
  }
};
