-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE `workprogressplan` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `periodType` ENUM('YEAR_12_MONTHS', 'YEAR_4_QUARTERS', 'HALF_2_PERIODS', 'CUSTOM') NOT NULL DEFAULT 'YEAR_12_MONTHS',
    `year` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `packageName` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,

    INDEX `workprogressplan_customerId_idx`(`customerId`),
    INDEX `workprogressplan_customerId_isArchived_idx`(`customerId`, `isArchived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workprogressperiod` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `seq` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,

    INDEX `workprogressperiod_planId_idx`(`planId`),
    UNIQUE INDEX `workprogressperiod_planId_seq_key`(`planId`, `seq`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `workprogressitem_planId_idx`(`planId`),
    INDEX `workprogressitem_categoryId_idx`(`categoryId`),
    INDEX `workprogressitem_statusId_idx`(`statusId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
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
    UNIQUE INDEX `workprogressitemperiodmark_itemId_periodId_key`(`itemId`, `periodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workprogressplan` ADD CONSTRAINT `workprogressplan_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressperiod` ADD CONSTRAINT `workprogressperiod_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressitem` ADD CONSTRAINT `workprogressitem_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressitem` ADD CONSTRAINT `workprogressitem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `workprogresscategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressitem` ADD CONSTRAINT `workprogressitem_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `workprogressstatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressitemperiodmark` ADD CONSTRAINT `workprogressitemperiodmark_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressitemperiodmark` ADD CONSTRAINT `workprogressitemperiodmark_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `workprogressperiod`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressitemperiodmark` ADD CONSTRAINT `workprogressitemperiodmark_markTypeId_fkey` FOREIGN KEY (`markTypeId`) REFERENCES `workprogressmarktype`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
