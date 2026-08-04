-- AlterTable
ALTER TABLE `blogarticlefile` ADD COLUMN `submissionId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `blogarticlesubmission` (
    `id` VARCHAR(191) NOT NULL,
    `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_ARTWORK', 'CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE') NOT NULL,
    `round` INTEGER NOT NULL,
    `message` TEXT NULL,
    `linkUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `articleId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    INDEX `blogarticlesubmission_articleId_idx`(`articleId`),
    UNIQUE INDEX `blogarticlesubmission_articleId_stageCode_round_key`(`articleId`, `stageCode`, `round`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blogarticlesubmission` ADD CONSTRAINT `blogarticlesubmission_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `blogarticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlesubmission` ADD CONSTRAINT `blogarticlesubmission_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlefile` ADD CONSTRAINT `blogarticlefile_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `blogarticlesubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
