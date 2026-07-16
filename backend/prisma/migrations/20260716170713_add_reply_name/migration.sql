-- AlterTable
ALTER TABLE `ReplyReport` ADD COLUMN `replyName` VARCHAR(191) NULL;

-- Backfill existing replies with the replier's current name, so rows created
-- before this column existed also show a real name instead of falling back
-- to a placeholder.
UPDATE `ReplyReport` r
JOIN `Admin` a ON a.`id` = r.`adminId`
SET r.`replyName` = a.`adminName`
WHERE r.`replyName` IS NULL;
