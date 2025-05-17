/*
  Warnings:

  - You are about to drop the column `isVisible` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "isVisible",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
