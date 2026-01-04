import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Full ITI Seed...");

  // ---------------------------
  // ITI
  // ---------------------------
  const iti = await prisma.iTI.upsert({
    where: { ITI_ID: 1 },
    update: {},
    create: {
      ITI_ID: 1,
      Name: "Central Industrial Training Institute",
      City: "Pune",
      State: "Maharashtra",
      Address: "Sector 14, Hinjewadi",
      Contact: "9876543210",
      Status: "Active",
      ITI_score: 86
    }
  });

  // ---------------------------
  // MACHINES (15 rows)
  // ---------------------------
  const machineNames = [
    "Lathe Machine", "CNC Milling Machine", "3D Printer", "Welding Machine",
    "Drill Press", "Hydraulic Press", "Laser Cutter", "Grinding Machine",
    "Sheet Folding Machine", "Soldering Station", "Air Compressor", "Power Saw",
    "Injection Molder", "Robotic Arm", "Testing Bench"
  ];

  const machines = [];
  for (let i = 0; i < 15; i++) {
    machines.push(
      await prisma.machines.create({
        data: {
          ITI_ID: 1,
          Machine_Name: machineNames[i],
          Type: "Training Equipment",
          Model_No: `MDL-${1000 + i}`,
          Manufacturer: "TechMakers Ltd",
          Installation_Date: new Date(2020, i % 12, 10),
          Last_Service_Date: new Date(2024, i % 12, 4),
          Warranty_Expiry_Date: new Date(2026, i % 12, 1),
          Status: i % 3 === 0 ? "CRITICAL" : i % 2 === 0 ? "ALERT" : "HEALTHY",
          Last_used: new Date(),
          Faults: Math.floor(Math.random() * 4),
        }
      })
    );
  }

  // ---------------------------
  // WORKERS (10 ITI WORKERS)
  // ---------------------------
  const roles = ["POLICY_MAKER", "TRAINING_OFFICER", "ASSISTANT_TRAINING_OFFICER", "LAB_PRINCIPAL"];
  const workers = [];
  for (let i = 0; i < 10; i++) {
    workers.push(await prisma.iTI_Workers.create({
      data: {
        ITI_ID: 1,
        Name: `Worker ${i + 1}`,
        Role: roles[i % roles.length],
        Experience: 2 + i,
        Salary: 35000 + i * 1500,
        Contact: `90000000${i}`,
        Active_Status: true
      }
    }));
  }

  // ---------------------------
  // MAINTENANCE WORKERS (10)
  // ---------------------------
  const maintenanceWorkers = [];
  for (let i = 0; i < 10; i++) {
    maintenanceWorkers.push(
      await prisma.maintenance_Workers.create({
        data: {
          ITI_ID: 1,
          Name: `Maintenance Tech ${i + 1}`,
          Experience: 1.5 + i,
          Salary: `${25000 + i * 1200}`,
          Contact: `88000000${i}`,
          last_worked: new Date(),
          Active_Status: true,
          Solved_cases: Math.floor(Math.random() * 20),
          pending: "None"
        }
      })
    );
  }

  // ---------------------------
  // TRADES (10)
  // ---------------------------
  const tradeNames = [
    "Electrician", "Fitter", "Welder", "Computer Operator",
    "Machinist", "Automobile Technician", "Turner", "Plumber",
    "CNC Specialist", "Robotics"
  ];

  const trades = [];
  for (let i = 0; i < 10; i++) {
    trades.push(
      await prisma.trades.create({
        data: {
          ITI_ID: 1,
          Trade_Name: tradeNames[i],
          Duration: "1 year",
          Syllabus: "Basics + Practical Training",
          Certification: "NSQF Level 4"
        }
      })
    );
  }

  // ---------------------------
  // STUDENTS (20)
  // ---------------------------
  const students = [];
  for (let i = 0; i < 20; i++) {
    students.push(
      await prisma.students.create({
        data: {
          ITI_ID: 1,
          Trade_ID: trades[i % trades.length].Trade_ID,
          Worker_ID: workers[i % workers.length].Worker_ID,
          Name: `Student ${i + 1}`,
          Batch: `202${i % 3}-A`,
          Email: `student${i + 1}@iti.com`,
          Gender: i % 2 ? "Female" : "Male",
          Year: 2024,
          Admission_Date: new Date(2024, 5, i + 1),
          Placed: i % 4 === 0
        }
      })
    );
  }

  // ---------------------------
  // INVENTORY (15)
  // ---------------------------
  const inventoryItems = [];
  const inventoryNames = [
    "Copper Wire", "Steel Rods", "Screws Pack", "Solder Paste", "PCB Board",
    "CNC Tool Kit", "Safety Gloves", "Welding Rods", "Coolant Oil", "Grinding Wheel",
    "Lathe Tools", "Measurement Tape", "Digital Multimeter", "Tool Box", "Cleaning Kit"
  ];

  for (let i = 0; i < 15; i++) {
    inventoryItems.push(
      await prisma.inventory.create({
        data: {
          Item_Name: inventoryNames[i],
          Quantity: 10 + i,
          Reorder_Level: 5,
          Worker_ID: workers[i % workers.length].Worker_ID
        }
      })
    );
  }

  // ---------------------------
  // AUCTIONS (10 linked to inventory)
  // ---------------------------
  for (let i = 0; i < 10; i++) {
    await prisma.auctions.create({
      data: {
        Item_ID: inventoryItems[i].Item_ID,
        ITI_ID: 1,
        Item_Name: inventoryItems[i].Item_Name,
        Quantity: inventoryItems[i].Quantity,
        Base_Price: 500 + i * 100,
        Bids: Math.floor(Math.random() * 10)
      }
    });
  }

  // ---------------------------
  // MAINTENANCE LOGS (15)
  // ---------------------------
  const issues = [
    "Overheating issue",
    "Alignment problem",
    "Motor malfunction",
    "Coolant leakage",
    "Abnormal noise",
    "Display failure",
    "Power fluctuation",
    "Tool breakage",
    "Low pressure",
    "Software bug",
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.maintenance_Log.create({
      data: {
        ITI_ID: 1,
        Machine_ID: machines[i % machines.length].Machine_ID,
        M_Worker_ID: maintenanceWorkers[i % maintenanceWorkers.length].M_Worker_ID,
        Worker_ID: workers[i % workers.length].Worker_ID,
        Issue_Reported: issues[i % issues.length],
        Action_Taken: "Checked and resolved",
        Severity: i % 3 === 0 ? "High" : "Medium",
        Status: i % 2 === 0 ? "Closed" : "Open",
        Report_Date: new Date(2024, 3, i + 1),
        Next_Service_Date: new Date(2024, 5, i + 10)
      }
    });
  }

  // ---------------------------
  // SCHEDULE LOGS (15)
  // ---------------------------
  for (let i = 0; i < 15; i++) {
    await prisma.schedule_Logs.create({
      data: {
        ITI_ID: 1,
        Machine_ID: machines[i % machines.length].Machine_ID,
        Worker_ID: workers[i % workers.length].Worker_ID,
        Student_ID: students[i % students.length].Student_ID,
        Time: (i % 6) + 1,
        Scheduled_On: new Date(2024, 4, i + 2),
        Completed_At: i % 2 === 0 ? new Date(2024, 4, i + 3) : null
      }
    });
  }

  console.log("🌱 SEEDING COMPLETE!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
