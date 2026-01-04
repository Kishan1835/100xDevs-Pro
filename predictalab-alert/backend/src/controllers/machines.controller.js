const machinesRepo = require('../repositories/machines.repository');
const prisma = require('../config/db');
const { success, error } = require('../utils/response');

exports.getAllMachines = async (req, res, next) => {
  try {
    const machines = await machinesRepo.getAll();
    success(res, machines);
  } catch (err) {
    next(err);
  }
};

exports.getMachinesByITI = async (req, res, next) => {
  try {
    const machines = await machinesRepo.getByITI(parseInt(req.params.itiId));
    success(res, machines);
  } catch (err) {
    next(err);
  }
};

exports.getMachineStats = async (req, res, next) => {
  try {
    const stats = await machinesRepo.getMachineStats();
    success(res, stats);
  } catch (err) {
    next(err);
  }
};

exports.scheduleAllMachinesForITI = async (req, res, next) => {
  try {
    const itiId = parseInt(req.params.itiId);
    
    // 1. Find Assistant Training Officer
    const worker = await prisma.iTI_Workers.findFirst({
      where: { ITI_ID: itiId, Role: 'ASSISTANT_TRAINING_OFFICER' }
    });
    
    if (!worker) return error(res, 'No Assistant Training Officer found', 404);

    // 2. Get students
    const students = await prisma.students.findMany({ where: { ITI_ID: itiId } });
    
    // 3. Get healthy/alert machines (your new repo method)
    const machines = await machinesRepo.findForScheduling(itiId);
    
    if (machines.length === 0) {
      return success(res, { count: 0 }, 200, 'No healthy machines available');
    }

    // 4. Create schedule logs (1 machine per student, up to available machines)
    const logs = [];
    const machineIds = [];
    
    for (let i = 0; i < Math.min(students.length, machines.length); i++) {
      logs.push({
        ITI_ID: itiId,
        Machine_ID: machines[i].Machine_ID,
        Worker_ID: worker.Worker_ID,
        Student_ID: students[i].Student_ID,
        Time: 2,
        Scheduled_On: new Date()
      });
      machineIds.push(machines[i].Machine_ID);
    }

    // 5. Bulk create schedules + update Last_used
    const schedules = await prisma.schedule_Logs.createMany({ data: logs });
    await machinesRepo.updateLastUsedBulk(machineIds);

    success(res, { 
      count: logs.length, 
      scheduledMachines: machineIds,
      totalStudents: students.length,
      availableMachines: machines.length 
    }, 201);
  } catch (err) {
    next(err);
  }
};

// ====== NEW ENDPOINTS FOR MACHINE DETAILS PAGE ======

/**
 * GET /api/machines/:machineId/details
 */
exports.getMachineDetails = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const machineDetails = await machinesRepo.getMachineById(machineId);

    if (!machineDetails) {
      return error(res, "Machine not found", 404);
    }

    success(res, machineDetails);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/machines/:machineId/maintenance-history
 */
exports.getMaintenanceHistory = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const limit = parseInt(req.query.limit) || 3;
    const history = await machinesRepo.getMaintenanceHistory(machineId, limit);
    success(res, history);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/machines/:machineId/sensor-latest
 */
exports.getLatestSensorData = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    
    // Try to get from Firebase if configured
    try {
      const { ref, onValue } = require('firebase/database');
      const { database } = require('../config/firebase');

      return new Promise((resolve, reject) => {
        const predictionsRef = ref(database, `predictions/${machineId}/latest`);

        onValue(predictionsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const sensorData = [
              { sensorName: "Temperature", valueAtFault: `${parseFloat(data.temperature).toFixed(2)}°C` },
              { sensorName: "Vibration", valueAtFault: `${parseFloat(data.vibration).toFixed(2)} mm/s` },
              { sensorName: "Current", valueAtFault: `${parseFloat(data.current).toFixed(2)} A` },
            ];
            resolve(success(res, sensorData));
          } else {
            resolve(success(res, []));
          }
        }, (err) => reject(err));
      });
    } catch (firebaseError) {
      console.warn("Firebase not configured, returning empty sensor data");
      success(res, []);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/machines/:machineId/update-status
 */
exports.updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const { newStatus, reason } = req.body;

    const validStatuses = ["Pending", "In Progress", "Closed", "On Hold", "False Alert"];
    if (!validStatuses.includes(newStatus)) {
      return error(res, "Invalid status value", 400);
    }

    if (newStatus === "On Hold" && !reason) {
      return error(res, "Reason is required for On Hold status", 400);
    }

    const updatedLog = await machinesRepo.updateMaintenanceStatus(machineId, newStatus, reason);
    success(res, updatedLog, 200, "Status updated successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/machines/:machineId/false-alert
 */
exports.markFalseAlert = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const result = await machinesRepo.markFalseAlert(machineId);
    success(res, result, 200, "Alert marked as false successfully");
  } catch (err) {
    next(err);
  }
};
