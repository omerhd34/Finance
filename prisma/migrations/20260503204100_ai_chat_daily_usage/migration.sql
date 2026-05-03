CREATE TABLE `AiChatDailyUsage` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dayKey` VARCHAR(10) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AiChatDailyUsage_userId_idx`(`userId`),
    UNIQUE INDEX `AiChatDailyUsage_userId_dayKey_key`(`userId`, `dayKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


ALTER TABLE `AiChatDailyUsage` ADD CONSTRAINT `AiChatDailyUsage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;