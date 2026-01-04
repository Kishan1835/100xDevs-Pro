const prisma = require('./src/config/db');

async function testStats() {
  try {
    console.log('Testing Prisma queries...');
    
    const branches = await prisma.iTI.count();
    console.log('Branches:', branches);
    
    const students = await prisma.students.count();
    console.log('Students:', students);
    
    const machines = await prisma.machines.count();
    console.log('Machines:', machines);
    
    const maintenanceWorkers = await prisma.maintenance_Workers.count();
    console.log('Maintenance Workers:', maintenanceWorkers);
    
    const itiStaff = await prisma.iTI_Workers.count();
    console.log('ITI Staff:', itiStaff);
    
    console.log('\n✅ All queries successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testStats();
