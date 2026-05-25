-- ============================================================
-- Work Progress feature — consolidated migrations for prod import
-- Source migrations (รวมไว้ในไฟล์เดียวสำหรับ phpMyAdmin):
--   20260522034808_add_work_progress_core
--   20260522043309_add_work_progress_template
--   20260522050228_add_work_progress_rich_items
--   20260522054308_add_work_progress_activity
--   20260522091634_add_template_subtask
--   20260523053731_remove_work_progress_item_meta  (skip create itemmeta)
--
-- Prerequisites: ตาราง `customer` และ `user` ต้องมีอยู่บน prod DB
-- ก่อนรัน: BACKUP DB ก่อนทุกครั้ง
-- ถ้า prod เคยมี `workprogressitemmeta` อยู่ ให้รัน DROP แยก:
--   DROP TABLE IF EXISTS `workprogressitemmeta`;
-- ============================================================

SET FOREIGN_KEY_CHECKS=0;

-- ---------- Master data ----------
CREATE TABLE `workprogresscategory` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `workprogresscategory_code_key`(`code`),
    INDEX `workprogresscategory_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `workprogressstatus` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isTerminal` BOOLEAN NOT NULL DEFAULT false,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `workprogressstatus_code_key`(`code`),
    INDEX `workprogressstatus_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `workprogressmarktype` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `workprogressmarktype_code_key`(`code`),
    INDEX `workprogressmarktype_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------- Plan / Period ----------
CREATE TABLE `workprogressplan` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `periodType` ENUM('YEAR_12_MONTHS','YEAR_4_QUARTERS','HALF_2_PERIODS','CUSTOM') NOT NULL DEFAULT 'YEAR_12_MONTHS',
    `year` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `packageName` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    INDEX `workprogressplan_customerId_idx`(`customerId`),
    INDEX `workprogressplan_customerId_isArchived_idx`(`customerId`,`isArchived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `workprogressperiod` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `seq` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    INDEX `workprogressperiod_planId_idx`(`planId`),
    UNIQUE INDEX `workprogressperiod_planId_seq_key`(`planId`,`seq`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------- Item + period mark ----------
CREATE TABLE `workprogressitem` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `statusId` VARCHAR(191) NOT NULL,
    `activity` TEXT NOT NULL,
    `description` TEXT NULL,
    `progressPercent` INTEGER NOT NULL DEFAULT 0,
    `duration` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `weight` INTEGER NOT NULL DEFAULT 1,
    `startDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `assignedToId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `workprogressitem_planId_idx`(`planId`),
    INDEX `workprogressitem_categoryId_idx`(`categoryId`),
    INDEX `workprogressitem_statusId_idx`(`statusId`),
    INDEX `workprogressitem_assignedToId_idx`(`assignedToId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `workprogressitemperiodmark` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `periodId` VARCHAR(191) NOT NULL,
    `markTypeId` VARCHAR(191) NOT NULL,
    `progressPercent` INTEGER NULL,
    `note` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `workprogressitemperiodmark_itemId_idx`(`itemId`),
    INDEX `workprogressitemperiodmark_periodId_idx`(`periodId`),
    UNIQUE INDEX `workprogressitemperiodmark_itemId_periodId_key`(`itemId`,`periodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------- Subtask / Attachment ----------
CREATE TABLE `workprogresssubtask` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `isDone` BOOLEAN NOT NULL DEFAULT false,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `assignedToId` VARCHAR(191) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `workprogresssubtask_itemId_idx`(`itemId`),
    INDEX `workprogresssubtask_assignedToId_idx`(`assignedToId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `workprogressattachment` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `filename` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NULL,
    `sizeBytes` INTEGER NULL,
    `caption` TEXT NULL,
    `uploadedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `workprogressattachment_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------- Activity log ----------
CREATE TABLE `workprogressactivity` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `diff` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `workprogressactivity_planId_idx`(`planId`),
    INDEX `workprogressactivity_planId_createdAt_idx`(`planId`,`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------- Template ----------
CREATE TABLE `workprogresstemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `periodType` ENUM('YEAR_12_MONTHS','YEAR_4_QUARTERS','HALF_2_PERIODS','CUSTOM') NOT NULL DEFAULT 'YEAR_12_MONTHS',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `workprogresstemplate_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

CREATE TABLE `workprogresstemplatesubtask` (
    `id` VARCHAR(191) NOT NULL,
    `templateItemId` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `workprogresstemplatesubtask_templateItemId_idx`(`templateItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- Foreign keys
-- ============================================================
ALTER TABLE `workprogressplan`
  ADD CONSTRAINT `workprogressplan_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressplan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `workprogressperiod`
  ADD CONSTRAINT `workprogressperiod_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `workprogressitem`
  ADD CONSTRAINT `workprogressitem_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressitem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `workprogresscategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressitem_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `workprogressstatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressitem_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `workprogressitemperiodmark`
  ADD CONSTRAINT `workprogressitemperiodmark_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressitemperiodmark_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `workprogressperiod`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressitemperiodmark_markTypeId_fkey` FOREIGN KEY (`markTypeId`) REFERENCES `workprogressmarktype`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `workprogresssubtask`
  ADD CONSTRAINT `workprogresssubtask_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogresssubtask_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `workprogressattachment`
  ADD CONSTRAINT `workprogressattachment_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressattachment_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `workprogressactivity`
  ADD CONSTRAINT `workprogressactivity_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogressactivity_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `workprogresstemplate`
  ADD CONSTRAINT `workprogresstemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `workprogresstemplateitem`
  ADD CONSTRAINT `workprogresstemplateitem_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `workprogresstemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `workprogresstemplateitem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `workprogresscategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `workprogresstemplatesubtask`
  ADD CONSTRAINT `workprogresstemplatesubtask_templateItemId_fkey` FOREIGN KEY (`templateItemId`) REFERENCES `workprogresstemplateitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
