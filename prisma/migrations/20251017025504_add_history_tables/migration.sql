-- CreateTable
CREATE TABLE `OverallMetricsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `domainRating` INTEGER NOT NULL,
    `healthScore` INTEGER NOT NULL,
    `ageInYears` INTEGER NOT NULL,
    `spamScore` INTEGER NOT NULL,
    `organicTraffic` DOUBLE NOT NULL,
    `organicKeywords` DOUBLE NOT NULL,
    `backlinks` INTEGER NOT NULL,
    `refDomains` INTEGER NOT NULL,
    `dateRecorded` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customerId` VARCHAR(191) NOT NULL,

    INDEX `OverallMetricsHistory_customerId_idx`(`customerId`),
    INDEX `OverallMetricsHistory_dateRecorded_idx`(`dateRecorded`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KeywordReportHistory` (
    `id` VARCHAR(191) NOT NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `position` INTEGER NULL,
    `traffic` INTEGER NOT NULL,
    `kd` ENUM('HARD', 'MEDIUM', 'EASY') NOT NULL,
    `isTopReport` BOOLEAN NOT NULL,
    `dateRecorded` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reportId` VARCHAR(191) NOT NULL,

    INDEX `KeywordReportHistory_reportId_idx`(`reportId`),
    INDEX `KeywordReportHistory_dateRecorded_idx`(`dateRecorded`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OverallMetricsHistory` ADD CONSTRAINT `OverallMetricsHistory_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KeywordReportHistory` ADD CONSTRAINT `KeywordReportHistory_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `KeywordReport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
