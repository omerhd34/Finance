ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_recurringRuleId_fkey`;

DROP INDEX `Transaction_recurringRuleId_date_key` ON `Transaction`;

ALTER TABLE `Transaction` ADD COLUMN `recurringSlotKey` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Transaction_recurringSlotKey_key` ON `Transaction` (`recurringSlotKey`);

ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_recurringRuleId_fkey` FOREIGN KEY (`recurringRuleId`) REFERENCES `RecurringRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
