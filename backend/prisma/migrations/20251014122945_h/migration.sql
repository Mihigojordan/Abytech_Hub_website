/*
  Warnings:

  - You are about to drop the column `filePath` on the `report` table. All the data in the column will be lost.
  - Added the required column `reportUrl` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `report` DROP COLUMN `filePath`,
    ADD COLUMN `reportUrl` VARCHAR(191) NOT NULL;
