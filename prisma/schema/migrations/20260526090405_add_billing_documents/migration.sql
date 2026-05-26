-- AlterTable
ALTER TABLE `customer` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `contactName` VARCHAR(191) NULL,
    ADD COLUMN `taxId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `companysettings` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `taxId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentitem` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'รายการ',
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `documentitem_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billingdocument` (
    `id` VARCHAR(191) NOT NULL,
    `documentNumber` VARCHAR(191) NOT NULL,
    `type` ENUM('BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE') NOT NULL,
    `pdfUrl` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `note` TEXT NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customerId` VARCHAR(191) NOT NULL,
    `billingCycleId` VARCHAR(191) NULL,

    UNIQUE INDEX `billingdocument_documentNumber_key`(`documentNumber`),
    INDEX `billingdocument_customerId_idx`(`customerId`),
    INDEX `billingdocument_billingCycleId_idx`(`billingCycleId`),
    INDEX `billingdocument_type_generatedAt_idx`(`type`, `generatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentsequence` (
    `id` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `lastSeq` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `documentsequence_prefix_year_key`(`prefix`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `documentitem` ADD CONSTRAINT `documentitem_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billingdocument` ADD CONSTRAINT `billingdocument_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `billingdocument` ADD CONSTRAINT `billingdocument_billingCycleId_fkey` FOREIGN KEY (`billingCycleId`) REFERENCES `billingcycle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
