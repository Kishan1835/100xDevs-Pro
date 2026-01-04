const prisma = require('../config/db');

const includeRelations = {
  iti: {
    select: { ITI_ID: true, Name: true }
  },
  machine: {
    select: { Machine_ID: true, Machine_Name: true }
  },
  worker: {
    select: { Worker_ID: true, Name: true }
  },
  student: {
    select: { Student_ID: true, Name: true }
  }
};

module.exports = {
  getAll: () => prisma.schedule_Logs.findMany({
    include: includeRelations,
    orderBy: { S_Log_ID: 'asc' }
  }),

  getByITI: (itiId) => prisma.schedule_Logs.findMany({
    where: { ITI_ID: itiId },
    include: includeRelations,
    orderBy: { S_Log_ID: 'asc' }
  }),

  create: (data) => prisma.schedule_Logs.create({
    data: {
      ITI_ID: parseInt(data.ITI_ID),
      Machine_ID: parseInt(data.Machine_ID),
      Worker_ID: parseInt(data.Worker_ID),
      Student_ID: parseInt(data.Student_ID),
      Time: parseInt(data.Time),
      Scheduled_On: new Date(data.Scheduled_On),
      Completed_At: data.Completed_At ? new Date(data.Completed_At) : null
    },
    include: includeRelations
  }),

  update: (id, data) => prisma.schedule_Logs.update({
    where: { S_Log_ID: id },
    data: {
      Time: data.Time ? parseInt(data.Time) : undefined,
      Scheduled_On: data.Scheduled_On ? new Date(data.Scheduled_On) : undefined,
      Completed_At: data.Completed_At ? new Date(data.Completed_At) : undefined
    },
    include: includeRelations
  }),

  remove: (id) => prisma.schedule_Logs.delete({
    where: { S_Log_ID: id },
    include: includeRelations
  }),

  /**
   * Schedule machines to students for a given ITI
   * @param {number} itiId - The ITI ID
   * @param {number} workerId - Optional worker ID to assign
   * @param {number} timeAllocation - Time allocated for each schedule (in minutes)
   * @returns {Promise<Array>} Array of scheduled assignments with machine and student details
   */
  scheduleMachines: async (itiId, workerId = null, timeAllocation = 60) => {
    try {
      // Step 1: Fetch all machines and students for the given ITI
      const [machines, students] = await Promise.all([
        prisma.machines.findMany({
          where: { ITI_ID: itiId },
          orderBy: { Last_used: 'asc' } // Sort by LastUsed in ascending order
        }),
        prisma.students.findMany({
          where: { ITI_ID: itiId }
        })
      ]);

      // Validate that we have both machines and students
      if (machines.length === 0) {
        throw new Error(`No machines found for ITI_ID: ${itiId}`);
      }
      if (students.length === 0) {
        throw new Error(`No students found for ITI_ID: ${itiId}`);
      }

      // Step 2: Filter out CRITICAL machines
      const availableMachines = machines.filter(
        machine => machine.Status !== 'CRITICAL'
      );

      if (availableMachines.length === 0) {
        throw new Error(`No available machines (all are CRITICAL) for ITI_ID: ${itiId}`);
      }

      const scheduledAssignments = [];
      const currentTimestamp = new Date();

      // Step 3: Assign each student to a machine cyclically
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const machine = availableMachines[i % availableMachines.length]; // Cycle through machines

        // Step 4: Create schedule log entry
        const scheduleLog = await prisma.schedule_Logs.create({
          data: {
            ITI_ID: itiId,
            Machine_ID: machine.Machine_ID,
            Worker_ID: workerId || student.Worker_ID, // Use provided worker or student's assigned teacher
            Student_ID: student.Student_ID,
            Time: timeAllocation,
            Scheduled_On: currentTimestamp
          },
          include: {
            machine: {
              select: { Machine_ID: true, Machine_Name: true }
            },
            student: {
              select: { Student_ID: true, Name: true }
            }
          }
        });

        // Step 5: Update machine's Last_used date
        await prisma.machines.update({
          where: { Machine_ID: machine.Machine_ID },
          data: { Last_used: currentTimestamp }
        });

        // Step 6: Prepare return data
        scheduledAssignments.push({
          Machine_ID: scheduleLog.Machine_ID,
          MachineName: scheduleLog.machine.Machine_Name,
          Student_ID: scheduleLog.Student_ID,
          StudentName: scheduleLog.student.Name,
          Scheduled_On: scheduleLog.Scheduled_On,
          Time: scheduleLog.Time,
          S_Log_ID: scheduleLog.S_Log_ID
        });
      }

      return scheduledAssignments;
    } catch (error) {
      console.error('Error in scheduleMachines:', error);
      throw error;
    }
  }
};