-- Step 1: Add the new datetimestamp column (nullable first)
ALTER TABLE "ReplayAction" ADD COLUMN "datetimestamp" BIGINT;

-- Step 2: Copy data from timestamp to datetimestamp
UPDATE "ReplayAction" SET "datetimestamp" = "timestamp";

-- Step 3: Make datetimestamp NOT NULL
ALTER TABLE "ReplayAction" ALTER COLUMN "datetimestamp" SET NOT NULL;

-- Step 4: Drop the old index
DROP INDEX IF EXISTS "ReplayAction_sessionId_timestamp_idx";

-- Step 5: Create new index on datetimestamp
CREATE INDEX "ReplayAction_sessionId_datetimestamp_idx" ON "ReplayAction"("sessionId", "datetimestamp");

-- Step 6: Drop the old timestamp column
ALTER TABLE "ReplayAction" DROP COLUMN "timestamp";
