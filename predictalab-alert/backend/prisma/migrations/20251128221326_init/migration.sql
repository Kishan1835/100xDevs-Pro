-- CreateTable
CREATE TABLE "ITI" (
    "ITI_ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "City" TEXT NOT NULL,
    "State" TEXT NOT NULL,
    "Address" TEXT NOT NULL,
    "Contact" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "ITI_score" INTEGER NOT NULL,

    CONSTRAINT "ITI_pkey" PRIMARY KEY ("ITI_ID")
);

-- CreateTable
CREATE TABLE "Machines" (
    "Machine_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Machine_Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Model_No" TEXT NOT NULL,
    "Manufacturer" TEXT NOT NULL,
    "Installation_Date" TIMESTAMP(3) NOT NULL,
    "Last_Service_Date" TIMESTAMP(3) NOT NULL,
    "Warranty_Expiry_Date" TIMESTAMP(3) NOT NULL,
    "Status" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "Last_used" TIMESTAMP(3) NOT NULL,
    "Faults" TEXT[],

    CONSTRAINT "Machines_pkey" PRIMARY KEY ("Machine_ID")
);

-- CreateTable
CREATE TABLE "Maintenance_Workers" (
    "M_Worker_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Experience" DECIMAL(65,30) NOT NULL,
    "Salary" TEXT NOT NULL,
    "Contact" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "last_worked" TIMESTAMP(3) NOT NULL,
    "Active_Status" BOOLEAN NOT NULL,
    "Solved_cases" INTEGER NOT NULL,
    "pending" TEXT NOT NULL,

    CONSTRAINT "Maintenance_Workers_pkey" PRIMARY KEY ("M_Worker_ID")
);

-- CreateTable
CREATE TABLE "Maintenance_Log" (
    "ML_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Machine_ID" INTEGER NOT NULL,
    "M_Worker_ID" INTEGER NOT NULL,
    "Worker_ID" INTEGER NOT NULL,
    "Issue_Reported" TEXT NOT NULL,
    "Action_Taken" TEXT NOT NULL,
    "Severity" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Report_Date" TIMESTAMP(3) NOT NULL,
    "Next_Service_Date" TIMESTAMP(3) NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_Log_pkey" PRIMARY KEY ("ML_ID")
);

-- CreateTable
CREATE TABLE "ITI_Workers" (
    "Worker_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    "Experience" INTEGER NOT NULL,
    "Salary" DECIMAL(65,30) NOT NULL,
    "Contact" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "Active_Status" BOOLEAN NOT NULL,

    CONSTRAINT "ITI_Workers_pkey" PRIMARY KEY ("Worker_ID")
);

-- CreateTable
CREATE TABLE "Trades" (
    "Trade_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Trade_Name" TEXT NOT NULL,
    "Duration" TEXT NOT NULL,
    "Syllabus" TEXT NOT NULL,
    "Certification" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trades_pkey" PRIMARY KEY ("Trade_ID")
);

-- CreateTable
CREATE TABLE "Students" (
    "Student_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Trade_ID" INTEGER NOT NULL,
    "Worker_ID" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Batch" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Gender" TEXT NOT NULL,
    "Year" INTEGER NOT NULL,
    "Admission_Date" TIMESTAMP(3) NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "Placed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Students_pkey" PRIMARY KEY ("Student_ID")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "Item_ID" SERIAL NOT NULL,
    "Item_Name" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Reorder_Level" INTEGER NOT NULL,
    "Last_Updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Worker_ID" INTEGER,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("Item_ID")
);

-- CreateTable
CREATE TABLE "Auctions" (
    "Item_ID" INTEGER NOT NULL,
    "ITI_ID" INTEGER,
    "Item_Name" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Base_Price" DECIMAL(65,30) NOT NULL,
    "Last_Updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Bids" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Auctions_pkey" PRIMARY KEY ("Item_ID")
);

-- CreateTable
CREATE TABLE "Schedule_Logs" (
    "S_Log_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Machine_ID" INTEGER NOT NULL,
    "Worker_ID" INTEGER NOT NULL,
    "Student_ID" INTEGER NOT NULL,
    "Time" INTEGER NOT NULL,
    "Scheduled_On" TIMESTAMP(3) NOT NULL,
    "Completed_At" TIMESTAMP(3),

    CONSTRAINT "Schedule_Logs_pkey" PRIMARY KEY ("S_Log_ID")
);

-- CreateTable
CREATE TABLE "_Machines_maintenanceWorkers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Machines_maintenanceWorkers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Machines_maintenanceWorkers_B_index" ON "_Machines_maintenanceWorkers"("B");

-- AddForeignKey
ALTER TABLE "Machines" ADD CONSTRAINT "Machines_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Workers" ADD CONSTRAINT "Maintenance_Workers_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_Machine_ID_fkey" FOREIGN KEY ("Machine_ID") REFERENCES "Machines"("Machine_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_M_Worker_ID_fkey" FOREIGN KEY ("M_Worker_ID") REFERENCES "Maintenance_Workers"("M_Worker_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_Worker_ID_fkey" FOREIGN KEY ("Worker_ID") REFERENCES "ITI_Workers"("Worker_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ITI_Workers" ADD CONSTRAINT "ITI_Workers_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trades" ADD CONSTRAINT "Trades_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_Trade_ID_fkey" FOREIGN KEY ("Trade_ID") REFERENCES "Trades"("Trade_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_Worker_ID_fkey" FOREIGN KEY ("Worker_ID") REFERENCES "ITI_Workers"("Worker_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_Worker_ID_fkey" FOREIGN KEY ("Worker_ID") REFERENCES "ITI_Workers"("Worker_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auctions" ADD CONSTRAINT "Auctions_Item_ID_fkey" FOREIGN KEY ("Item_ID") REFERENCES "Inventory"("Item_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auctions" ADD CONSTRAINT "Auctions_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Logs" ADD CONSTRAINT "Schedule_Logs_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Logs" ADD CONSTRAINT "Schedule_Logs_Machine_ID_fkey" FOREIGN KEY ("Machine_ID") REFERENCES "Machines"("Machine_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Logs" ADD CONSTRAINT "Schedule_Logs_Worker_ID_fkey" FOREIGN KEY ("Worker_ID") REFERENCES "ITI_Workers"("Worker_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Logs" ADD CONSTRAINT "Schedule_Logs_Student_ID_fkey" FOREIGN KEY ("Student_ID") REFERENCES "Students"("Student_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Machines_maintenanceWorkers" ADD CONSTRAINT "_Machines_maintenanceWorkers_A_fkey" FOREIGN KEY ("A") REFERENCES "Machines"("Machine_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Machines_maintenanceWorkers" ADD CONSTRAINT "_Machines_maintenanceWorkers_B_fkey" FOREIGN KEY ("B") REFERENCES "Maintenance_Workers"("M_Worker_ID") ON DELETE CASCADE ON UPDATE CASCADE;
