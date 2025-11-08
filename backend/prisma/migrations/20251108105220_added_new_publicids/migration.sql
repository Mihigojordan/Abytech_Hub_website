/*
  Warnings:

  - You are about to drop the column `publicId` on the `admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `admin` DROP COLUMN `publicId`,
    ADD COLUMN `bio` VARCHAR(191) NULL,
    ADD COLUMN `cv` VARCHAR(191) NULL,
    ADD COLUMN `cvPublicId` VARCHAR(191) NULL,
    ADD COLUMN `experience` JSON NULL,
    ADD COLUMN `identityCard` VARCHAR(191) NULL,
    ADD COLUMN `identityCardPublicId` VARCHAR(191) NULL,
    ADD COLUMN `joinedDate` DATETIME(3) NULL,
    ADD COLUMN `passport` VARCHAR(191) NULL,
    ADD COLUMN `passportPublicId` VARCHAR(191) NULL,
    ADD COLUMN `portifilio` JSON NULL,
    ADD COLUMN `profileImagePublicId` VARCHAR(191) NULL,
    ADD COLUMN `skills` JSON NULL;
