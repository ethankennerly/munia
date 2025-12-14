-- Add Role enum and role column to User
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';
