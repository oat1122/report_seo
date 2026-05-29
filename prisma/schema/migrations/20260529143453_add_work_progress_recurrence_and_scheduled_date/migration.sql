-- AlterTable
ALTER TABLE `billingdocument` ADD COLUMN `includeVat` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `workprogressitem` ADD COLUMN `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `recurrenceDayOfMonth` INTEGER NULL,
    ADD COLUMN `recurrenceFreq` VARCHAR(191) NULL,
    ADD COLUMN `recurrenceInterval` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `workprogressitemperiodmark` ADD COLUMN `scheduledDate` DATETIME(3) NULL;
