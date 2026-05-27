/*
  Warnings:

  - You are about to drop the `documentitem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `documentitem` DROP FOREIGN KEY `documentitem_customerId_fkey`;

-- AlterTable
ALTER TABLE `paymentplan` ADD COLUMN `documentTemplateId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `documentitem`;

-- CreateTable
CREATE TABLE `documenttemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `scope` ENUM('GENERAL', 'PLAN') NOT NULL DEFAULT 'GENERAL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `documenttemplate_scope_idx`(`scope`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documenttemplateitem` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'รายการ',
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    INDEX `documenttemplateitem_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `paymentplan_documentTemplateId_idx` ON `paymentplan`(`documentTemplateId`);

-- AddForeignKey
ALTER TABLE `documenttemplateitem` ADD CONSTRAINT `documenttemplateitem_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `documenttemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentplan` ADD CONSTRAINT `paymentplan_documentTemplateId_fkey` FOREIGN KEY (`documentTemplateId`) REFERENCES `documenttemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
