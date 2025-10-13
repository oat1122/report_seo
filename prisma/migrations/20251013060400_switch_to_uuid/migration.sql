/*
  Warnings:

  - The primary key for the `customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `keywordreport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `overallmetrics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `paymentproof` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `customer` DROP FOREIGN KEY `Customer_seoDevId_fkey`;

-- DropForeignKey
ALTER TABLE `customer` DROP FOREIGN KEY `Customer_userId_fkey`;

-- DropForeignKey
ALTER TABLE `keywordreport` DROP FOREIGN KEY `KeywordReport_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `overallmetrics` DROP FOREIGN KEY `OverallMetrics_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentproof` DROP FOREIGN KEY `PaymentProof_customerId_fkey`;

-- DropIndex
DROP INDEX `Customer_seoDevId_fkey` ON `customer`;

-- DropIndex
DROP INDEX `KeywordReport_customerId_fkey` ON `keywordreport`;

-- DropIndex
DROP INDEX `PaymentProof_customerId_fkey` ON `paymentproof`;

-- AlterTable
ALTER TABLE `customer` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `seoDevId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `keywordreport` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `customerId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `overallmetrics` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `customerId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `paymentproof` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `customerId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_seoDevId_fkey` FOREIGN KEY (`seoDevId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverallMetrics` ADD CONSTRAINT `OverallMetrics_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KeywordReport` ADD CONSTRAINT `KeywordReport_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProof` ADD CONSTRAINT `PaymentProof_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
