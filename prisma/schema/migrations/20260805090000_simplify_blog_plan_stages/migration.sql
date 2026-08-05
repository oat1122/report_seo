-- ลดขั้นตอน blog plan จาก 7 เหลือ 5 (+ โหมด fast track ขั้นเดียวต่อลูกค้า)
-- ข้อมูลเดิม: SUBMIT_ARTWORK -> SUBMIT_FINAL · CLIENT_FINAL_APPROVAL / UPLOAD_ON_WEBSITE ถูกลบทิ้ง

-- 1) ลบงานของสองขั้นที่ตัดออก (ไฟล์ที่ผูก submission ถูกลบตาม cascade)
DELETE FROM `blogarticlesubmission` WHERE `stageCode` IN ('CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE');
DELETE FROM `blogarticlefeedback` WHERE `stageCode` IN ('CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE');
DELETE FROM `blogarticlestage` WHERE `stageCode` IN ('CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE');

-- 2) ขยาย enum ชั่วคราวให้มี SUBMIT_FINAL ก่อน แล้วย้ายข้อมูลของ SUBMIT_ARTWORK มาเป็นขั้น final
ALTER TABLE `blogarticlestage` MODIFY `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_ARTWORK', 'CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE', 'SUBMIT_FINAL') NOT NULL;
ALTER TABLE `blogarticlesubmission` MODIFY `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_ARTWORK', 'CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE', 'SUBMIT_FINAL') NOT NULL;
ALTER TABLE `blogarticlefeedback` MODIFY `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_ARTWORK', 'CLIENT_FINAL_APPROVAL', 'UPLOAD_ON_WEBSITE', 'SUBMIT_FINAL') NOT NULL;

UPDATE `blogarticlestage` SET `stageCode` = 'SUBMIT_FINAL' WHERE `stageCode` = 'SUBMIT_ARTWORK';
UPDATE `blogarticlesubmission` SET `stageCode` = 'SUBMIT_FINAL' WHERE `stageCode` = 'SUBMIT_ARTWORK';
UPDATE `blogarticlefeedback` SET `stageCode` = 'SUBMIT_FINAL' WHERE `stageCode` = 'SUBMIT_ARTWORK';

-- 3) หด enum เหลือ 5 ค่าตาม schema ใหม่
-- AlterTable
ALTER TABLE `blogarticlestage` MODIFY `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_FINAL') NOT NULL;

-- AlterTable
ALTER TABLE `blogarticlesubmission` MODIFY `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_FINAL') NOT NULL;

-- AlterTable
ALTER TABLE `blogarticlefeedback` MODIFY `stageCode` ENUM('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_FINAL') NOT NULL;

-- 4) status APPROVED เข้าไม่ถึงแล้ว (ไม่มีขั้นอนุมัติสุดท้าย) — บทความที่ค้างสถานะนี้กลับไปกำลังดำเนินการ
UPDATE `blogarticle` SET `status` = 'IN_PROGRESS' WHERE `status` = 'APPROVED';

-- AlterTable
ALTER TABLE `blogarticle` MODIFY `status` ENUM('DRAFT', 'IN_PROGRESS', 'WAITING_CLIENT', 'CHANGES_REQUESTED', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT';

-- 5) โหมดตรวจงานต่อลูกค้า — ค่าเริ่มต้น = ต้องตรวจ (พฤติกรรมเดิม)
-- AlterTable
ALTER TABLE `customer` ADD COLUMN `blogRequiresApproval` BOOLEAN NOT NULL DEFAULT true;
