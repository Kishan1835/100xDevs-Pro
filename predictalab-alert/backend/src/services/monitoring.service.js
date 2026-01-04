const prisma = require('../config/db');
const { MachineStatus } = require('@prisma/client');
const emailService = require('./email.service');

/**
 * Machine Monitoring Service
 * Checks for machines with ALERT or CRITICAL status and processes them
 */
class MonitoringService {
    /**
     * Check database for machines with ALERT or CRITICAL status
     * @returns {Promise<Array>} Array of machines that need attention
     */
    async checkMachineStatus() {
        try {
            const alertMachines = await prisma.machines.findMany({
                where: {
                    Status: {
                        in: [MachineStatus.ALERT, MachineStatus.CRITICAL]
                    }
                },
                include: {
                    iti: {
                        select: {
                            ITI_ID: true,
                            Name: true,
                            City: true,
                            State: true,
                            Address: true
                        }
                    }
                }
            });

            console.log(`🔍 Found ${alertMachines.length} machine(s) with ALERT/CRITICAL status`);
            return alertMachines;
        } catch (error) {
            console.error('❌ Error checking machine status:', error);
            throw error;
        }
    }

    /**
     * Process a single machine alert
     * 1. Increment faults count
     * 2. Create maintenance log
     * 3. Send email notifications
     * 4. Notifications are automatically available via GET /api/notifications/latest
     */
    async processMachineAlert(machine) {
        try {
            console.log(`\n📋 Processing alert for Machine ID: ${machine.Machine_ID} (${machine.Machine_Name})`);

            // Step 1: Increment faults count
            const updatedMachine = await prisma.machines.update({
                where: { Machine_ID: machine.Machine_ID },
                data: {
                    Faults: {
                        increment: 1
                    }
                },
                include: {
                    iti: true
                }
            });

            console.log(`  ✅ Incremented faults count to ${updatedMachine.Faults}`);

            // Step 2: Get workers for this ITI (ATO and TO)
            const itiWorkers = await prisma.iTI_Workers.findMany({
                where: {
                    ITI_ID: machine.ITI_ID,
                    Active_Status: true,
                    Role: {
                        in: ['ASSISTANT_TRAINING_OFFICER', 'TRAINING_OFFICER']
                    }
                }
            });

            // Step 3: Get maintenance worker for this ITI
            const maintenanceWorker = await prisma.maintenance_Workers.findFirst({
                where: {
                    ITI_ID: machine.ITI_ID,
                    Active_Status: true
                }
            });

            if (!maintenanceWorker) {
                console.warn(`  ⚠️  No active maintenance worker found for ITI ${machine.ITI_ID}`);
            }

            // Step 4: Create maintenance log (POST Maintenance log by running maintenance algorithm)
            const severity = machine.Status === MachineStatus.CRITICAL ? 'High' : 'Medium';
            const issueReported = machine.Status === MachineStatus.CRITICAL
                ? `CRITICAL: Machine ${machine.Machine_Name} requires immediate attention`
                : `ALERT: Machine ${machine.Machine_Name} needs maintenance review`;

            const maintenanceLog = await prisma.maintenance_Log.create({
                data: {
                    ITI_ID: machine.ITI_ID,
                    Machine_ID: machine.Machine_ID,
                    M_Worker_ID: maintenanceWorker?.M_Worker_ID || 1, // Fallback if no worker found
                    Worker_ID: itiWorkers[0]?.Worker_ID || 1, // Use first ATO/TO or fallback
                    Issue_Reported: issueReported,
                    Action_Taken: 'Automated alert generated - Pending review',
                    Severity: severity,
                    Status: 'Pending',
                    Report_Date: new Date(),
                    Next_Service_Date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                },
                include: {
                    machine: true,
                    iti: true
                }
            });

            console.log(`  ✅ Created maintenance log ID: ${maintenanceLog.ML_ID}`);

            // Step 5: Send email to ATO and TO
            if (itiWorkers.length > 0) {
                const emailResult = await emailService.sendAlertEmail(
                    updatedMachine,
                    itiWorkers,
                    machine.Status
                );

                if (emailResult.success) {
                    console.log(`  ✅ Sent email notifications to ${emailResult.sent} recipient(s)`);
                } else {
                    console.warn(`  ⚠️  Email sending failed: ${emailResult.error}`);
                }
            } else {
                console.warn(`  ⚠️  No ATO/TO workers found for ITI ${machine.ITI_ID} - skipping email`);
            }

            // Step 6: Dashboard notifications are automatically available
            // The GET /api/notifications/latest endpoint fetches from Maintenance_Log
            // So the notification is already created and available

            return {
                success: true,
                machineId: machine.Machine_ID,
                faultsCount: updatedMachine.Faults,
                maintenanceLogId: maintenanceLog.ML_ID,
                emailsSent: itiWorkers.length
            };
        } catch (error) {
            console.error(`❌ Error processing alert for machine ${machine.Machine_ID}:`, error);
            throw error;
        }
    }

    /**
     * Process all machines with alerts
     */
    async processAllAlerts() {
        try {
            const alertMachines = await this.checkMachineStatus();

            if (alertMachines.length === 0) {
                console.log('✅ No machines with ALERT/CRITICAL status found');
                return { processed: 0, results: [] };
            }

            const results = [];
            for (const machine of alertMachines) {
                try {
                    const result = await this.processMachineAlert(machine);
                    results.push(result);
                } catch (error) {
                    console.error(`Failed to process machine ${machine.Machine_ID}:`, error);
                    results.push({
                        success: false,
                        machineId: machine.Machine_ID,
                        error: error.message
                    });
                }
            }

            return {
                processed: results.length,
                results: results
            };
        } catch (error) {
            console.error('❌ Error in processAllAlerts:', error);
            throw error;
        }
    }
}

module.exports = new MonitoringService();

