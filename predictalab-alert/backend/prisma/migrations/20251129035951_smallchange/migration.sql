/*
  Warnings:

  - Changed the type of `Faults` on the `Machines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Machines" DROP COLUMN "Faults",
ADD COLUMN     "Faults" INTEGER NOT NULL;
