/*
  Warnings:

  - Added the required column `updatedAt` to the `style_catalog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "style_catalog" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modelId" TEXT,
ADD COLUMN     "trendScore" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
