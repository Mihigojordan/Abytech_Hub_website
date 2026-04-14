/*
  Warnings:

  - The values [STAFF] on the enum `Notification_senderType` will be removed. If these variants are still used in the database, this will fail.
  - The values [STAFF] on the enum `PushSubscription_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `senderType` ENUM('ADMIN', 'USER') NULL;

-- AlterTable
ALTER TABLE `pushsubscription` MODIFY `type` ENUM('ADMIN', 'USER') NOT NULL;
