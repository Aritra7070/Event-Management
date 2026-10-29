/*
  Warnings:

  - The `status` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'CONFIRMED';

-- DropEnum
DROP TYPE "regstatus";

-- CreateIndex
CREATE INDEX "Registration_eventId_status_idx" ON "Registration"("eventId", "status");
