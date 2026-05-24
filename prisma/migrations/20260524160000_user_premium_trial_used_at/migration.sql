ALTER TABLE `User` ADD COLUMN `premiumTrialUsedAt` DATETIME(3) NULL;

UPDATE `User`
SET `premiumTrialUsedAt` = COALESCE(`premiumUntil`, `createdAt`)
WHERE (`planTier` = 'premium' OR `premiumUntil` IS NOT NULL)
  AND `premiumTrialUsedAt` IS NULL;
