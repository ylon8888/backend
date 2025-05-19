/*
  Warnings:

  - Added the required column `courseId` to the `testimonials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "courseId" TEXT NOT NULL;
