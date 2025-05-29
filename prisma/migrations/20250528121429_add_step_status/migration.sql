-- AlterTable
ALTER TABLE "Execution" ADD COLUMN     "templateId" TEXT;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RouteTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
