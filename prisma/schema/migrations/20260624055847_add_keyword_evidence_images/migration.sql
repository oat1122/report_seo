-- CreateTable
CREATE TABLE `keywordreportimage` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `keywordReportId` VARCHAR(191) NOT NULL,

    INDEX `keywordreportimage_keywordReportId_idx`(`keywordReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `keywordreportimage` ADD CONSTRAINT `keywordreportimage_keywordReportId_fkey` FOREIGN KEY (`keywordReportId`) REFERENCES `keywordreport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
