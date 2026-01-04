const prisma = require('./src/config/db');

async function test() {
  try {
    console.log('Testing getAllITIs query...');
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
    
    console.log(`Found ${itis.length} ITIs`);
    if (itis.length > 0) {
      console.log('First ITI:', JSON.stringify(itis[0], null, 2));
    }
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
