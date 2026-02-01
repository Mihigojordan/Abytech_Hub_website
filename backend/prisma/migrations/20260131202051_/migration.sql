-- AlterTable
ALTER TABLE `admin` MODIFY `bio` TEXT NULL;

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

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
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
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `participant_type` ENUM('ADMIN', 'USER') NOT NULL,
    `role` ENUM('admin', 'member') NOT NULL DEFAULT 'member',
    `joined_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `left_at` TIMESTAMP(0) NULL,
    `last_read_message_id` BIGINT NULL,

    INDEX `conversation_participants_conversation_id_idx`(`conversation_id`),
    INDEX `conversation_participants_participant_id_idx`(`participant_id`),
    INDEX `conversation_participants_participant_type_idx`(`participant_type`),
    INDEX `conversation_participants_last_read_message_id_idx`(`last_read_message_id`),
    UNIQUE INDEX `conversation_participants_conversation_id_participant_id_par_key`(`conversation_id`, `participant_id`, `participant_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `sender_type` ENUM('ADMIN', 'USER') NOT NULL,
    `type` ENUM('text', 'image', 'file', 'combined') NOT NULL DEFAULT 'text',
    `content` TEXT NULL,
    `reply_to_message_id` BIGINT NULL,
    `edited` BOOLEAN NOT NULL DEFAULT false,
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
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `message_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `image_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `message_images_message_id_idx`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `message_id` BIGINT NOT NULL,
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
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `message_id` BIGINT NOT NULL,
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
    `id` BIGINT NOT NULL AUTO_INCREMENT,
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

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `fk_conversation_creator_admin` FOREIGN KEY (`created_by`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `fk_conversation_creator_user` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `fk_participant_admin` FOREIGN KEY (`participant_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `fk_participant_user` FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_last_read_message_id_fkey` FOREIGN KEY (`last_read_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `fk_message_sender_admin` FOREIGN KEY (`sender_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `fk_message_sender_user` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_reply_to_message_id_fkey` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_images` ADD CONSTRAINT `message_images_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_files` ADD CONSTRAINT `message_files_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_readers` ADD CONSTRAINT `message_readers_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_readers` ADD CONSTRAINT `fk_reader_admin` FOREIGN KEY (`reader_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_readers` ADD CONSTRAINT `fk_reader_user` FOREIGN KEY (`reader_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `fk_contact_owner_admin` FOREIGN KEY (`owner_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `fk_contact_owner_user` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `fk_contact_contact_admin` FOREIGN KEY (`contact_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `fk_contact_contact_user` FOREIGN KEY (`contact_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
