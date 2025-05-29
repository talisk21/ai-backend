-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "parentStepId" TEXT;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_parentStepId_fkey" FOREIGN KEY ("parentStepId") REFERENCES "Step"("id") ON DELETE SET NULL ON UPDATE CASCADE;
