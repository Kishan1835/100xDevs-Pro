/*
  Warnings:

  - Changed the type of `Status` on the `Machines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('HEALTHY', 'ALERT', 'CRITICAL');

-- AlterTable
ALTER TABLE "Machines" DROP COLUMN "Status",
ADD COLUMN     "Status" "MachineStatus" NOT NULL;
