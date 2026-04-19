SET @fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE constraint_schema = DATABASE()
    AND table_name = 'Transaction'
    AND constraint_name = 'Transaction_recurringRuleId_fkey'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql := IF(
  @fk > 0,
  'ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_recurringRuleId_fkey`',
  'SELECT 1'
);
PREPARE s FROM @sql;
EXECUTE s;
DEALLOCATE PREPARE s;

SET @idx := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'Transaction'
    AND index_name = 'Transaction_recurringRuleId_date_key'
);
SET @sql := IF(
  @idx > 0,
  'ALTER TABLE `Transaction` DROP INDEX `Transaction_recurringRuleId_date_key`',
  'SELECT 1'
);
PREPARE s FROM @sql;
EXECUTE s;
DEALLOCATE PREPARE s;

SET @idx := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'Transaction'
    AND index_name = 'Transaction_recurringSlotKey_key'
);
SET @sql := IF(
  @idx > 0,
  'ALTER TABLE `Transaction` DROP INDEX `Transaction_recurringSlotKey_key`',
  'SELECT 1'
);
PREPARE s FROM @sql;
EXECUTE s;
DEALLOCATE PREPARE s;

SET @col := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'Transaction'
    AND column_name = 'recurringRuleId'
);
SET @sql := IF(
  @col = 0,
  'ALTER TABLE `Transaction` ADD COLUMN `recurringRuleId` VARCHAR(191) NULL',
  'SELECT 1'
);
PREPARE s FROM @sql;
EXECUTE s;
DEALLOCATE PREPARE s;

SET @col := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'Transaction'
    AND column_name = 'recurringSlotKey'
);
SET @sql := IF(
  @col = 0,
  'ALTER TABLE `Transaction` ADD COLUMN `recurringSlotKey` VARCHAR(191) NULL',
  'SELECT 1'
);
PREPARE s FROM @sql;
EXECUTE s;
DEALLOCATE PREPARE s;

SET @idx := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'Transaction'
    AND index_name = 'Transaction_recurringSlotKey_key'
);
SET @sql := IF(
  @idx = 0,
  'CREATE UNIQUE INDEX `Transaction_recurringSlotKey_key` ON `Transaction` (`recurringSlotKey`)',
  'SELECT 1'
);
PREPARE s FROM @sql;
EXECUTE s;
DEALLOCATE PREPARE s;

SET @fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE constraint_schema = DATABASE()
    AND table_name = 'Transaction'
    AND constraint_name = 'Transaction_recurringRuleId_fkey'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql := IF(
  @fk = 0,
  'ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_recurringRuleId_fkey` FOREIGN KEY (`recurringRuleId`) REFERENCES `RecurringRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE s FROM @sql;
EXECUTE s;
DEALLOCATE PREPARE s;
