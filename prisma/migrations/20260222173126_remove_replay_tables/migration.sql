/*
  Warnings:

  - You are about to drop the `Localization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReplayAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReplaySession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReplayAction" DROP CONSTRAINT "ReplayAction_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "ReplaySession" DROP CONSTRAINT "ReplaySession_userId_fkey";

-- DropTable
DROP TABLE "Localization";

-- DropTable
DROP TABLE "ReplayAction";

-- DropTable
DROP TABLE "ReplaySession";
