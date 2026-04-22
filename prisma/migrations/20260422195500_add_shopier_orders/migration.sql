CREATE TABLE `ShopierOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderCode` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `amountTry` DOUBLE NULL,
    `currency` VARCHAR(191) NULL DEFAULT 'TRY',
    `shopierPaymentId` VARCHAR(191) NULL,
    `rawPayload` JSON NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ShopierOrder_orderCode_key`(`orderCode`),
    INDEX `ShopierOrder_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `ShopierOrder_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ShopierOrder` ADD CONSTRAINT `ShopierOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
