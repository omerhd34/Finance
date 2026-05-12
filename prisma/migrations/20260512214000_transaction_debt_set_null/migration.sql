ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_debtId_fkey`;

ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_debtId_fkey` FOREIGN KEY (`debtId`) REFERENCES `Debt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
