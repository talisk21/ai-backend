/*
  Warnings:

  - You are about to drop the `PromptTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PromptTemplate";

-- CreateTable
CREATE TABLE "RouteTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "content" JSONB,
    "metadata" JSONB,
    "userId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteTemplate_pkey" PRIMARY KEY ("id")
);
