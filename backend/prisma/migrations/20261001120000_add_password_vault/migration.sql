-- CreateTable
CREATE TABLE `VaultAccount` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `kdfSalt` VARCHAR(191) NOT NULL,
    `kdfParams` JSON NOT NULL,
    `authSalt` VARCHAR(191) NOT NULL,
    `authHash` VARCHAR(191) NOT NULL,
    `encryptedDek` TEXT NOT NULL,
    `sessionVersion` INTEGER NOT NULL DEFAULT 0,
    `failedAttempts` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `lastUnlockedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VaultAccount_adminId_key`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VaultItem` (
    `id` VARCHAR(191) NOT NULL,
    `vaultId` VARCHAR(191) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VaultItem_vaultId_idx`(`vaultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VaultAccount` ADD CONSTRAINT `VaultAccount_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VaultItem` ADD CONSTRAINT `VaultItem_vaultId_fkey` FOREIGN KEY (`vaultId`) REFERENCES `VaultAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
