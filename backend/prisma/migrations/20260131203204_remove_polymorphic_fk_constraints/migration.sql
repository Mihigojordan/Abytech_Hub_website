-- DropForeignKey
ALTER TABLE `contacts` DROP FOREIGN KEY `fk_contact_contact_admin`;

-- DropForeignKey
ALTER TABLE `contacts` DROP FOREIGN KEY `fk_contact_contact_user`;

-- DropForeignKey
ALTER TABLE `contacts` DROP FOREIGN KEY `fk_contact_owner_admin`;

-- DropForeignKey
ALTER TABLE `contacts` DROP FOREIGN KEY `fk_contact_owner_user`;

-- DropForeignKey
ALTER TABLE `conversation_participants` DROP FOREIGN KEY `fk_participant_admin`;

-- DropForeignKey
ALTER TABLE `conversation_participants` DROP FOREIGN KEY `fk_participant_user`;

-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `fk_conversation_creator_admin`;

-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `fk_conversation_creator_user`;

-- DropForeignKey
ALTER TABLE `message_readers` DROP FOREIGN KEY `fk_reader_admin`;

-- DropForeignKey
ALTER TABLE `message_readers` DROP FOREIGN KEY `fk_reader_user`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `fk_message_sender_admin`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `fk_message_sender_user`;
