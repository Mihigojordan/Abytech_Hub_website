-- CreateTable
CREATE TABLE `Research` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `problem` JSON NULL,
    `objective` JSON NULL,
    `methodology` JSON NULL,
    `findings` JSON NULL,
    `conclusion` JSON NULL,
    `recommendations` JSON NULL,
    `type` ENUM('TECHNICAL', 'MARKET', 'USER', 'PERFORMANCE', 'OTHER') NOT NULL,
    `status` ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEW', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NULL,
    `attachments` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Research_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meeting` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `status` ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `location` VARCHAR(191) NULL,
    `meetingLink` VARCHAR(191) NULL,
    `participants` JSON NULL,
    `keyPoints` JSON NULL,
    `actionItems` JSON NULL,
    `attachments` JSON NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InternshipApplication` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `institution` VARCHAR(191) NULL,
    `fieldOfStudy` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `internshipType` ENUM('SOFTWARE_DEVELOPMENT', 'UI_UX', 'DATA', 'MARKETING', 'IT_SUPPORT', 'OTHER') NOT NULL,
    `preferredStart` DATETIME(3) NULL,
    `preferredEnd` DATETIME(3) NULL,
    `coverLetter` TEXT NULL,
    `skills` JSON NULL,
    `cvUrl` VARCHAR(191) NULL,
    `portfolioUrl` VARCHAR(191) NULL,
    `githubUrl` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `score` INTEGER NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WAITLISTED') NOT NULL DEFAULT 'PENDING',
    `reviewedById` VARCHAR(191) NULL,
    `reviewNotes` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `isShortlisted` BOOLEAN NOT NULL DEFAULT false,
    `isContacted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HostedWebsite` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HostedWebsite_domain_key`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Research` ADD CONSTRAINT `Research_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meeting` ADD CONSTRAINT `Meeting_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternshipApplication` ADD CONSTRAINT `InternshipApplication_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
