-- =====================================================================
-- Combined deployment migration
-- Generated from prisma/schema/migrations (timestamp order):
--   20260529034430_remove_document_templates
--   20260529042719_add_billing_document_items
--   20260529045232_add_customer_phone
--   20260529053219_add_customer_phone_and_document_dates
--   20260529143453_add_work_progress_recurrence_and_scheduled_date
-- =====================================================================

-- ---------------------------------------------------------------------
-- 20260529034430_remove_document_templates
-- ---------------------------------------------------------------------

-- DropForeignKey
ALTER TABLE `documenttemplateitem` DROP FOREIGN KEY `documenttemplateitem_templateId_fkey`;

-- DropForeignKey
ALTER TABLE `paymentplan` DROP FOREIGN KEY `paymentplan_documentTemplateId_fkey`;

-- DropIndex
DROP INDEX `paymentplan_documentTemplateId_idx` ON `paymentplan`;

-- AlterTable
ALTER TABLE `paymentplan` DROP COLUMN `documentTemplateId`;

-- DropTable
DROP TABLE `documenttemplate`;

-- DropTable
DROP TABLE `documenttemplateitem`;

-- ---------------------------------------------------------------------
-- 20260529042719_add_billing_document_items
-- ---------------------------------------------------------------------

-- AlterTable
ALTER TABLE `billingdocument` ADD COLUMN `items` JSON NULL;

-- ---------------------------------------------------------------------
-- 20260529045232_add_customer_phone
-- ---------------------------------------------------------------------

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `phone` VARCHAR(191) NULL;

-- ---------------------------------------------------------------------
-- 20260529053219_add_customer_phone_and_document_dates
-- ---------------------------------------------------------------------

-- AlterTable
ALTER TABLE `billingdocument` ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `paidDate` DATETIME(3) NULL;

-- ---------------------------------------------------------------------
-- 20260529143453_add_work_progress_recurrence_and_scheduled_date
-- ---------------------------------------------------------------------

-- AlterTable
ALTER TABLE `billingdocument` ADD COLUMN `includeVat` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `workprogressitem` ADD COLUMN `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `recurrenceDayOfMonth` INTEGER NULL,
    ADD COLUMN `recurrenceFreq` VARCHAR(191) NULL,
    ADD COLUMN `recurrenceInterval` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `workprogressitemperiodmark` ADD COLUMN `scheduledDate` DATETIME(3) NULL;
