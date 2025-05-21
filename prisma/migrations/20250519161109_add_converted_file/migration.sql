/*
  Warnings:

  - A unique constraint covering the columns `[convertedFileId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "convertedFileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_convertedFileId_key" ON "File"("convertedFileId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_convertedFileId_fkey" FOREIGN KEY ("convertedFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
