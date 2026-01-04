/*
  Warnings:

  - Changed the type of `Role` on the `ITI_Workers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WorkerRole" AS ENUM ('POLICY_MAKER', 'TRAINING_OFFICER', 'ASSISTANT_TRAINING_OFFICER', 'LAB_PRINCIPAL');

-- AlterTable
ALTER TABLE "ITI_Workers" DROP COLUMN "Role",
ADD COLUMN     "Role" "WorkerRole" NOT NULL;
