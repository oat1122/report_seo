-- AlterTable
ALTER TABLE `workprogressplan` ADD COLUMN `createdById` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `workprogresstemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `periodType` ENUM('YEAR_12_MONTHS', 'YEAR_4_QUARTERS', 'HALF_2_PERIODS', 'CUSTOM') NOT NULL DEFAULT 'YEAR_12_MONTHS',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `workprogresstemplate_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workprogresstemplateitem` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `activity` TEXT NOT NULL,
    `description` TEXT NULL,
    `duration` VARCHAR(191) NULL,
    `weight` INTEGER NOT NULL DEFAULT 1,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `defaultPeriods` JSON NULL,

    INDEX `workprogresstemplateitem_templateId_idx`(`templateId`),
    INDEX `workprogresstemplateitem_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workprogressplan` ADD CONSTRAINT `workprogressplan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogresstemplate` ADD CONSTRAINT `workprogresstemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogresstemplateitem` ADD CONSTRAINT `workprogresstemplateitem_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `workprogresstemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogresstemplateitem` ADD CONSTRAINT `workprogresstemplateitem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `workprogresscategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
