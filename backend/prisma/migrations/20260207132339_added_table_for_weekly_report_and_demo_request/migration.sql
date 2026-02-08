-- CreateTable
CREATE TABLE `WeeklyGoal` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `weekEnd` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED') NOT NULL DEFAULT 'PENDING',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `ownerId` VARCHAR(191) NOT NULL,
    `tasks` JSON NULL,
    `reviewNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DemoRequest` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `product` VARCHAR(191) NULL,
    `demoType` ENUM('PRODUCT', 'FEATURE', 'CUSTOM') NOT NULL,
    `preferredDate` DATETIME(3) NULL,
    `preferredTime` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `assignedToId` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `meetingLink` VARCHAR(191) NULL,
    `internalNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WeeklyGoal` ADD CONSTRAINT `WeeklyGoal_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DemoRequest` ADD CONSTRAINT `DemoRequest_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
