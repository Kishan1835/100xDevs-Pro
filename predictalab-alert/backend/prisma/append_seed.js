// prisma/append_seed.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function makeNames(prefix, count) {
  return Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`);
}

async function main() {
  console.log("→ Append seed started");

  const ITI_ID = 1;            // same ITI as your existing data
  const scheduleWorkers = [2, 3]; // ONLY these worker IDs for scheduling

  // 1) Prepare machine names
  const lathes = makeNames("Lathe Machine (Extra)", 15);
  const printers = makeNames("3D Printer (Extra)", 15);
  const cncs = makeNames("CNC Mill (Extra)", 15);

  const allNames = [...lathes, ...printers, ...cncs];

  // 2) Build machine records matching your schema fields (required ones)
  const now = new Date();
  const machineRecords = allNames.map((name, idx) => {
    // choose types more sensibly
    let type = "Training Equipment";
    if (name.startsWith("Lathe")) type = "Lathe";
    if (name.startsWith("3D Printer")) type = "3D Printer";
    if (name.startsWith("CNC Mill")) type = "CNC Mill";

    return {
      ITI_ID,
      Machine_Name: name,
      Type: type,
      Model_No: `MDL-${2000 + idx}`,
      Manufacturer: "TechMakers Ltd",
      Installation_Date: new Date(2021, (idx % 12), 5),
      Last_Service_Date: new Date(2024, ((idx + 2) % 12), 10),
      Warranty_Expiry_Date: new Date(2026, ((idx + 6) % 12), 1),
      Status: idx % 3 === 0 ? "CRITICAL" : idx % 2 === 0 ? "ALERT" : "HEALTHY",
      Last_used: now,
      Faults: Math.floor(Math.random() * 3)
    };
  });

  // 3) Insert machines (createMany)
  console.log(`→ Creating ${machineRecords.length} machine rows...`);
  await prisma.machines.createMany({
    data: machineRecords,
    skipDuplicates: true // in case any name already exists
  });

  // 4) Fetch newly added machines (by the exact names we created)
  console.log("→ Fetching inserted machines...");
  const insertedMachines = await prisma.machines.findMany({
    where: {
      ITI_ID,
      Machine_Name: { in: allNames }
    },
    orderBy: { Machine_ID: "asc" }
  });

  if (!insertedMachines.length) {
    console.warn("⚠️ No machines found after insert. Aborting schedule creation.");
    return;
  }
  console.log(`→ Found ${insertedMachines.length} inserted machines.`);

  // 5) Get students for this ITI to link schedules to students
  const students = await prisma.students.findMany({ where: { ITI_ID } });
  if (!students.length) {
    console.warn("⚠️ No students found for ITI_ID=1. Create students first to generate schedules.");
  }

  // 6) Create schedule records using only Worker_ID 2 and 3
  console.log("→ Creating schedule logs assigned to workers 2 and 3...");
  const schedules = insertedMachines.map((machine, idx) => {
    const workerId = scheduleWorkers[idx % scheduleWorkers.length]; // alternate 2 & 3
    const studentId = students.length ? students[idx % students.length].Student_ID : null;

    return {
      ITI_ID,
      Machine_ID: machine.Machine_ID,
      Worker_ID: workerId,
      Student_ID: studentId ?? 0, // if you must have a Student_ID, change logic; otherwise set to null but schema requires Student_ID Int (not nullable) — adjust if necessary
      Time: ((idx % 4) + 1), // 1..4 hours
      Scheduled_On: new Date(Date.now() + (idx * 3600 * 1000)), // staggered times
      Completed_At: idx % 3 === 0 ? new Date(Date.now() + (idx * 3600 * 1000) + 3600000) : null
    };
  });

  // Note: If Student_ID is non-nullable in your schema (it is), we must ensure studentId exists.
  // If students.length === 0, we will abort to avoid inserting invalid rows.
  if (!students.length) {
    console.log("→ No students available. Skipping schedule insert to avoid FK errors.");
  } else {
    await prisma.schedule_Logs.createMany({
      data: schedules,
      skipDuplicates: true
    });
    console.log(`→ Created ${schedules.length} schedule rows.`);
  }

  console.log("→ Append seed finished.");
}

main()
  .catch((e) => {
    console.error("ERROR in append seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
