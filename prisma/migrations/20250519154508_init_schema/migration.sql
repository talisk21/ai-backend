-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'UI',
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "source" TEXT,
    "userId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" JSONB,
    "query" JSONB,
    "headers" JSONB,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL,
    "smtpUser" TEXT NOT NULL,
    "smtpPass" TEXT NOT NULL,
    "imapHost" TEXT NOT NULL,
    "imapPort" INTEGER NOT NULL,
    "imapUser" TEXT NOT NULL,
    "imapPass" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "executionId" TEXT,
    "stepId" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE SET NULL ON UPDATE CASCADE;
