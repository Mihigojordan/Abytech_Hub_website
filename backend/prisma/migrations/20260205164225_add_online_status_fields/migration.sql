-- AlterTable
ALTER TABLE `admin` ADD COLUMN `isOnline` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `last_seen` TIMESTAMP(0) NULL;
