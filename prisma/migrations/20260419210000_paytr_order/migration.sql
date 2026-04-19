CREATE TABLE `PaytrOrder` (
    `id` VARCHAR(191) NOT NULL,
    `merchantOid` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amountKurus` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TL',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaytrOrder_merchantOid_key`(`merchantOid`),
    INDEX `PaytrOrder_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PaytrOrder` ADD CONSTRAINT `PaytrOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
