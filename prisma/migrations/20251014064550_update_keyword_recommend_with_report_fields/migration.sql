-- AlterTable
ALTER TABLE `keywordrecommend` ADD COLUMN `isTopReport` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `kd` ENUM('HARD', 'MEDIUM', 'EASY') NULL,
    ADD COLUMN `position` INTEGER NULL,
    ADD COLUMN `traffic` INTEGER NULL;
