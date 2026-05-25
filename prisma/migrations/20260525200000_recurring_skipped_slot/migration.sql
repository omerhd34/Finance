CREATE TABLE `RecurringSkippedSlot` (
    `id` VARCHAR(191) NOT NULL,
    `ruleId` VARCHAR(191) NOT NULL,
    `slotKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RecurringSkippedSlot_ruleId_slotKey_key`(`ruleId`, `slotKey`),
    INDEX `RecurringSkippedSlot_ruleId_idx`(`ruleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `RecurringSkippedSlot` ADD CONSTRAINT `RecurringSkippedSlot_ruleId_fkey` FOREIGN KEY (`ruleId`) REFERENCES `RecurringRule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
