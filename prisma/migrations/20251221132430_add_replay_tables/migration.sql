-- CreateTable
CREATE TABLE "ReplaySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ReplaySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplayAction" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ReplayAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReplaySession_userId_startedAt_idx" ON "ReplaySession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "ReplaySession_startedAt_idx" ON "ReplaySession"("startedAt");

-- CreateIndex
CREATE INDEX "ReplayAction_sessionId_timestamp_idx" ON "ReplayAction"("sessionId", "timestamp");

-- AddForeignKey
ALTER TABLE "ReplaySession" ADD CONSTRAINT "ReplaySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplayAction" ADD CONSTRAINT "ReplayAction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ReplaySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
