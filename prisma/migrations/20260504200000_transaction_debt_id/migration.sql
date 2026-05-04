ALTER TABLE `Transaction` ADD COLUMN `debtId` VARCHAR(191) NULL;

CREATE INDEX `Transaction_debtId_idx` ON `Transaction`(`debtId`);

ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_debtId_fkey` FOREIGN KEY (`debtId`) REFERENCES `Debt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
