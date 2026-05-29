/*
  Warnings:

  - You are about to drop the column `documentTemplateId` on the `paymentplan` table. All the data in the column will be lost.
  - You are about to drop the `documenttemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documenttemplateitem` table. If the table is not empty, all the data it contains will be lost.

*/
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
