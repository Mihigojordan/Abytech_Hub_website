-- AlterTable
ALTER TABLE `messages` ADD COLUMN `callData` JSON NULL,
    MODIFY `type` ENUM('text', 'image', 'file', 'combined', 'call') NOT NULL DEFAULT 'text';
