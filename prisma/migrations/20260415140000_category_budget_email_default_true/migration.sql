ALTER TABLE `CategoryBudget` MODIFY `emailAlertsEnabled` BOOLEAN NOT NULL DEFAULT true;
UPDATE `CategoryBudget` SET `emailAlertsEnabled` = true;
