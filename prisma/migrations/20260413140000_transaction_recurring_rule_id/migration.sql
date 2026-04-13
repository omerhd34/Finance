ALTER TABLE `Transaction` ADD COLUMN `recurringRuleId` VARCHAR(191) NULL;

ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_recurringRuleId_fkey` FOREIGN KEY (`recurringRuleId`) REFERENCES `RecurringRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX `Transaction_recurringRuleId_date_key` ON `Transaction` (`recurringRuleId`, `date`);
