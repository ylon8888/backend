/*
  Warnings:

  - The `questionAnswer` column on the `topics` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "topics" DROP COLUMN "questionAnswer",
ADD COLUMN     "questionAnswer" JSONB;
