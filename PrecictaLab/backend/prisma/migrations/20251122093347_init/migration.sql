-- CreateTable
CREATE TABLE "ITI" (
    "iti_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ITI_pkey" PRIMARY KEY ("iti_id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "trade_id" SERIAL NOT NULL,
    "iti_id" INTEGER NOT NULL,
    "tradeName" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "syllabus" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("trade_id")
);

-- CreateTable
CREATE TABLE "Students" (
    "student_id" SERIAL NOT NULL,
    "iti_id" INTEGER NOT NULL,
    "trade_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "contact" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Workers" (
    "worker_id" SERIAL NOT NULL,
    "iti_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workers_pkey" PRIMARY KEY ("worker_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "iti_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "machine_id" SERIAL NOT NULL,
    "iti_id" INTEGER NOT NULL,
    "machineName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "modelNo" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "installationDate" TIMESTAMP(3) NOT NULL,
    "lastServiceDate" TIMESTAMP(3) NOT NULL,
    "warrantyExpiryDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "RUL" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("machine_id")
);

-- CreateTable
CREATE TABLE "Maintenance_Log" (
    "log_id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "issueReported" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "nextServiceDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_Log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "item_id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reorderLevel" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_iti_id_fkey" FOREIGN KEY ("iti_id") REFERENCES "ITI"("iti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_iti_id_fkey" FOREIGN KEY ("iti_id") REFERENCES "ITI"("iti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "Trade"("trade_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workers" ADD CONSTRAINT "Workers_iti_id_fkey" FOREIGN KEY ("iti_id") REFERENCES "ITI"("iti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_iti_id_fkey" FOREIGN KEY ("iti_id") REFERENCES "ITI"("iti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_iti_id_fkey" FOREIGN KEY ("iti_id") REFERENCES "ITI"("iti_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "Machine"("machine_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Workers"("worker_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "Machine"("machine_id") ON DELETE RESTRICT ON UPDATE CASCADE;
