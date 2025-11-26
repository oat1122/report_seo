-- AlterTable
ALTER TABLE `overallmetrics` ADD COLUMN `ageInMonths` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `overallmetricshistory` ADD COLUMN `ageInMonths` INTEGER NOT NULL DEFAULT 0;
