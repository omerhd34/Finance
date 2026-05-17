ALTER TABLE `User` ADD COLUMN `lastActiveAt` DATETIME(3) NULL;

UPDATE `User` u
SET `lastActiveAt` = (
  SELECT MAX(latest) FROM (
    SELECT MAX(`createdAt`) AS latest FROM `Transaction` WHERE `userId` = u.`id`
    UNION ALL
    SELECT MAX(`createdAt`) FROM `RecurringRule` WHERE `userId` = u.`id`
    UNION ALL
    SELECT MAX(`createdAt`) FROM `Debt` WHERE `userId` = u.`id`
    UNION ALL
    SELECT MAX(`createdAt`) FROM `InvestmentPosition` WHERE `userId` = u.`id`
    UNION ALL
    SELECT MAX(`createdAt`) FROM `ShopierOrder` WHERE `userId` = u.`id`
  ) AS all_dates
  WHERE latest IS NOT NULL
);

UPDATE `User`
SET `lastActiveAt` = `createdAt`
WHERE `lastActiveAt` IS NULL;