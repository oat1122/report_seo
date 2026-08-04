-- AlterTable
ALTER TABLE `customer` ADD COLUMN `articlesPerMonth` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `blogWriterId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'SEO_DEV', 'CUSTOMER', 'BLOG_WRITER') NOT NULL;

-- CreateTable
CREATE TABLE `blogarticle` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `keyFocus` VARCHAR(191) NULL,
    `targetYear` INTEGER NOT NULL,
    `targetMonth` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'IN_PROGRESS', 'WAITING_CLIENT', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NULL,
    `publishedUrl` TEXT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NULL,

    INDEX `blogarticle_customerId_idx`(`customerId`),
    INDEX `blogarticle_customerId_targetYear_targetMonth_idx`(`customerId`, `targetYear`, `targetMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogarticlekeyword` (
    `id` VARCHAR(191) NOT NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `source` ENUM('REPORT', 'RECOMMEND', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    `sourceId` VARCHAR(191) NULL,
    `articleId` VARCHAR(191) NOT NULL,

    INDEX `blogarticlekeyword_articleId_idx`(`articleId`),
    INDEX `blogarticlekeyword_keyword_idx`(`keyword`),
    UNIQUE INDEX `blogarticlekeyword_articleId_keyword_key`(`articleId`, `keyword`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogarticlestage` (
    `id` VARCHAR(191) NOT NULL,
    `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_ARTWORK', 'CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE') NOT NULL,
    `seq` INTEGER NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NULL,
    `note` TEXT NULL,
    `articleId` VARCHAR(191) NOT NULL,

    INDEX `blogarticlestage_articleId_idx`(`articleId`),
    UNIQUE INDEX `blogarticlestage_articleId_stageCode_key`(`articleId`, `stageCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogarticlefile` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('COVER_IMAGE', 'ARTICLE_DOC') NOT NULL,
    `url` TEXT NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `version` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `articleId` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NULL,

    INDEX `blogarticlefile_articleId_kind_idx`(`articleId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogarticlefeedback` (
    `id` VARCHAR(191) NOT NULL,
    `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_ARTWORK', 'CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE') NOT NULL,
    `decision` ENUM('APPROVED', 'CHANGES_REQUESTED') NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `articleId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,

    INDEX `blogarticlefeedback_articleId_idx`(`articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blogarticle` ADD CONSTRAINT `blogarticle_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticle` ADD CONSTRAINT `blogarticle_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlekeyword` ADD CONSTRAINT `blogarticlekeyword_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `blogarticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlestage` ADD CONSTRAINT `blogarticlestage_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `blogarticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlefile` ADD CONSTRAINT `blogarticlefile_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `blogarticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlefile` ADD CONSTRAINT `blogarticlefile_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlefeedback` ADD CONSTRAINT `blogarticlefeedback_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `blogarticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogarticlefeedback` ADD CONSTRAINT `blogarticlefeedback_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_blogWriterId_fkey` FOREIGN KEY (`blogWriterId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
