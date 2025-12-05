/*
  Warnings:

  - Added the required column `type` to the `MtftItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MtftAugment" ADD COLUMN     "averagePlace" DOUBLE PRECISION,
ADD COLUMN     "playRate" DOUBLE PRECISION,
ADD COLUMN     "top4Rate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MtftItem" ADD COLUMN     "type" TEXT NOT NULL;
