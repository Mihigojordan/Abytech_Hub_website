-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `adminName` VARCHAR(191) NULL,
    `adminEmail` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `identityCardPublicId` VARCHAR(191) NULL,
    `passportPublicId` VARCHAR(191) NULL,
    `cvPublicId` VARCHAR(191) NULL,
    `profileImagePublicId` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `profileImage` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `google_id` VARCHAR(191) NULL,
    `is2FA` BOOLEAN NULL DEFAULT false,
    `idNumber` INTEGER NULL,
    `bio` TEXT NULL,
    `experience` JSON NULL,
    `joinedDate` DATETIME(3) NULL,
    `isLocked` BOOLEAN NULL DEFAULT false,
    `skills` JSON NULL,
    `portifilio` JSON NULL,
    `cv` VARCHAR(191) NULL,
    `passport` VARCHAR(191) NULL,
    `identityCard` VARCHAR(191) NULL,
    `isOnline` BOOLEAN NULL DEFAULT false,
    `last_seen` TIMESTAMP(0) NULL,
    `subscription` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_id_key`(`id`),
    UNIQUE INDEX `Admin_adminEmail_key`(`adminEmail`),
    UNIQUE INDEX `Admin_google_id_key`(`google_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(500) NULL,
    `initial` VARCHAR(5) NULL,
    `last_seen` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `isOnline` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `period` ENUM('ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR') NULL,
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

-- CreateTable
CREATE TABLE `conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `avatar` VARCHAR(500) NULL,
    `initial` VARCHAR(5) NULL,
    `is_group` BOOLEAN NOT NULL DEFAULT false,
    `created_by` VARCHAR(191) NOT NULL,
    `created_by_type` ENUM('ADMIN', 'USER') NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `conversations_created_by_idx`(`created_by`),
    INDEX `conversations_is_group_idx`(`is_group`),
    INDEX `conversations_created_by_type_idx`(`created_by_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation_participants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `participant_type` ENUM('ADMIN', 'USER') NOT NULL,
    `role` ENUM('admin', 'member') NOT NULL DEFAULT 'member',
    `joined_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `left_at` TIMESTAMP(0) NULL,
    `last_read_message_id` INTEGER NULL,

    INDEX `conversation_participants_conversation_id_idx`(`conversation_id`),
    INDEX `conversation_participants_participant_id_idx`(`participant_id`),
    INDEX `conversation_participants_participant_type_idx`(`participant_type`),
    INDEX `conversation_participants_last_read_message_id_idx`(`last_read_message_id`),
    UNIQUE INDEX `conversation_participants_conversation_id_participant_id_par_key`(`conversation_id`, `participant_id`, `participant_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `sender_type` ENUM('ADMIN', 'USER') NOT NULL,
    `type` ENUM('text', 'image', 'file', 'combined') NOT NULL DEFAULT 'text',
    `content` TEXT NULL,
    `reply_to_message_id` INTEGER NULL,
    `edited` BOOLEAN NOT NULL DEFAULT false,
    `is_forwarded` BOOLEAN NOT NULL DEFAULT false,
    `timestamp` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `messages_conversation_id_idx`(`conversation_id`),
    INDEX `messages_sender_id_idx`(`sender_id`),
    INDEX `messages_sender_type_idx`(`sender_type`),
    INDEX `messages_timestamp_idx`(`timestamp`),
    INDEX `messages_reply_to_message_id_idx`(`reply_to_message_id`),
    FULLTEXT INDEX `messages_content_idx`(`content`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `image_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `message_images_message_id_idx`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_size` VARCHAR(50) NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(100) NULL,
    `file_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `message_files_message_id_idx`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_readers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `reader_id` VARCHAR(191) NOT NULL,
    `reader_type` ENUM('ADMIN', 'USER') NOT NULL,
    `read_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `message_readers_message_id_idx`(`message_id`),
    INDEX `message_readers_reader_id_idx`(`reader_id`),
    INDEX `message_readers_reader_type_idx`(`reader_type`),
    UNIQUE INDEX `message_readers_message_id_reader_id_reader_type_key`(`message_id`, `reader_id`, `reader_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` VARCHAR(191) NOT NULL,
    `owner_type` ENUM('ADMIN', 'USER') NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,
    `contact_type` ENUM('ADMIN', 'USER') NOT NULL,
    `nickname` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `contacts_owner_id_idx`(`owner_id`),
    INDEX `contacts_contact_id_idx`(`contact_id`),
    INDEX `contacts_owner_type_idx`(`owner_type`),
    INDEX `contacts_contact_type_idx`(`contact_type`),
    UNIQUE INDEX `contacts_owner_id_contact_id_owner_type_contact_type_key`(`owner_id`, `contact_id`, `owner_type`, `contact_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `description` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` JSON NULL,
    `reportUrl` VARCHAR(191) NULL,
    `publicId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReplyReport` (
    `id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Research` ADD CONSTRAINT `Research_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meeting` ADD CONSTRAINT `Meeting_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternshipApplication` ADD CONSTRAINT `InternshipApplication_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyGoal` ADD CONSTRAINT `WeeklyGoal_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DemoRequest` ADD CONSTRAINT `DemoRequest_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_last_read_message_id_fkey` FOREIGN KEY (`last_read_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_reply_to_message_id_fkey` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_images` ADD CONSTRAINT `message_images_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_files` ADD CONSTRAINT `message_files_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_readers` ADD CONSTRAINT `message_readers_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReplyReport` ADD CONSTRAINT `ReplyReport_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReplyReport` ADD CONSTRAINT `ReplyReport_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
