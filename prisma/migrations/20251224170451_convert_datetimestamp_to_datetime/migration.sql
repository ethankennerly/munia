-- Step 1: Add a temporary DateTime column
ALTER TABLE "ReplayAction" ADD COLUMN "datetimestamp_new" TIMESTAMP(3);

-- Step 2: Convert BigInt milliseconds to DateTime
-- PostgreSQL: TO_TIMESTAMP converts seconds, so divide by 1000.0
UPDATE "ReplayAction" 
SET "datetimestamp_new" = TO_TIMESTAMP("datetimestamp"::numeric / 1000.0);

-- Step 3: Drop the old index
DROP INDEX IF EXISTS "ReplayAction_sessionId_datetimestamp_idx";

-- Step 4: Drop the old BigInt column
ALTER TABLE "ReplayAction" DROP COLUMN "datetimestamp";

-- Step 5: Rename the new column to datetimestamp
ALTER TABLE "ReplayAction" RENAME COLUMN "datetimestamp_new" TO "datetimestamp";

-- Step 6: Make it NOT NULL (it should already be, but ensure it)
ALTER TABLE "ReplayAction" ALTER COLUMN "datetimestamp" SET NOT NULL;

-- Step 7: Create new index on DateTime column
CREATE INDEX "ReplayAction_sessionId_datetimestamp_idx" ON "ReplayAction"("sessionId", "datetimestamp");
