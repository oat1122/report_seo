-- AlterTable
ALTER TABLE `workprogressitem` ADD COLUMN `assignedToId` VARCHAR(191) NULL;

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE `workprogressitemmeta` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `valueType` VARCHAR(191) NOT NULL DEFAULT 'string',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `workprogressitemmeta_itemId_idx`(`itemId`),
    UNIQUE INDEX `workprogressitemmeta_itemId_key_key`(`itemId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `workprogressitem_assignedToId_idx` ON `workprogressitem`(`assignedToId`);

-- AddForeignKey
ALTER TABLE `workprogressitem` ADD CONSTRAINT `workprogressitem_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogresssubtask` ADD CONSTRAINT `workprogresssubtask_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogresssubtask` ADD CONSTRAINT `workprogresssubtask_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressattachment` ADD CONSTRAINT `workprogressattachment_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressattachment` ADD CONSTRAINT `workprogressattachment_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workprogressitemmeta` ADD CONSTRAINT `workprogressitemmeta_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
