-- CreateTable
CREATE TABLE `customernextstepimage` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nextStepId` VARCHAR(191) NOT NULL,

    INDEX `customernextstepimage_nextStepId_idx`(`nextStepId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `customernextstepimage` ADD CONSTRAINT `customernextstepimage_nextStepId_fkey` FOREIGN KEY (`nextStepId`) REFERENCES `customernextstep`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
