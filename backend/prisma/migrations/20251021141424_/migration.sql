/*
  Warnings:

  - You are about to drop the column `reportUrl` on the `report` table. All the data in the column will be lost.
  - Added the required column `content` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Report` DROP COLUMN `reportUrl`,
    ADD COLUMN `content` JSON NOT NULL;
