DROP INDEX `Transaction_recurringRuleId_date_key` ON `Transaction`;

ALTER TABLE `Transaction` ADD COLUMN `recurringSlotKey` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Transaction_recurringSlotKey_key` ON `Transaction` (`recurringSlotKey`);
