ALTER TABLE `User` ADD COLUMN `premiumUntil` DATETIME(3) NULL;

UPDATE `User`
SET `premiumUntil` = DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 30 DAY)
WHERE `planTier` = 'premium' AND `premiumUntil` IS NULL;
