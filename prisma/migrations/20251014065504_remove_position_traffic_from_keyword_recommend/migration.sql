/*
  Warnings:

  - You are about to drop the column `position` on the `keywordrecommend` table. All the data in the column will be lost.
  - You are about to drop the column `traffic` on the `keywordrecommend` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `keywordrecommend` DROP COLUMN `position`,
    DROP COLUMN `traffic`;
