ALTER TABLE `AiFinanceChatTurn` ADD COLUMN `conversationId` VARCHAR(191) NULL;

UPDATE `AiFinanceChatTurn` SET `conversationId` = `id` WHERE `conversationId` IS NULL;

CREATE INDEX `AiFinanceChatTurn_userId_conversationId_idx` ON `AiFinanceChatTurn`(`userId`, `conversationId`);
