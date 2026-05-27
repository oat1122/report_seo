-- AlterTable
ALTER TABLE `billingdocument` ADD COLUMN `customerName` VARCHAR(191) NULL,
    MODIFY `customerId` VARCHAR(191) NULL;
