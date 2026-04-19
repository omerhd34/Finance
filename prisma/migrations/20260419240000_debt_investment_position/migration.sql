CREATE TABLE `Debt` (
    `id` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `counterparty` VARCHAR(191) NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `paidAmount` DOUBLE NOT NULL DEFAULT 0,
    `dueDate` DATETIME(3) NULL,
    `note` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Debt_userId_direction_idx`(`userId`, `direction`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Debt` ADD CONSTRAINT `Debt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `InvestmentPosition` (
    `id` VARCHAR(191) NOT NULL,
    `assetType` VARCHAR(191) NOT NULL,
    `goldSubtype` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `ticker` VARCHAR(191) NULL,
    `quantity` DOUBLE NOT NULL,
    `avgCostPerUnitTry` DOUBLE NOT NULL,
    `marketPricePerUnitTry` DOUBLE NULL,
    `note` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `InvestmentPosition_userId_assetType_idx`(`userId`, `assetType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `InvestmentPosition` ADD CONSTRAINT `InvestmentPosition_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
