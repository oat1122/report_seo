-- เพิ่มตาราง keywordreportimage (รูปหลักฐานรายคีย์เวิร์ด) แบบ additive
-- repo นี้ใช้ db push / DB มี drift จาก branch อื่น — สร้างตารางตรง ๆ ไม่ reset ไม่ push
-- รันด้วย: npx prisma db execute --file ./prisma/manual/keyword_evidence.sql --schema ./prisma/schema

CREATE TABLE `keywordreportimage` (
  `id` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `keywordReportId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `keywordreportimage_keywordReportId_idx` (`keywordReportId`),
  CONSTRAINT `keywordreportimage_keywordReportId_fkey`
    FOREIGN KEY (`keywordReportId`) REFERENCES `keywordreport`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
