/*
  Warnings:

  - You are about to drop the `workprogressitemmeta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `workprogressitemmeta` DROP FOREIGN KEY `workprogressitemmeta_itemId_fkey`;

-- DropTable
DROP TABLE `workprogressitemmeta`;
