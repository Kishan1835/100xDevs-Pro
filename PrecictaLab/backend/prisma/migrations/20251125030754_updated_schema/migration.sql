/*
  Warnings:

  - The primary key for the `ITI` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `iti_id` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ITI` table. All the data in the column will be lost.
  - You are about to drop the column `ward` on the `ITI` table. All the data in the column will be lost.
  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `itemName` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `item_id` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `machine_id` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `reorderLevel` on the `Inventory` table. All the data in the column will be lost.
  - The primary key for the `Machine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `installationDate` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `iti_id` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `lastServiceDate` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `machineName` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `machine_id` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `modelNo` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyExpiryDate` on the `Machine` table. All the data in the column will be lost.
  - The primary key for the `Maintenance_Log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actionTaken` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `issueReported` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `log_id` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `machine_id` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `nextServiceDate` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `reportDate` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Maintenance_Log` table. All the data in the column will be lost.
  - You are about to drop the column `worker_id` on the `Maintenance_Log` table. All the data in the column will be lost.
  - The primary key for the `Trade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `certification` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `iti_id` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `syllabus` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `tradeName` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `trade_id` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the `Students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Address` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Contact` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ITI_score` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Region` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Status` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Updated_At` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Ward` to the `ITI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Item_Name` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Last_Updated` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Machine_ID` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Quantity` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Reorder_Level` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Faults` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ITI_ID` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Installation_Date` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Last_Service_Date` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Last_used` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Machine_Name` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Manufacturer` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Model_No` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Status` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Type` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Updated_At` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Warranty_Expiry_Date` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Action_Taken` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Issue_Reported` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Machine_ID` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Next_Service_Date` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Report_Date` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Severity` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Status` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Updated_At` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Worker_ID` to the `Maintenance_Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Certification` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Duration` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ITI_ID` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Syllabus` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Trade_Name` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Updated_At` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_machine_id_fkey";

-- DropForeignKey
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_iti_id_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance_Log" DROP CONSTRAINT "Maintenance_Log_machine_id_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance_Log" DROP CONSTRAINT "Maintenance_Log_worker_id_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_iti_id_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_trade_id_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_iti_id_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_iti_id_fkey";

-- DropForeignKey
ALTER TABLE "Workers" DROP CONSTRAINT "Workers_iti_id_fkey";

-- AlterTable
ALTER TABLE "ITI" DROP CONSTRAINT "ITI_pkey",
DROP COLUMN "address",
DROP COLUMN "contact",
DROP COLUMN "createdAt",
DROP COLUMN "iti_id",
DROP COLUMN "name",
DROP COLUMN "region",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
DROP COLUMN "ward",
ADD COLUMN     "Address" TEXT NOT NULL,
ADD COLUMN     "Contact" TEXT NOT NULL,
ADD COLUMN     "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ITI_ID" SERIAL NOT NULL,
ADD COLUMN     "ITI_score" INTEGER NOT NULL,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "Region" TEXT NOT NULL,
ADD COLUMN     "Status" TEXT NOT NULL,
ADD COLUMN     "Updated_At" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Ward" TEXT NOT NULL,
ADD CONSTRAINT "ITI_pkey" PRIMARY KEY ("ITI_ID");

-- AlterTable
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_pkey",
DROP COLUMN "itemName",
DROP COLUMN "item_id",
DROP COLUMN "lastUpdated",
DROP COLUMN "machine_id",
DROP COLUMN "quantity",
DROP COLUMN "reorderLevel",
ADD COLUMN     "Item_ID" SERIAL NOT NULL,
ADD COLUMN     "Item_Name" TEXT NOT NULL,
ADD COLUMN     "Last_Updated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Machine_ID" INTEGER NOT NULL,
ADD COLUMN     "Quantity" INTEGER NOT NULL,
ADD COLUMN     "Reorder_Level" INTEGER NOT NULL,
ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY ("Item_ID");

-- AlterTable
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "installationDate",
DROP COLUMN "iti_id",
DROP COLUMN "lastServiceDate",
DROP COLUMN "machineName",
DROP COLUMN "machine_id",
DROP COLUMN "manufacturer",
DROP COLUMN "modelNo",
DROP COLUMN "status",
DROP COLUMN "type",
DROP COLUMN "warrantyExpiryDate",
ADD COLUMN     "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Faults" INTEGER NOT NULL,
ADD COLUMN     "ITI_ID" INTEGER NOT NULL,
ADD COLUMN     "Installation_Date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Last_Service_Date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Last_used" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Machine_ID" SERIAL NOT NULL,
ADD COLUMN     "Machine_Name" TEXT NOT NULL,
ADD COLUMN     "Manufacturer" TEXT NOT NULL,
ADD COLUMN     "Model_No" TEXT NOT NULL,
ADD COLUMN     "Status" TEXT NOT NULL,
ADD COLUMN     "Type" TEXT NOT NULL,
ADD COLUMN     "Updated_At" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Warranty_Expiry_Date" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Machine_pkey" PRIMARY KEY ("Machine_ID");

-- AlterTable
ALTER TABLE "Maintenance_Log" DROP CONSTRAINT "Maintenance_Log_pkey",
DROP COLUMN "actionTaken",
DROP COLUMN "createdAt",
DROP COLUMN "issueReported",
DROP COLUMN "log_id",
DROP COLUMN "machine_id",
DROP COLUMN "nextServiceDate",
DROP COLUMN "reportDate",
DROP COLUMN "severity",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
DROP COLUMN "worker_id",
ADD COLUMN     "Action_Taken" TEXT NOT NULL,
ADD COLUMN     "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Issue_Reported" TEXT NOT NULL,
ADD COLUMN     "Log_ID" SERIAL NOT NULL,
ADD COLUMN     "Machine_ID" INTEGER NOT NULL,
ADD COLUMN     "Next_Service_Date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Report_Date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Severity" TEXT NOT NULL,
ADD COLUMN     "Status" BOOLEAN NOT NULL,
ADD COLUMN     "Updated_At" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Worker_ID" INTEGER NOT NULL,
ADD CONSTRAINT "Maintenance_Log_pkey" PRIMARY KEY ("Log_ID");

-- AlterTable
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_pkey",
DROP COLUMN "certification",
DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "iti_id",
DROP COLUMN "syllabus",
DROP COLUMN "tradeName",
DROP COLUMN "trade_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "Certification" TEXT NOT NULL,
ADD COLUMN     "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Duration" TEXT NOT NULL,
ADD COLUMN     "ITI_ID" INTEGER NOT NULL,
ADD COLUMN     "Syllabus" TEXT NOT NULL,
ADD COLUMN     "Trade_ID" SERIAL NOT NULL,
ADD COLUMN     "Trade_Name" TEXT NOT NULL,
ADD COLUMN     "Updated_At" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Trade_pkey" PRIMARY KEY ("Trade_ID");

-- DropTable
DROP TABLE "Students";

-- DropTable
DROP TABLE "Users";

-- DropTable
DROP TABLE "Workers";

-- CreateTable
CREATE TABLE "Worker" (
    "Worker_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Role" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Experience" INTEGER NOT NULL,
    "Salary" DECIMAL(65,30) NOT NULL,
    "Contact" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "Active_Status" BOOLEAN NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("Worker_ID")
);

-- CreateTable
CREATE TABLE "Student" (
    "Student_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Trade_ID" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Batch" TEXT NOT NULL,
    "Year" INTEGER NOT NULL,
    "DOB" TIMESTAMP(3) NOT NULL,
    "Gender" TEXT NOT NULL,
    "Contact" TEXT NOT NULL,
    "Admission_Date" TIMESTAMP(3) NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "Placed" BOOLEAN NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("Student_ID")
);

-- CreateTable
CREATE TABLE "Auction" (
    "Item_ID" SERIAL NOT NULL,
    "ITI_ID" INTEGER,
    "Worker_ID" INTEGER,
    "Item_Name" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Base_Price" INTEGER NOT NULL,
    "Last_Updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("Item_ID")
);

-- CreateTable
CREATE TABLE "User" (
    "User_ID" SERIAL NOT NULL,
    "Username" TEXT NOT NULL,
    "Password_Hash" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Last_Login" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("User_ID")
);

-- CreateTable
CREATE TABLE "Schedule_Log" (
    "User_ID" INTEGER NOT NULL,
    "Machine_ID" INTEGER NOT NULL,
    "Scheduled_on" TIMESTAMP(3) NOT NULL,
    "ITI_ID" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Worker_ID" INTEGER NOT NULL,

    CONSTRAINT "Schedule_Log_pkey" PRIMARY KEY ("User_ID","Machine_ID","Scheduled_on")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Username_key" ON "User"("Username");

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_Trade_ID_fkey" FOREIGN KEY ("Trade_ID") REFERENCES "Trade"("Trade_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_Machine_ID_fkey" FOREIGN KEY ("Machine_ID") REFERENCES "Machine"("Machine_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance_Log" ADD CONSTRAINT "Maintenance_Log_Worker_ID_fkey" FOREIGN KEY ("Worker_ID") REFERENCES "Worker"("Worker_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_Machine_ID_fkey" FOREIGN KEY ("Machine_ID") REFERENCES "Machine"("Machine_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_Worker_ID_fkey" FOREIGN KEY ("Worker_ID") REFERENCES "Worker"("Worker_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Log" ADD CONSTRAINT "Schedule_Log_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Log" ADD CONSTRAINT "Schedule_Log_Machine_ID_fkey" FOREIGN KEY ("Machine_ID") REFERENCES "Machine"("Machine_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Log" ADD CONSTRAINT "Schedule_Log_ITI_ID_fkey" FOREIGN KEY ("ITI_ID") REFERENCES "ITI"("ITI_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Log" ADD CONSTRAINT "Schedule_Log_Worker_ID_fkey" FOREIGN KEY ("Worker_ID") REFERENCES "Worker"("Worker_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
