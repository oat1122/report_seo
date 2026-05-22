-- CreateTable
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

-- AddForeignKey
ALTER TABLE `workprogresstemplatesubtask` ADD CONSTRAINT `workprogresstemplatesubtask_templateItemId_fkey` FOREIGN KEY (`templateItemId`) REFERENCES `workprogresstemplateitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
