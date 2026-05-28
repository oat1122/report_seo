/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: seo_nohack
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('0c01336a-f97d-4a83-bee7-0bcacdfcaa60','17d2550c6bb4b7997967670e08a7fd76542941d208a448fc2f0d3b3d74758378','2026-05-25 04:22:02.260','20260522054308_add_work_progress_activity','',NULL,'2026-05-25 04:22:02.260',0),
('3c71ba80-07fe-4087-a64b-7d5cd16db414','b29346a7fda74f075ca8fd818a7ce865e987b84631d6cd06ffe114467a51be45',NULL,'20260521155738_init','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260521155738_init\n\nDatabase error code: 1050\n\nDatabase error:\nTable \'user\' already exists\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260521155738_init\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260521155738_init\"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260',NULL,'2026-05-27 08:45:54.940',0),
('4e23c24b-6a65-4b09-96ff-0f459092116c','81fd9fe79c5dca330e13548a8d9e64bb263796a231f6731f0e0ce5d66da98581','2026-05-25 04:22:06.339','20260523053731_remove_work_progress_item_meta','',NULL,'2026-05-25 04:22:06.339',0),
('6092ff27-8a27-440a-a4b1-9ea23844ca6f','2a4947ecfa8160137703768378d0bda5d1e46021176555c1ea147d7980202343','2026-05-25 04:22:00.228','20260522050228_add_work_progress_rich_items','',NULL,'2026-05-25 04:22:00.228',0),
('774a8d87-bac7-4654-8ac1-fc8e83c28ffe','5b06d231214ba1512b36389d82ad26e1d15227990cbc4aac0804b6d7c2099001','2026-05-25 04:22:04.250','20260522091634_add_template_subtask','',NULL,'2026-05-25 04:22:04.250',0),
('90b99a3e-4c90-44bc-8fc4-91018161fc42','e0999929f88a5eb0380659ee5d6d0f610370e12982d2e10a66c31ed4fab563d1','2026-05-25 04:21:57.936','20260522043309_add_work_progress_template','',NULL,'2026-05-25 04:21:57.936',0),
('c05411ae-d63e-4ca6-a6e3-83588ea36e2b','9d2a30be73f84ce68369f3ed97fedc6a9ac2180b0f03912c7e02e10a014c6e7d','2026-05-25 04:21:55.806','20260522034808_add_work_progress_core','',NULL,'2026-05-25 04:21:55.806',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  KEY `account_userId_fkey` (`userId`),
  CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aioverview`
--

DROP TABLE IF EXISTS `aioverview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aioverview` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `customerId` varchar(191) NOT NULL,
  `displayDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `aioverview_customerId_idx` (`customerId`),
  CONSTRAINT `aioverview_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aioverview`
--

LOCK TABLES `aioverview` WRITE;
/*!40000 ALTER TABLE `aioverview` DISABLE KEYS */;
INSERT INTO `aioverview` VALUES
('13c12bed-9fa5-4184-a7e4-cae78883bd83','keyword เทคนิครักษาเสื้อ','2026-02-12 09:21:33.929','68212a2c-e01b-48a3-877b-aebb07ea28d4','2026-02-03 09:21:17.173'),
('4aac9df7-5d03-4f6a-a964-46cc5a39e3d5','AEO Brand โหมด AI google','2026-05-25 02:49:39.351','dacaddf6-870a-4dba-9950-4856a0e5be49','2026-05-25 02:40:40.948'),
('a73c43db-b014-4976-b7a6-49308f92ea03','keyword ผลิตเสื้อขั้นต่ำเท่าไหร่','2026-02-12 09:21:16.833','68212a2c-e01b-48a3-877b-aebb07ea28d4','2026-02-02 09:20:43.510'),
('b53df491-4890-4ec5-a28b-d6a117987708','keyword สีสกรีนเสื้อ ยี่ห้อไหนดี','2026-02-12 09:20:45.129','68212a2c-e01b-48a3-877b-aebb07ea28d4','2026-02-01 09:20:03.614'),
('c78c1260-ad67-46b0-a0ba-7bd1c77f86dd','keyword ผลิตเสื้อยืดที่ไหนดี','2026-02-12 09:26:30.353','68212a2c-e01b-48a3-877b-aebb07ea28d4','2026-02-12 09:25:41.905'),
('cda0f7cf-db3f-487c-9e34-4d9f24f13743','keyword วิธีดูแลเสื้อยืด','2026-02-12 09:26:00.353','68212a2c-e01b-48a3-877b-aebb07ea28d4','2026-02-07 09:25:05.669'),
('f4307a52-303d-43eb-8534-982bd1665f97','keyword เสื้อขาว ได้ติด Ai Overview 2 Blog','2026-02-12 06:07:06.420','68212a2c-e01b-48a3-877b-aebb07ea28d4','2026-02-01 16:10:36.769');
/*!40000 ALTER TABLE `aioverview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aioverviewimage`
--

DROP TABLE IF EXISTS `aioverviewimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aioverviewimage` (
  `id` varchar(191) NOT NULL,
  `imageUrl` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `aiOverviewId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aioverviewimage_aiOverviewId_idx` (`aiOverviewId`),
  CONSTRAINT `aioverviewimage_aiOverviewId_fkey` FOREIGN KEY (`aiOverviewId`) REFERENCES `aioverview` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aioverviewimage`
--

LOCK TABLES `aioverviewimage` WRITE;
/*!40000 ALTER TABLE `aioverviewimage` DISABLE KEYS */;
INSERT INTO `aioverviewimage` VALUES
('1fe43775-40f7-463a-aa40-19a42d261e32','/uploads/ai-overview/_________________________1770888076831.jpg','2026-02-12 09:21:16.833','a73c43db-b014-4976-b7a6-49308f92ea03'),
('37efba7b-c49d-4a72-81f9-7f4a864f069c','/uploads/ai-overview/_________________1770888093926.jpg','2026-02-12 09:21:33.929','13c12bed-9fa5-4184-a7e4-cae78883bd83'),
('3f02c632-8546-4690-b643-67cbc39ed7b6','/uploads/ai-overview/_________________________1770888045125.jpg','2026-02-12 09:20:45.129','b53df491-4890-4ec5-a28b-d6a117987708'),
('615a9022-1068-4e56-a457-1597be336f46','/uploads/ai-overview/_________________1770888360348.jpg','2026-02-12 09:26:00.353','cda0f7cf-db3f-487c-9e34-4d9f24f13743'),
('6cd75fd4-b373-417c-a16d-ac002bfc07ba','/uploads/ai-overview/Screenshot_2026-02-12_125419_1770876426415.png','2026-02-12 06:07:06.420','f4307a52-303d-43eb-8534-982bd1665f97'),
('b54aca28-6f49-4573-b75b-fe0a268aad0b','/uploads/ai-overview/Screenshot_2026-05-25_094915_1779677379338_fae06e27.png','2026-05-25 02:49:39.351','4aac9df7-5d03-4f6a-a964-46cc5a39e3d5'),
('e690e2b1-9290-45f7-a3e1-bbaea3c94ee2','/uploads/ai-overview/_____________________1770888390350.jpg','2026-02-12 09:26:30.353','c78c1260-ad67-46b0-a0ba-7bd1c77f86dd');
/*!40000 ALTER TABLE `aioverviewimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billingcycle`
--

DROP TABLE IF EXISTS `billingcycle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `billingcycle` (
  `id` varchar(191) NOT NULL,
  `cycleNumber` int(11) NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','REVIEWING','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `paidDate` datetime(3) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `planId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `billingcycle_planId_idx` (`planId`),
  KEY `billingcycle_dueDate_idx` (`dueDate`),
  CONSTRAINT `billingcycle_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `paymentplan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billingcycle`
--

LOCK TABLES `billingcycle` WRITE;
/*!40000 ALTER TABLE `billingcycle` DISABLE KEYS */;
/*!40000 ALTER TABLE `billingcycle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billingdocument`
--

DROP TABLE IF EXISTS `billingdocument`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `billingdocument` (
  `id` varchar(191) NOT NULL,
  `documentNumber` varchar(191) NOT NULL,
  `type` enum('BILLING_NOTE','INVOICE','RECEIPT','TAX_INVOICE') NOT NULL,
  `pdfUrl` varchar(191) NOT NULL,
  `totalAmount` decimal(12,2) NOT NULL,
  `note` text DEFAULT NULL,
  `generatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `customerId` varchar(191) DEFAULT NULL,
  `billingCycleId` varchar(191) DEFAULT NULL,
  `customerName` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billingdocument_documentNumber_key` (`documentNumber`),
  KEY `billingdocument_customerId_idx` (`customerId`),
  KEY `billingdocument_billingCycleId_idx` (`billingCycleId`),
  KEY `billingdocument_type_generatedAt_idx` (`type`,`generatedAt`),
  CONSTRAINT `billingdocument_billingCycleId_fkey` FOREIGN KEY (`billingCycleId`) REFERENCES `billingcycle` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `billingdocument_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billingdocument`
--

LOCK TABLES `billingdocument` WRITE;
/*!40000 ALTER TABLE `billingdocument` DISABLE KEYS */;
/*!40000 ALTER TABLE `billingdocument` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companysettings`
--

DROP TABLE IF EXISTS `companysettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `companysettings` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` text NOT NULL,
  `taxId` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `logoUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companysettings`
--

LOCK TABLES `companysettings` WRITE;
/*!40000 ALTER TABLE `companysettings` DISABLE KEYS */;
/*!40000 ALTER TABLE `companysettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractfile`
--

DROP TABLE IF EXISTS `contractfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractfile` (
  `id` varchar(191) NOT NULL,
  `fileUrl` varchar(191) NOT NULL,
  `fileName` varchar(191) NOT NULL,
  `uploadDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `customerId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `contractfile_customerId_idx` (`customerId`),
  CONSTRAINT `contractfile_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractfile`
--

LOCK TABLES `contractfile` WRITE;
/*!40000 ALTER TABLE `contractfile` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `domain` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `seoDevId` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contactName` varchar(191) DEFAULT NULL,
  `taxId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_domain_key` (`domain`),
  UNIQUE KEY `customer_userId_key` (`userId`),
  KEY `customer_seoDevId_fkey` (`seoDevId`),
  CONSTRAINT `customer_seoDevId_fkey` FOREIGN KEY (`seoDevId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES
('567fb530-fae2-488e-b37c-621853dec55c','test','test.com','9db84b5b-4209-40ba-99de-8dd9d3be4c58','755acf40-b3bb-4364-a957-ee5f1817dd62',NULL,NULL,NULL),
('68212a2c-e01b-48a3-877b-aebb07ea28d4','Thanaplus Co., Ltd.','www.my-domain-report.com','638d87f5-d9b7-430c-a84c-85599e8fa2b4','755acf40-b3bb-4364-a957-ee5f1817dd62',NULL,NULL,NULL),
('a5ec09b7-2066-4c94-853a-6a5bb8a37aaa','บริษัท เคมเทค อินโนเวชั่น จำกัด','https://chemtech-th.com/','26fbbb07-5899-4a31-b402-b7c115498a31','755acf40-b3bb-4364-a957-ee5f1817dd62',NULL,NULL,NULL),
('c4fd4aaa-1c09-4355-bb5e-732309fc0e9e','PNA Digital','https://www.pna.co.th/','be373048-02c4-47c3-a7d8-38dc764a7bce','755acf40-b3bb-4364-a957-ee5f1817dd62','-','pna','-'),
('dacaddf6-870a-4dba-9950-4856a0e5be49','บริษัท บียอนด์ แอนด์ เบสท์เตอร์ จำกัด','www.bybetterk.com','02c35c13-52ad-465e-85ba-e267e617e73b','755acf40-b3bb-4364-a957-ee5f1817dd62',NULL,NULL,NULL),
('dc6c5975-1111-4d49-ad18-45a55542b997','amh-thailand','https://amh-thailand.com/','68fe2dc4-c272-457e-ad2d-4f6411fd5e83','755acf40-b3bb-4364-a957-ee5f1817dd62',NULL,NULL,NULL);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentsequence`
--

DROP TABLE IF EXISTS `documentsequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentsequence` (
  `id` varchar(191) NOT NULL,
  `prefix` varchar(191) NOT NULL,
  `year` int(11) NOT NULL,
  `lastSeq` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `documentsequence_prefix_year_key` (`prefix`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentsequence`
--

LOCK TABLES `documentsequence` WRITE;
/*!40000 ALTER TABLE `documentsequence` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentsequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documenttemplate`
--

DROP TABLE IF EXISTS `documenttemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documenttemplate` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `scope` enum('GENERAL','PLAN') NOT NULL DEFAULT 'GENERAL',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `documenttemplate_scope_idx` (`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documenttemplate`
--

LOCK TABLES `documenttemplate` WRITE;
/*!40000 ALTER TABLE `documenttemplate` DISABLE KEYS */;
/*!40000 ALTER TABLE `documenttemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documenttemplateitem`
--

DROP TABLE IF EXISTS `documenttemplateitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documenttemplateitem` (
  `id` varchar(191) NOT NULL,
  `templateId` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit` varchar(191) NOT NULL DEFAULT 'รายการ',
  `unitPrice` decimal(10,2) NOT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `documenttemplateitem_templateId_idx` (`templateId`),
  CONSTRAINT `documenttemplateitem_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `documenttemplate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documenttemplateitem`
--

LOCK TABLES `documenttemplateitem` WRITE;
/*!40000 ALTER TABLE `documenttemplateitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `documenttemplateitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keywordrecommend`
--

DROP TABLE IF EXISTS `keywordrecommend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `keywordrecommend` (
  `id` varchar(191) NOT NULL,
  `keyword` varchar(191) NOT NULL,
  `kd` enum('HARD','MEDIUM','EASY') DEFAULT NULL,
  `isTopReport` tinyint(1) NOT NULL DEFAULT 0,
  `note` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `customerId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `keywordrecommend_customerId_idx` (`customerId`),
  CONSTRAINT `keywordrecommend_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keywordrecommend`
--

LOCK TABLES `keywordrecommend` WRITE;
/*!40000 ALTER TABLE `keywordrecommend` DISABLE KEYS */;
INSERT INTO `keywordrecommend` VALUES
('427ab791-3b99-4c99-bf65-104f85558fba','test key 1 Recommen','HARD',0,'Note123','2026-02-12 06:05:32.899','68212a2c-e01b-48a3-877b-aebb07ea28d4'),
('70058687-3e0e-4fb2-90ea-71aed2aa7344','กล่องโอนกรรมสิทธิ์ พรีเมียม','HARD',0,'กลุ่มนี้ทำเงินได้สูงมาก เพราะ โครงการหมู่บ้านหรือคอนโดที่ต้องการความหรูหราและสั่งทีละจำนวนมาก','2026-03-27 08:21:21.436','dacaddf6-870a-4dba-9950-4856a0e5be49'),
('9736c4d4-728c-42c0-b182-b6e60b4167fe','กล่องหุ้มหนังพรีเมี่ยม','MEDIUM',0,'กลุ่มนี้ทำเงินได้สูงมาก เพราะ โครงการหมู่บ้านหรือคอนโดที่ต้องการความหรูหราและสั่งทีละจำนวนมาก','2026-03-27 08:23:06.647','dacaddf6-870a-4dba-9950-4856a0e5be49'),
('9b7f6975-c47f-4574-98a6-76046a9d3bc6','test key 2 Recommen','MEDIUM',0,'note 321','2026-02-12 06:05:47.796','68212a2c-e01b-48a3-877b-aebb07ea28d4'),
('d721fabb-2cae-48d7-b5dc-820a3d0c9b08','test key 3 Recommen','MEDIUM',0,'note789','2026-02-12 06:06:07.735','68212a2c-e01b-48a3-877b-aebb07ea28d4');
/*!40000 ALTER TABLE `keywordrecommend` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keywordreport`
--

DROP TABLE IF EXISTS `keywordreport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `keywordreport` (
  `id` varchar(191) NOT NULL,
  `keyword` varchar(191) NOT NULL,
  `position` int(11) DEFAULT NULL,
  `traffic` int(11) NOT NULL,
  `kd` enum('HARD','MEDIUM','EASY') NOT NULL,
  `isTopReport` tinyint(1) NOT NULL DEFAULT 0,
  `dateRecorded` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `customerId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `keywordreport_customerId_fkey` (`customerId`),
  CONSTRAINT `keywordreport_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keywordreport`
--

LOCK TABLES `keywordreport` WRITE;
/*!40000 ALTER TABLE `keywordreport` DISABLE KEYS */;
INSERT INTO `keywordreport` VALUES
('0178d565-7b1d-4179-b05c-56013a844623','conveying system pneumatic',52,18,'MEDIUM',0,'2026-04-28 03:24:08.211','dc6c5975-1111-4d49-ad18-45a55542b997'),
('02c42ed7-2201-4a22-ac7d-b03d5bfddea4','กล่องส่งมอบบ้าน',78,53,'HARD',0,'2026-05-25 03:12:55.008','dacaddf6-870a-4dba-9950-4856a0e5be49'),
('0ac3676d-dc54-4140-86f1-6cc507349eca','บริการรับทํา ai chatbot',0,0,'HARD',0,'2026-05-27 10:14:30.068','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('1ce26729-635f-4433-82f9-e6dd57fbfb6e','ผลิตระบบเครื่องผสม Ribbon',100,8,'MEDIUM',0,'2026-04-28 03:17:15.301','dc6c5975-1111-4d49-ad18-45a55542b997'),
('1f4c9273-02bd-4c50-aaa6-89eca07d7301','ระบบชั่งอัตโนมัติ',100,1,'HARD',0,'2026-04-28 03:25:39.614','dc6c5975-1111-4d49-ad18-45a55542b997'),
('1fe40a71-8f0a-49d5-b422-b2249b698e8a','ผลิตระบบเครื่องผสม Paddle',100,4,'MEDIUM',0,'2026-04-28 03:18:30.135','dc6c5975-1111-4d49-ad18-45a55542b997'),
('203061c4-1f8d-48be-b19b-f5bff54bc3a9','digital agency',0,0,'HARD',0,'2026-05-27 10:16:43.039','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('2e5c3a68-b7cd-4815-b7a9-ac5121d487a0','รับทำระบบหลังบ้าน',0,0,'HARD',0,'2026-05-27 10:14:20.761','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('305359a0-6edf-4bec-8c55-1316dacbf3d9','รับทำโฆษณาออนไลน์',0,0,'HARD',0,'2026-05-27 10:11:05.231','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('36ae646f-eee4-436f-8066-1df66ce1fcfd','ผลิตระบบเครื่องผสม IBC',100,10,'MEDIUM',0,'2026-04-28 03:19:17.778','dc6c5975-1111-4d49-ad18-45a55542b997'),
('4434cf9e-318e-44bc-bbdb-7050d78a565b','Google Ads agency Thailand',0,0,'MEDIUM',0,'2026-05-27 10:14:07.090','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('464cc4dc-6cef-4800-8b42-7740b87761bb','pneumatic conveyor',60,12,'MEDIUM',0,'2026-04-28 03:23:43.602','dc6c5975-1111-4d49-ad18-45a55542b997'),
('4fa9ac09-aa76-4888-be5b-43196be9fc40','รับทำ SEO',0,0,'HARD',0,'2026-05-27 10:13:12.805','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('5187f04f-1a74-4f0d-84b4-11110629919d','ผลิตระบบเครื่องบรรจุอัตโนมัติ',100,12,'HARD',0,'2026-04-28 03:16:21.957','dc6c5975-1111-4d49-ad18-45a55542b997'),
('5412a77e-1ef3-495a-b968-4a0a9883b518','ระบบ POS ออนไลน์',0,0,'HARD',0,'2026-05-27 10:06:41.793','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('649f8543-e163-40e5-b5d1-d4116518c53a','powder system',100,3,'MEDIUM',0,'2026-04-28 03:22:17.293','dc6c5975-1111-4d49-ad18-45a55542b997'),
('69896ef1-4ece-4460-bbdd-9ddefb1f35a0','Facebook Ads agency Bangkok',0,0,'HARD',0,'2026-05-27 10:15:19.143','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('69a7a831-f7e7-4412-9f2b-7aaf391e77ed','บริการจัดหา Content creator',0,0,'HARD',0,'2026-05-27 10:12:28.653','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('708c9f87-2edd-45b0-8ea1-13991e7feee6','Digital agency ไทย',0,0,'HARD',0,'2026-05-27 10:11:50.391','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('73e509c7-eb23-4056-819c-79241a4faf77','ดิจิตอลเอเจนซี่',0,0,'HARD',0,'2026-05-27 10:17:34.464','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('778e340b-988d-422e-9927-59f7bb24e071','รับทำการตลาดออนไลน์',0,0,'HARD',0,'2026-05-27 10:09:51.153','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('7b2aa496-2a4e-417f-842a-fe87d607de8d','test key 3',1,666,'EASY',0,'2026-02-12 06:05:08.962','68212a2c-e01b-48a3-877b-aebb07ea28d4'),
('7bc612f4-4103-4c3d-91fb-35f04adbf0bc','รับทําการตลาดออนไลน์ครบวงจร',0,0,'MEDIUM',0,'2026-05-27 10:12:06.154','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('7e4e4cf5-c7ff-479a-969d-eefb569baa8f','บริการการตลาดดิจิทัล',0,0,'MEDIUM',0,'2026-05-27 10:10:38.366','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('93a88720-f782-42f7-8e0e-4e16273ddb5e','จำหน่ายเครื่องผสมอุตสาหกรรม',100,6,'HARD',0,'2026-04-28 03:21:38.135','dc6c5975-1111-4d49-ad18-45a55542b997'),
('9c153ff1-6c40-48ae-b06a-570a7df5802d','รับผลิตถังไซโล',100,1,'MEDIUM',0,'2026-04-28 02:59:52.154','dc6c5975-1111-4d49-ad18-45a55542b997'),
('9cd8ee4a-6521-4c45-a52a-282512dc7bd8','รับทำการตลาดออนไลน์ครบวงจร',0,0,'HARD',0,'2026-05-27 10:06:25.568','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('a434a3ab-8735-4f80-b263-a80d04dcdab2','โปรแกรมจัดการธุรกิจ',0,0,'HARD',0,'2026-05-27 10:11:14.991','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('a72c7be9-4936-4eb7-b59b-8c9568ea20e4','ระบบลำเลียงโดยใช้ลม',100,14,'MEDIUM',0,'2026-04-28 03:19:47.237','dc6c5975-1111-4d49-ad18-45a55542b997'),
('aa614485-a818-45e2-97b7-342b6481a74e','ผลิตระบบบรรจุรถบรรทุก tanker tank car',100,1,'MEDIUM',0,'2026-04-28 03:24:54.372','dc6c5975-1111-4d49-ad18-45a55542b997'),
('ad0baea2-cbaf-4a16-9494-8f41507da6fe','บริษัทรับทําการตลาดออนไลน์',0,0,'MEDIUM',0,'2026-05-27 10:07:32.431','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('add7d055-3968-4a8e-9601-b0b140e54201','Social Media Agency ไทย',0,0,'MEDIUM',0,'2026-05-27 10:13:29.864','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('ae5efb94-995c-434e-a194-ce4f4ac62d73','อยากทำธุรกิจออนไลน์ เริ่มยังไง',0,0,'HARD',0,'2026-05-27 10:09:41.129','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('b94eb2fc-aec3-41d6-bbc8-8c045ab6573b','ผลิตระบบบรรจุตู้ container',100,2,'HARD',0,'2026-04-28 03:25:08.448','dc6c5975-1111-4d49-ad18-45a55542b997'),
('b9701df9-a6b4-427d-b918-7060e3059a8c','test key 2',1,1089,'EASY',0,'2026-02-12 06:04:51.996','68212a2c-e01b-48a3-877b-aebb07ea28d4'),
('bc022a30-c3f9-4835-bf69-0354004f563a','รับทำ digital marketing',0,0,'HARD',0,'2026-05-27 10:13:00.815','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('c0eef2f5-9400-4799-9327-2072a26b0594','ผลิตเครื่องบรรจุ big bag และ jumbo bag',100,1,'MEDIUM',0,'2026-04-28 03:24:41.682','dc6c5975-1111-4d49-ad18-45a55542b997'),
('c8dfaa36-0312-4a43-95e7-821c609620dc','ระบบจัดการร้านค้าออนไลน์',0,0,'HARD',0,'2026-05-27 10:08:31.950','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('c8f6e785-d4f0-44a9-9700-5c086641dd62','บริษัท digital marketing กรุงเทพ',0,0,'MEDIUM',0,'2026-05-27 10:14:44.701','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('cd3cb747-97c5-4c2f-98cf-312831d6993b','ระบบจัดการธุรกิจ SME',0,0,'MEDIUM',0,'2026-05-27 10:15:35.575','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('cdb4933f-89cc-4696-83fd-904c23eacde3','test key 1',1,1555,'HARD',0,'2026-02-12 06:04:34.637','68212a2c-e01b-48a3-877b-aebb07ea28d4'),
('cdbbb105-e4a8-4474-8788-429870822ac2','ผลิตและออกแบบระบบอาหารผงและเครื่องดื่ม',100,1,'MEDIUM',0,'2026-04-28 03:25:28.162','dc6c5975-1111-4d49-ad18-45a55542b997'),
('db629406-719c-458b-a3ac-2edc0c876ba8','จ้างทำเว็บไซต์ที่ไหนดี',0,0,'HARD',0,'2026-05-27 10:11:28.898','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('e08f5f46-31db-44e8-803d-59da98d5814d','บริการคอนเทนต์การตลาด',0,0,'MEDIUM',0,'2026-05-27 10:07:46.926','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('e20055f1-3eec-47fa-bc85-b49ffb49581d','บริการด้านโปรดักชั่นและถ่ายทำ',0,0,'MEDIUM',0,'2026-05-27 10:10:47.569','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('e47ab2d0-e86b-416e-a38c-e1bb1284ca61','ติดหน้าแรก Google',0,0,'HARD',0,'2026-05-27 10:15:06.221','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('e5183ab1-2159-48ef-93f7-6dad21c71274','บริการถ่ายทำภาพยนต์โฆษณา',0,0,'MEDIUM',0,'2026-05-27 10:12:14.780','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('ed261982-65ea-427f-bf2e-92285d3bed0d','ระบบจัดการสต็อกสินค้า',0,0,'HARD',0,'2026-05-27 10:07:19.269','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('f8522597-6277-488b-94ec-5810038018ed','รับวางระบบ IT ธุรกิจ',0,0,'HARD',0,'2026-05-27 10:11:58.162','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('f9fdc044-b898-4808-83cd-5c12262ec15a','รับทำการตลาดออนไลน์',0,0,'HARD',0,'2026-05-27 10:14:53.980','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e');
/*!40000 ALTER TABLE `keywordreport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keywordreporthistory`
--

DROP TABLE IF EXISTS `keywordreporthistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `keywordreporthistory` (
  `id` varchar(191) NOT NULL,
  `keyword` varchar(191) NOT NULL,
  `position` int(11) DEFAULT NULL,
  `traffic` int(11) NOT NULL,
  `kd` enum('HARD','MEDIUM','EASY') NOT NULL,
  `isTopReport` tinyint(1) NOT NULL,
  `dateRecorded` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isVisible` tinyint(1) NOT NULL DEFAULT 1,
  `reportId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `keywordreporthistory_reportId_idx` (`reportId`),
  KEY `keywordreporthistory_dateRecorded_idx` (`dateRecorded`),
  CONSTRAINT `keywordreporthistory_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `keywordreport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keywordreporthistory`
--

LOCK TABLES `keywordreporthistory` WRITE;
/*!40000 ALTER TABLE `keywordreporthistory` DISABLE KEYS */;
INSERT INTO `keywordreporthistory` VALUES
('086c601f-dcba-44a7-9664-032525361301','test key 1',1,1000,'HARD',0,'2026-02-12 12:49:28.557',1,'cdb4933f-89cc-4696-83fd-904c23eacde3'),
('093334bb-e678-43f9-8839-480f658d7f8f','บริการด้านโปรดักชั่นและถ่ายทำ',0,0,'EASY',0,'2026-05-27 10:15:46.961',1,'e20055f1-3eec-47fa-bc85-b49ffb49581d'),
('250deba2-aba8-4945-b551-81b18023aa2a','conveying system pneumatic',100,13,'MEDIUM',0,'2026-05-25 03:33:24.379',1,'0178d565-7b1d-4179-b05c-56013a844623'),
('3d1cb4fc-075c-4328-890a-e58bb27b95f9','ระบบจัดการสต็อกสินค้า',0,0,'EASY',0,'2026-05-27 10:10:14.943',1,'ed261982-65ea-427f-bf2e-92285d3bed0d'),
('95aeafed-2682-4704-81ed-a48c0d4ca991','test key 3',1,555,'EASY',0,'2026-02-12 12:49:36.415',1,'7b2aa496-2a4e-417f-842a-fe87d607de8d'),
('9d0c7b71-7400-4e1d-9993-ecc686a881cc','Social Media Agency ไทย',0,0,'EASY',0,'2026-05-27 10:13:54.369',1,'add7d055-3968-4a8e-9601-b0b140e54201'),
('e0fa6be4-4f8c-4c8f-b5c5-c519e8a4b3c1','pneumatic conveyor',100,7,'MEDIUM',0,'2026-05-25 03:33:47.801',1,'464cc4dc-6cef-4800-8b42-7740b87761bb');
/*!40000 ALTER TABLE `keywordreporthistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `body` text DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime(3) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `actorId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `notification_userId_isRead_createdAt_idx` (`userId`,`isRead`,`createdAt`),
  KEY `notification_actorId_idx` (`actorId`),
  CONSTRAINT `notification_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES
('12d6a400-65ee-4fb2-9f10-6c1b6feb4f57','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:28.417'),
('1f17babf-0f69-48b5-a1b4-f892bf090e80','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:36.852'),
('2eb6c463-2602-40b0-90ad-9eb266edcea8','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',1,'2026-05-27 10:04:59.640','{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:26.822'),
('4384d688-0171-4607-9b57-d3de8695dec3','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:30.770'),
('50e88985-3ff8-42f2-9a71-bb58d1d7072f','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',1,'2026-05-27 10:05:00.790','{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:11.994'),
('652695af-21b3-4ced-aad1-777f24d114e8','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:33.760'),
('6f777925-6dc9-4ecb-83a9-342dc7755a3a','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',1,'2026-05-27 10:04:56.445','{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:24.464'),
('7fb2a4d1-216f-4edf-8b7e-0e7b1a5f0c30','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:01:00.803'),
('8c779d0a-0243-4543-b7e6-41905003b11e','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:50.111'),
('a85ff92f-4447-491a-8ace-7a8375b81115','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:59.394'),
('c8b26a5f-7954-46e7-b2d6-a7bf6ec217c7','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:00:35.212'),
('dcba484a-ae7c-4bab-9428-ce21b4e0d270','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','มีการอัปเดตความคืบหน้าของแผนงาน',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:01:02.136'),
('fe1a851a-8089-431b-944f-1e74351d30fa','be373048-02c4-47c3-a7d8-38dc764a7bce','WORK_ITEM_UPDATED','อัปเดตแผนงาน','Subtask \"เพิ่ม แบ็คลิงค์\" เสร็จสิ้น',0,NULL,'{\"url\":\"/customer/be373048-02c4-47c3-a7d8-38dc764a7bce/work-progress\"}','888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 10:01:19.908');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_preference`
--

DROP TABLE IF EXISTS `notification_preference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_preference` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_preference_userId_type_key` (`userId`,`type`),
  KEY `notification_preference_userId_idx` (`userId`),
  CONSTRAINT `notification_preference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preference`
--

LOCK TABLES `notification_preference` WRITE;
/*!40000 ALTER TABLE `notification_preference` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_preference` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `overallmetrics`
--

DROP TABLE IF EXISTS `overallmetrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `overallmetrics` (
  `id` varchar(191) NOT NULL,
  `domainRating` int(11) NOT NULL,
  `healthScore` int(11) NOT NULL,
  `ageInYears` int(11) NOT NULL,
  `ageInMonths` int(11) NOT NULL DEFAULT 0,
  `spamScore` double NOT NULL,
  `organicTraffic` double NOT NULL,
  `organicKeywords` double NOT NULL,
  `backlinks` int(11) NOT NULL,
  `refDomains` int(11) NOT NULL,
  `dateRecorded` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `customerId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `overallmetrics_customerId_key` (`customerId`),
  CONSTRAINT `overallmetrics_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `overallmetrics`
--

LOCK TABLES `overallmetrics` WRITE;
/*!40000 ALTER TABLE `overallmetrics` DISABLE KEYS */;
INSERT INTO `overallmetrics` VALUES
('0e294df7-43de-499c-8a37-390bd5ebd261',51,50,52,7,2,5000,156,356,653,'2026-02-12 06:04:12.310','68212a2c-e01b-48a3-877b-aebb07ea28d4'),
('36173150-3487-4764-9259-f309ba029c4d',6,80,8,0,4,70,4,41600,55,'2026-05-27 09:59:41.184','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e'),
('3a7236f9-6b6c-4c8e-8f6e-cc96bafc125d',2,67,7,6,7,55,4,1400,478,'2026-03-27 08:13:24.508','dacaddf6-870a-4dba-9950-4856a0e5be49'),
('41c648b2-1374-4619-8b23-f17eb6d50404',26,91,6,6,5,20,5,1714,342,'2026-04-28 02:53:08.530','dc6c5975-1111-4d49-ad18-45a55542b997'),
('edb7eb46-aed9-4872-80ee-ac1b31da22bc',48,23,10,0,45,45,56,32,55,'2026-03-25 02:53:57.449','567fb530-fae2-488e-b37c-621853dec55c');
/*!40000 ALTER TABLE `overallmetrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `overallmetricshistory`
--

DROP TABLE IF EXISTS `overallmetricshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `overallmetricshistory` (
  `id` varchar(191) NOT NULL,
  `domainRating` int(11) NOT NULL,
  `healthScore` int(11) NOT NULL,
  `ageInYears` int(11) NOT NULL,
  `ageInMonths` int(11) NOT NULL DEFAULT 0,
  `spamScore` double NOT NULL,
  `organicTraffic` double NOT NULL,
  `organicKeywords` double NOT NULL,
  `backlinks` int(11) NOT NULL,
  `refDomains` int(11) NOT NULL,
  `dateRecorded` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isVisible` tinyint(1) NOT NULL DEFAULT 1,
  `customerId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `overallmetricshistory_customerId_idx` (`customerId`),
  KEY `overallmetricshistory_dateRecorded_idx` (`dateRecorded`),
  CONSTRAINT `overallmetricshistory_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `overallmetricshistory`
--

LOCK TABLES `overallmetricshistory` WRITE;
/*!40000 ALTER TABLE `overallmetricshistory` DISABLE KEYS */;
INSERT INTO `overallmetricshistory` VALUES
('1ab82314-fa21-47af-b951-bd02e9c882e7',45,23,10,0,45,45,56,32,55,'2026-03-27 08:12:40.258',1,'567fb530-fae2-488e-b37c-621853dec55c'),
('1be83a1d-e42e-475e-8fc4-386115da8c34',48,67,7,0,7,50,1,66,31,'2026-03-27 08:13:33.118',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('1d4577d4-c1de-4a1d-a0f4-08dfe45864ba',45,50,52,7,1,1000,156,651,951,'2026-02-12 12:48:00.131',1,'68212a2c-e01b-48a3-877b-aebb07ea28d4'),
('297001d8-e4ed-4e02-a82d-13eb236506fd',1,67,7,6,7,50,1,181,96,'2026-04-29 03:41:54.114',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('5c4f2c50-64e6-4bfa-8225-ee815c77ce3a',26,90,6,6,5,18,5,744,212,'2026-05-25 03:32:00.164',1,'dc6c5975-1111-4d49-ad18-45a55542b997'),
('6122cbff-60ce-4764-8b51-1fcf8c7fa95f',1,67,7,6,7,50,1,181,90,'2026-04-29 03:49:33.795',1,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('79ac7ef2-dedc-4607-944a-7fad2c87ee3d',46,23,10,0,45,45,56,32,55,'2026-03-27 08:12:57.824',1,'567fb530-fae2-488e-b37c-621853dec55c'),
('85f331fe-d424-4ccc-b2ce-b13e5341ea5d',1,67,7,6,7,52,1,380,110,'2026-04-29 03:49:14.646',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('96c28a9e-b8fd-4130-8eec-bee91bb4f3c5',1,67,7,6,7,52,1,380,110,'2026-04-29 03:44:47.787',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('abd98b88-2c44-47e1-b405-4019184e988f',1,67,7,6,7,50,1,150,90,'2026-03-31 08:28:29.258',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('bc059417-d2f0-4736-9c77-6ca0bf11a833',1,67,7,6,7,50,1,380,110,'2026-04-29 03:43:44.873',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('c5a6bd2e-ce6a-47d3-94f2-c51a7a953f80',1,67,7,6,7,52,1,380,110,'2026-05-25 02:40:04.306',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('c9d13ef6-eb64-4c85-80b3-a5bb51d4083f',24,20,7,6,17,25,0,30,31,'2026-03-10 08:23:37.935',1,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('d2a2c15c-3c32-4eba-b24e-9a66f328029c',4,67,7,6,7,50,1,181,96,'2026-03-31 08:26:55.166',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('d6f94160-f46c-4bea-9452-8a4f48185c7f',1,67,7,6,7,50,1,150,96,'2026-03-31 08:28:13.500',1,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('ed0ce8d5-db61-4ce7-9fce-8c2f761d86ad',1,67,7,6,7,50,1,181,96,'2026-03-31 08:28:08.531',0,'dacaddf6-870a-4dba-9950-4856a0e5be49'),
('f69ece2d-fcb6-4178-8ae8-ead029c2952c',51,50,52,7,2,5000,156,651,951,'2026-02-12 12:48:10.393',1,'68212a2c-e01b-48a3-877b-aebb07ea28d4');
/*!40000 ALTER TABLE `overallmetricshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentplan`
--

DROP TABLE IF EXISTS `paymentplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `paymentplan` (
  `id` varchar(191) NOT NULL,
  `type` enum('MONTHLY','INSTALLMENT') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `billingDay` int(11) DEFAULT NULL,
  `totalInstallments` int(11) DEFAULT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `note` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `customerId` varchar(191) NOT NULL,
  `documentTemplateId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `paymentplan_customerId_idx` (`customerId`),
  KEY `paymentplan_customerId_status_idx` (`customerId`,`status`),
  KEY `paymentplan_documentTemplateId_idx` (`documentTemplateId`),
  CONSTRAINT `paymentplan_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `paymentplan_documentTemplateId_fkey` FOREIGN KEY (`documentTemplateId`) REFERENCES `documenttemplate` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentplan`
--

LOCK TABLES `paymentplan` WRITE;
/*!40000 ALTER TABLE `paymentplan` DISABLE KEYS */;
/*!40000 ALTER TABLE `paymentplan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentproof`
--

DROP TABLE IF EXISTS `paymentproof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `paymentproof` (
  `id` varchar(191) NOT NULL,
  `uploadUrl` varchar(191) NOT NULL,
  `uploadDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `customerId` varchar(191) NOT NULL,
  `billingCycleId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `paymentproof_customerId_fkey` (`customerId`),
  KEY `paymentproof_billingCycleId_idx` (`billingCycleId`),
  CONSTRAINT `paymentproof_billingCycleId_fkey` FOREIGN KEY (`billingCycleId`) REFERENCES `billingcycle` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `paymentproof_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentproof`
--

LOCK TABLES `paymentproof` WRITE;
/*!40000 ALTER TABLE `paymentproof` DISABLE KEYS */;
/*!40000 ALTER TABLE `paymentproof` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_sessionToken_key` (`sessionToken`),
  KEY `session_userId_fkey` (`userId`),
  CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) DEFAULT NULL,
  `role` enum('ADMIN','SEO_DEV','CUSTOMER') NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
('02c35c13-52ad-465e-85ba-e267e617e73b','bybetterk','bybetterk@gmail.com','$2b$10$u65xZDgDJFbfEIJOJ/8JveQQ3TjqMulLHJyhUYo1ByXNlFEXv0lxK','CUSTOMER','2026-03-09 08:57:37.437','2026-03-27 08:23:44.477',NULL),
('26fbbb07-5899-4a31-b402-b7c115498a31','chemtech-th','sales@chemtech-th.com','$2b$10$FwQLuHDH4jIr8ciLXjXRreaJvhw6FVYXjywBmff5dR0bV6tGV4OgS','CUSTOMER','2026-05-25 07:37:53.626','2026-05-25 07:37:53.626',NULL),
('638d87f5-d9b7-430c-a84c-85599e8fa2b4','Test Customer','customer@report.com','$2b$10$gn8xeedPAMJ74DtNCQwuCOr3VO.mS5Qpv4Bj5UNiNKLqiGSYtBn3y','CUSTOMER','2026-02-12 05:59:05.151','2026-02-12 05:59:05.151',NULL),
('68fe2dc4-c272-457e-ad2d-4f6411fd5e83','amh-thailand','mongkol@amh.com.my','$2b$10$XPB5FKrbmyUtEfdVh8C7euhq3sv2z1QxREhIEZ9m/zBvjwcLmOjkm','CUSTOMER','2026-04-28 02:44:49.786','2026-04-28 02:44:49.786',NULL),
('755acf40-b3bb-4364-a957-ee5f1817dd62','SEO Developer','seo.dev@report.com','$2b$10$gn8xeedPAMJ74DtNCQwuCOr3VO.mS5Qpv4Bj5UNiNKLqiGSYtBn3y','SEO_DEV','2026-02-12 05:59:05.148','2026-02-12 05:59:05.148',NULL),
('888f6fb4-c911-4e4a-8fda-bb172a6928a4','System Admin','admin@report.com','$2b$10$gn8xeedPAMJ74DtNCQwuCOr3VO.mS5Qpv4Bj5UNiNKLqiGSYtBn3y','ADMIN','2026-02-12 05:59:05.144','2026-02-12 05:59:05.144',NULL),
('9db84b5b-4209-40ba-99de-8dd9d3be4c58','Nutthawut Phosrithong','test@example.com','$2b$10$2uCvZbgiaxQfyK64tF7o5ucvolg1g1nOW7kQPwwdS/GHNmJ8Fg3U6','CUSTOMER','2026-03-25 02:53:36.865','2026-04-29 05:59:55.333','2026-04-29 05:59:55.332'),
('be373048-02c4-47c3-a7d8-38dc764a7bce','pna','support@pna.co.th','$2b$10$MxQJnthoBX9RStJ1Rh5xJu0ZkgTSpTF.3Y/dZBx/oK4CF7SEoODLu','CUSTOMER','2026-05-27 09:23:55.625','2026-05-27 09:23:55.625',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verificationtoken`
--

DROP TABLE IF EXISTS `verificationtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `verificationtoken` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  UNIQUE KEY `verificationtoken_token_key` (`token`),
  UNIQUE KEY `verificationtoken_identifier_token_key` (`identifier`,`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verificationtoken`
--

LOCK TABLES `verificationtoken` WRITE;
/*!40000 ALTER TABLE `verificationtoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `verificationtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressactivity`
--

DROP TABLE IF EXISTS `workprogressactivity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressactivity` (
  `id` varchar(191) NOT NULL,
  `planId` varchar(191) NOT NULL,
  `actorId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `diff` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`diff`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `workprogressactivity_planId_idx` (`planId`),
  KEY `workprogressactivity_planId_createdAt_idx` (`planId`,`createdAt`),
  KEY `workprogressactivity_actorId_fkey` (`actorId`),
  CONSTRAINT `workprogressactivity_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workprogressactivity_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressactivity`
--

LOCK TABLES `workprogressactivity` WRITE;
/*!40000 ALTER TABLE `workprogressactivity` DISABLE KEYS */;
INSERT INTO `workprogressactivity` VALUES
('00b5a188-414b-4fcf-a01c-584d7051595b','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','a81b7652-ef05-45f3-90c9-1444771bce82','{\"from\":false,\"to\":true,\"after\":{\"id\":\"a81b7652-ef05-45f3-90c9-1444771bce82\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสนอราคา\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:14:18.488Z\",\"createdAt\":\"2026-05-25T08:38:49.454Z\",\"updatedAt\":\"2026-05-25T09:14:18.489Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:14:18.492'),
('01d5bfbd-42d8-4e08-bb0f-18957537c1e6','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:53:58.977Z\"},\"after\":{\"id\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ใบเสนอราคา วางบิล สัญญา\",\"description\":\"ใบเสนอราคา วางบิล สัญญา\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:53:58.977Z\",\"createdAt\":\"2026-05-26T07:51:45.600Z\",\"updatedAt\":\"2026-05-26T07:53:58.978Z\",\"assignedToId\":null}}','2026-05-26 07:53:58.981'),
('01dbffd4-e882-4486-8c25-87d3479b1b8f','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','9802923c-8669-4d8f-aea1-f5d457f11171','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"9802923c-8669-4d8f-aea1-f5d457f11171\",\"itemId\":\"6785a560-1536-4639-bfbb-be8344fcbd87\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T07:56:15.987Z\"},\"itemId\":\"6785a560-1536-4639-bfbb-be8344fcbd87\"}','2026-05-26 07:56:15.990'),
('0208057f-3e6f-4e87-8b92-778f60d7bdef','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"from\":false,\"to\":true,\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":true,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:16:21.099Z\",\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-25T09:16:21.100Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:16:21.103'),
('030cc49e-1334-4f8d-b2a0-25c6b64c7b28','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','1060346e-1e75-4e0b-a6a6-dc15d40a25e8','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T08:07:22.576Z\"},\"after\":{\"id\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"description\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"progressPercent\":0,\"duration\":\"1 เดือน\",\"note\":null,\"orderIndex\":4,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T08:07:22.576Z\",\"createdAt\":\"2026-05-26T07:51:45.613Z\",\"updatedAt\":\"2026-05-26T08:07:22.577Z\",\"assignedToId\":null}}','2026-05-26 08:07:22.581'),
('039e1909-1342-4f08-97df-27dbfc50a9c2','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_DELETED','ATTACHMENT','53518403-d00a-4f2a-a24a-387e52e55242','{\"entity\":{\"id\":\"53518403-d00a-4f2a-a24a-387e52e55242\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"IMAGE\",\"url\":\"/uploads/work-progress/ChatGPT_Image_May_19__2026__03_41_55_PM_1779701205719_b5df795c.png\",\"filename\":\"ChatGPT_Image_May_19__2026__03_41_55_PM_1779701205719_b5df795c.png\",\"mimeType\":\"image/png\",\"sizeBytes\":1705641,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:26:45.726Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:33:30.531'),
('03d26973-da9b-4fe6-83df-acfb0a9d048e','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','8ad7b003-a17e-4916-b0a8-f86c675dfc0f','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา รอบถัดไป\",\"description\":\"ปรับโครงสร้างเนื้อหา รอบถัดไป\",\"duration\":\"6 เดือน\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา รอบถัดไป\",\"description\":\"ปรับโครงสร้างเนื้อหา รอบถัดไป\",\"progressPercent\":0,\"duration\":\"6 เดือน\",\"note\":null,\"orderIndex\":8,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:59:11.539Z\",\"updatedAt\":\"2026-05-26T07:59:11.539Z\",\"assignedToId\":null}}','2026-05-26 07:59:11.543'),
('04080929-a1a6-4818-b7ba-23d007a683fb','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"from\":false,\"to\":true,\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":true,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:14:54.617Z\",\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-25T09:14:54.618Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:14:54.620'),
('04da1185-6abc-40db-bfcb-1531f30262e7','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','875a141e-ae3a-41ca-b2e6-084419bb9f20','{\"input\":{\"periodId\":\"6daa4a06-bc83-4127-9867-c458929ea93a\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"875a141e-ae3a-41ca-b2e6-084419bb9f20\",\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\",\"periodId\":\"6daa4a06-bc83-4127-9867-c458929ea93a\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:44.737Z\"},\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\"}','2026-05-26 08:22:44.740'),
('05e03056-f2fb-4085-8bda-3a68ee0c1445','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_REORDERED','ITEM',NULL,'{\"input\":{\"order\":[{\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"orderIndex\":0},{\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"orderIndex\":1},{\"itemId\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"orderIndex\":2},{\"itemId\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"orderIndex\":3},{\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"orderIndex\":4},{\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"orderIndex\":5},{\"itemId\":\"9ae31dc6-2117-4653-92c0-b79ea89f0bba\",\"orderIndex\":6},{\"itemId\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\",\"orderIndex\":7}]}}','2026-05-25 07:48:54.115'),
('07745739-0b28-408c-a098-57fe8b0b0dcb','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','672161a5-50a8-4461-99ac-11a4d36c7208','{\"from\":true,\"to\":false,\"after\":{\"id\":\"672161a5-50a8-4461-99ac-11a4d36c7208\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารหัก ณ ที่จ่าย\",\"isDone\":false,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:27.063Z\",\"updatedAt\":\"2026-05-25T09:15:01.121Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:15:01.123'),
('07de202e-a45a-4619-9555-1806b0f34f41','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','eb31438c-528f-4e90-a576-774bae7fa2a9','{\"input\":{\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":\"ชำระค่าบริการงวดที่ 2 เรียบร้อยแล้ว\"},\"after\":{\"id\":\"eb31438c-528f-4e90-a576-774bae7fa2a9\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":\"ชำระค่าบริการงวดที่ 2 เรียบร้อยแล้ว\",\"updatedAt\":\"2026-05-26T09:17:54.129Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 09:17:54.139'),
('07f80bc5-9500-4f74-b6a3-ebf115a5e5a7','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','9a2f90d5-ddad-4149-9574-16b73af8da71','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-27T09:28:19.383Z\"},\"after\":{\"id\":\"9a2f90d5-ddad-4149-9574-16b73af8da71\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ตรวจสอบเว็บไซต์ลูกค้า\",\"description\":\"ตรวจสอบเว็บไซต์ลูกค้า ความเร็ว และปัญหา เพื่อให้เหมาะสมกับการทำ SEO\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":3,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-27T09:28:19.383Z\",\"createdAt\":\"2026-05-27T09:27:35.899Z\",\"updatedAt\":\"2026-05-27T09:28:19.384Z\",\"assignedToId\":null}}','2026-05-27 09:28:19.387'),
('081bb37d-8e06-4957-9f9f-969b81737f66','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','672161a5-50a8-4461-99ac-11a4d36c7208','{\"from\":false,\"to\":true,\"after\":{\"id\":\"672161a5-50a8-4461-99ac-11a4d36c7208\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารหัก ณ ที่จ่าย\",\"isDone\":true,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:14:55.110Z\",\"createdAt\":\"2026-05-25T08:43:27.063Z\",\"updatedAt\":\"2026-05-25T09:14:55.111Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:14:55.113'),
('09bf77b0-e4b7-4c02-b919-3d4e1d814077','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','2ee3f345-de27-49a9-ac6a-ff6acfe1f32b','{\"input\":{\"periodId\":\"0bb4c2dc-bd6b-450f-ad90-c44be3bec4b3\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"2ee3f345-de27-49a9-ac6a-ff6acfe1f32b\",\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\",\"periodId\":\"0bb4c2dc-bd6b-450f-ad90-c44be3bec4b3\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:30:13.450Z\"},\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\"}','2026-05-27 09:30:13.453'),
('0a0e63c8-491f-403c-ba37-6b7e96035506','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','53518403-d00a-4f2a-a24a-387e52e55242','{\"after\":{\"id\":\"53518403-d00a-4f2a-a24a-387e52e55242\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"IMAGE\",\"url\":\"/uploads/work-progress/ChatGPT_Image_May_19__2026__03_41_55_PM_1779701205719_b5df795c.png\",\"filename\":\"ChatGPT_Image_May_19__2026__03_41_55_PM_1779701205719_b5df795c.png\",\"mimeType\":\"image/png\",\"sizeBytes\":1705641,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:26:45.726Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"ChatGPT_Image_May_19__2026__03_41_55_PM_1779701205719_b5df795c.png\",\"mimeType\":\"image/png\",\"sizeBytes\":1705641,\"caption\":null}','2026-05-25 09:26:45.730'),
('0c6edcbe-eb67-4256-8cbd-a0f58e9a8301','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','dbc553cb-388e-4fb8-b377-7302072e31e6','{\"input\":{\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"dbc553cb-388e-4fb8-b377-7302072e31e6\",\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\",\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:01:00.795Z\"},\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\"}','2026-05-27 10:01:00.798'),
('0d96e25e-721d-49bf-8c13-a41b0878fde0','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','672161a5-50a8-4461-99ac-11a4d36c7208','{\"input\":{\"title\":\"เอกสารหัก ณ ที่จ่าย\"},\"after\":{\"id\":\"672161a5-50a8-4461-99ac-11a4d36c7208\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารหัก ณ ที่จ่าย\",\"isDone\":false,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:27.063Z\",\"updatedAt\":\"2026-05-25T08:43:27.063Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:43:27.066'),
('0e73f7c9-70bb-472b-849f-ae5b5f23de13','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','eecb4b45-a1d0-4c26-9552-c7910777ebbf','{\"input\":{\"periodId\":\"2057d65c-23ef-4514-9ea6-fb81383d93f6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"eecb4b45-a1d0-4c26-9552-c7910777ebbf\",\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\",\"periodId\":\"2057d65c-23ef-4514-9ea6-fb81383d93f6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:30:14.869Z\"},\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\"}','2026-05-27 09:30:14.872'),
('0eb3b5fb-d26d-421c-a811-67735e194e6e','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','5e22f993-a75d-4de8-b6f9-633496441263','{\"input\":{\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"5e22f993-a75d-4de8-b6f9-633496441263\",\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\",\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:56:35.149Z\"},\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\"}','2026-05-27 09:56:35.152'),
('0f04161b-b6dc-4e26-9585-e8a276e18a79','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','59e90d7d-1346-4307-8665-620511f2c354','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"activity\":\"ปรับแต่งเว็บจากภายในเพิ่มเติม\",\"description\":\"ปรับแต่งเว็บจากภายในเพิ่มเติม\",\"duration\":\"6 เดือน\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"59e90d7d-1346-4307-8665-620511f2c354\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายในเพิ่มเติม\",\"description\":\"ปรับแต่งเว็บจากภายในเพิ่มเติม\",\"progressPercent\":0,\"duration\":\"6 เดือน\",\"note\":null,\"orderIndex\":9,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:55:53.355Z\",\"updatedAt\":\"2026-05-25T07:55:53.355Z\",\"assignedToId\":null}}','2026-05-25 07:55:53.358'),
('0f6944af-13d0-408e-a329-eae94b1c1eb9','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','edf1c9ab-40e6-4e67-9567-ab311f2b5ee0','{\"input\":{\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"edf1c9ab-40e6-4e67-9567-ab311f2b5ee0\",\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:50:11.221Z\"},\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\"}','2026-05-25 07:50:11.224'),
('0fa69ab6-f5ce-494b-b4c8-4597231d23fb','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','7bb62dd6-c7f1-4dae-a112-bee650207de0','{\"input\":{\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"7bb62dd6-c7f1-4dae-a112-bee650207de0\",\"itemId\":\"51ca57b4-b6d1-4b03-83ae-9df2b823cb4b\",\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:28:44.218Z\"},\"itemId\":\"51ca57b4-b6d1-4b03-83ae-9df2b823cb4b\"}','2026-05-27 09:28:44.221'),
('0ffdce6c-c392-4978-a21d-1d4e6cbd2f7d','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','b58f2337-e151-4c53-884a-6e350b801911','{\"entity\":{\"id\":\"b58f2337-e151-4c53-884a-6e350b801911\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"title\":\"ใบวางบิล (หากมี)\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:27:35.889Z\",\"updatedAt\":\"2026-05-27T09:27:35.889Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\"}','2026-05-27 09:29:00.909'),
('10647ff1-a7ea-45ac-b1c7-a02c4ea69b11','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:53:44.244Z\"},\"after\":{\"id\":\"ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000002\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ติดตั้ง GSC TAG Website\",\"description\":\"ติดตั้ง GSC TAG Website\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":2,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:53:44.244Z\",\"createdAt\":\"2026-05-26T07:51:45.608Z\",\"updatedAt\":\"2026-05-26T07:53:44.245Z\",\"assignedToId\":null}}','2026-05-26 07:53:44.248'),
('11b6046c-7996-41a0-8c45-4b6f5518902d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','7775a80f-74ce-48d3-a882-9fc580944253','{\"input\":{\"title\":\"ใบเสร็จ/กำกับภาษี\"},\"after\":{\"id\":\"7775a80f-74ce-48d3-a882-9fc580944253\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/กำกับภาษี\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:01.354Z\",\"updatedAt\":\"2026-05-25T08:43:01.354Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:43:01.356'),
('122f162c-1f8c-4170-9e27-bbd4c098c254','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','223d5223-b3c1-40ca-ac4e-04685e0f94bd','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"223d5223-b3c1-40ca-ac4e-04685e0f94bd\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"เข้าตรวจเช้คเว็บไซต์\",\"description\":\"เข้าตรวจเช้คเว็บไซต์ รอบ ใหม่\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":8,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:31:55.304Z\",\"updatedAt\":\"2026-05-27T09:32:08.049Z\",\"assignedToId\":null}}','2026-05-27 09:32:08.055'),
('12dfc5b0-dcee-4b3c-bcce-0cdf87962145','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','830c3d08-5df2-401c-a7ad-b8e0d9b9b886','{\"input\":{\"periodId\":\"592e05a2-8b1d-4727-8634-cc8285b11d2b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"830c3d08-5df2-401c-a7ad-b8e0d9b9b886\",\"itemId\":\"46e10acb-11a4-4f10-bda8-7ea9f470168d\",\"periodId\":\"592e05a2-8b1d-4727-8634-cc8285b11d2b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:50.102Z\"},\"itemId\":\"46e10acb-11a4-4f10-bda8-7ea9f470168d\"}','2026-05-27 10:00:50.105'),
('14010a7b-7373-4b32-b2e7-d25bd3d9fec3','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','fc240590-4ae6-4813-999a-c8ffffb9e240','{\"input\":{\"periodId\":\"c9e357f8-681c-4d84-a810-f299b76b520c\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"fc240590-4ae6-4813-999a-c8ffffb9e240\",\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\",\"periodId\":\"c9e357f8-681c-4d84-a810-f299b76b520c\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:42.236Z\"},\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\"}','2026-05-26 08:27:42.240'),
('1454e17d-d507-43bf-98e9-60e8d28f1f98','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','8629f9d8-a291-41ef-b41a-ed531ef19be9','{\"from\":false,\"to\":true,\"after\":{\"id\":\"8629f9d8-a291-41ef-b41a-ed531ef19be9\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":true,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:16:25.863Z\",\"createdAt\":\"2026-05-25T08:47:52.370Z\",\"updatedAt\":\"2026-05-25T09:16:25.864Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:16:25.866'),
('1552583d-aec7-4662-8c74-3e674599dd6e','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','c4cea8f4-dd53-4703-8551-65d079a83f51','{\"input\":{\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"c4cea8f4-dd53-4703-8551-65d079a83f51\",\"itemId\":\"596e298b-b03c-4fdc-b374-e3320775950d\",\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:03:37.302Z\"},\"itemId\":\"596e298b-b03c-4fdc-b374-e3320775950d\"}','2026-05-26 08:03:37.306'),
('157e98c4-d902-427b-91e0-1464941ac47a','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','91420496-3589-4123-b9ad-46bfc8f06f91','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:59:37.066Z\"},\"after\":{\"id\":\"91420496-3589-4123-b9ad-46bfc8f06f91\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ใบเสนอราคา วางบิล สัญญา\",\"description\":\"ใบเสนอราคา วางบิล สัญญา\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:59:37.066Z\",\"createdAt\":\"2026-05-26T07:58:29.192Z\",\"updatedAt\":\"2026-05-26T07:59:37.066Z\",\"assignedToId\":null}}','2026-05-26 07:59:37.070'),
('165bc491-3e42-4d03-9dcf-c52cef414d38','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','ccc024bf-968e-4d02-a8af-512eff2cbd7d','{\"input\":{\"periodId\":\"fea44a99-f59d-41bb-a810-791d3c71101e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"ccc024bf-968e-4d02-a8af-512eff2cbd7d\",\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"periodId\":\"fea44a99-f59d-41bb-a810-791d3c71101e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:59.228Z\"},\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\"}','2026-05-26 08:27:59.231'),
('1813a3eb-d707-4815-b918-17847d6d7786','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','8fa9e27a-6c41-4c9f-8ad1-6d8dff060004','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:53:42.050Z\"},\"after\":{\"id\":\"8fa9e27a-6c41-4c9f-8ad1-6d8dff060004\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ตรวจสอบเว็บไซต์ลูกค้า\",\"description\":\"ตรวจสอบเว็บไซต์ลูกค้า ความเร็ว และปัญหา เพื่อให้เหมาะสมกับการทำ SEO\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":3,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:53:42.050Z\",\"createdAt\":\"2026-05-26T07:51:45.611Z\",\"updatedAt\":\"2026-05-26T07:53:42.051Z\",\"assignedToId\":null}}','2026-05-26 07:53:42.055'),
('196fabb7-33d3-457e-9aad-c0139122c929','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','abef69d5-3517-4dfe-96a6-7b96c2a4efe6','{\"input\":{\"periodId\":\"fea44a99-f59d-41bb-a810-791d3c71101e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"abef69d5-3517-4dfe-96a6-7b96c2a4efe6\",\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\",\"periodId\":\"fea44a99-f59d-41bb-a810-791d3c71101e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:47.685Z\"},\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\"}','2026-05-26 08:27:47.687'),
('1b5f802f-9a03-44ea-b7d1-bedbddc45a55','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','e6115ca8-4c1e-4e39-bbc0-02a6640e4a53','{\"after\":{\"id\":\"e6115ca8-4c1e-4e39-bbc0-02a6640e4a53\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"IMAGE\",\"url\":\"/uploads/work-progress/___________________1779701010961_46520aff.jpg\",\"filename\":\"___________________1779701010961_46520aff.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":25897,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:23:30.964Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"___________________1779701010961_46520aff.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":25897,\"caption\":null}','2026-05-25 09:23:30.968'),
('1cc4ef27-d3aa-43d1-9c36-94c3674e19ca','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"f78b3a2e-b22b-4eb3-a094-a9fc56e0bb8a\",\"periodId\":\"29fcdc51-a5cb-4cda-bdbf-84fda9f55012\"}','2026-05-26 08:25:48.766'),
('1daf5b1f-9488-4d8e-a03f-bf2fe7b9c067','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\"}','2026-05-26 08:20:33.113'),
('1dda67d0-839a-43da-8e3f-fc703426cfe7','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','c188df6e-3b0c-40cd-a1ef-f9e55f2da1f1','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"c188df6e-3b0c-40cd-a1ef-f9e55f2da1f1\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:20:26.025Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:20:26.027'),
('1e254c4b-4631-4d88-9666-b8234f2685e8','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','44834fc5-1322-412f-bac6-3404959ddc37','{\"entity\":{\"id\":\"44834fc5-1322-412f-bac6-3404959ddc37\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"ฺbacklink\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:28:56.984Z\",\"updatedAt\":\"2026-05-26T08:28:56.984Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 08:28:59.275'),
('1f9eae91-bb48-4070-9a36-facf02f331c3','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_REORDERED','ITEM',NULL,'{\"input\":{\"order\":[{\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"orderIndex\":0},{\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"orderIndex\":1},{\"itemId\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"orderIndex\":2},{\"itemId\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"orderIndex\":3},{\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"orderIndex\":4},{\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"orderIndex\":5},{\"itemId\":\"c003a90a-0121-4a22-8908-b7b5ea860a11\",\"orderIndex\":6},{\"itemId\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\",\"orderIndex\":7},{\"itemId\":\"9ae31dc6-2117-4653-92c0-b79ea89f0bba\",\"orderIndex\":8}]}}','2026-05-25 07:53:44.065'),
('206b3923-f1c7-40be-bfa2-fdceccc1b157','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"26e26c9f-8ce6-4d94-bdc4-c0a34c1f368b\"]},\"after\":{\"count\":1}}','2026-05-25 07:42:05.584'),
('209ab56e-c976-4c69-adde-27da52254f16','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','ba3c50d9-d4f0-4765-b967-07f8daab63fa','{\"input\":{\"title\":\"สัญญา NDA\"},\"after\":{\"id\":\"ba3c50d9-d4f0-4765-b967-07f8daab63fa\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"สัญญา NDA\",\"isDone\":false,\"orderIndex\":5,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T09:13:46.708Z\",\"updatedAt\":\"2026-05-25T09:13:46.708Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:13:46.711'),
('21cea7d2-5940-44a9-90ca-7de7613c1a57','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','72ae0397-df79-41b6-ae83-77dd0e0b3759','{\"input\":{\"periodId\":\"a9dab332-64d0-4273-9f53-6d3266976416\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"72ae0397-df79-41b6-ae83-77dd0e0b3759\",\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\",\"periodId\":\"a9dab332-64d0-4273-9f53-6d3266976416\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:31.574Z\"},\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\"}','2026-05-26 08:22:31.576'),
('22183def-0aec-42b8-a730-476231bb007b','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','349485ae-e446-45a5-9476-eb94088c90d1','{\"input\":{\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"349485ae-e446-45a5-9476-eb94088c90d1\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:27:47.606Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\"}','2026-05-27 09:27:47.610'),
('2234807c-a5db-4066-a8f0-a5615ce93f19','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','f0759458-e49d-47c7-b9ae-af76d7f47ac6','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"f0759458-e49d-47c7-b9ae-af76d7f47ac6\",\"itemId\":\"83762e4f-b553-4ec7-ac18-340df8f05f26\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:00:35.339Z\"},\"itemId\":\"83762e4f-b553-4ec7-ac18-340df8f05f26\"}','2026-05-26 08:00:35.342'),
('2479c1b2-2505-447e-b889-f77d7f3a5db8','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','PLAN_CREATED','PLAN','3dcca793-f000-4a80-adbd-65037a83784f','{\"input\":{\"title\":\"amh-thailand\",\"periodType\":\"YEAR_12_MONTHS\",\"startMonth\":4,\"startYear\":2026,\"endMonth\":5,\"endYear\":2027,\"packageName\":\"Business Pro\",\"note\":null,\"templateId\":\"ddceea2f-474f-44bf-9323-ca1756fc86bb\"},\"after\":{\"id\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"title\":\"amh-thailand\",\"periodType\":\"YEAR_12_MONTHS\",\"year\":2026,\"startDate\":\"2026-03-31T17:00:00.000Z\",\"endDate\":\"2027-05-30T17:00:00.000Z\",\"packageName\":\"Business Pro\",\"note\":null,\"isArchived\":false,\"createdAt\":\"2026-05-26T07:51:45.594Z\",\"updatedAt\":\"2026-05-26T07:51:45.594Z\",\"customerId\":\"dc6c5975-1111-4d49-ad18-45a55542b997\",\"createdById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\"},\"source\":\"template\",\"templateId\":\"ddceea2f-474f-44bf-9323-ca1756fc86bb\"}','2026-05-26 07:51:45.624'),
('24aab577-0b80-47d7-b229-3ee68d16e26a','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','a46449ee-5658-4e3f-bd71-ba4c458bb0d5','{\"input\":{\"periodId\":\"ad1e0b8a-3209-4cfc-8267-9ac79bc84515\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"a46449ee-5658-4e3f-bd71-ba4c458bb0d5\",\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"periodId\":\"ad1e0b8a-3209-4cfc-8267-9ac79bc84515\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:56.215Z\"},\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\"}','2026-05-26 08:27:56.218'),
('24fe7021-4f0f-4589-a9ed-3c9017c2ad30','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','21c874ee-a035-41bf-a9a2-cb8e90720505','{\"from\":false,\"to\":true,\"after\":{\"id\":\"21c874ee-a035-41bf-a9a2-cb8e90720505\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"PO ลูกค้า\",\"isDone\":true,\"orderIndex\":6,\"assignedToId\":null,\"completedAt\":\"2026-05-26T04:01:06.144Z\",\"createdAt\":\"2026-05-25T09:15:15.092Z\",\"updatedAt\":\"2026-05-26T04:01:06.145Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 04:01:06.147'),
('2524ce9f-3001-4217-84d4-83b5ac48d93f','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','50315187-0724-4e93-a878-b6209c64e0a5','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา\",\"description\":null,\"duration\":\"2week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา\",\"description\":null,\"duration\":\"2week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา\",\"description\":null,\"progressPercent\":0,\"duration\":\"2week\",\"note\":null,\"orderIndex\":4,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.549Z\",\"updatedAt\":\"2026-05-25T07:50:34.558Z\",\"assignedToId\":null}}','2026-05-25 07:50:34.563'),
('282101b3-f918-4c99-a733-e457a7f257fe','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','bbd792f9-8052-4817-b8e8-18d327b8aeca','{\"input\":{\"periodId\":\"c1145ae5-f413-4f10-8ee9-717140af3501\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"bbd792f9-8052-4817-b8e8-18d327b8aeca\",\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"periodId\":\"c1145ae5-f413-4f10-8ee9-717140af3501\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:50:55.749Z\"},\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\"}','2026-05-25 07:50:55.752'),
('2a73bcb2-a778-4fb3-ae83-c0d7c862558d','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','PLAN_CREATED','PLAN','9f731b50-2cb4-4692-80ed-8e3b311c0999','{\"input\":{\"title\":\"bybetterk\",\"periodType\":\"YEAR_12_MONTHS\",\"startMonth\":2,\"startYear\":2026,\"endMonth\":5,\"endYear\":2027,\"packageName\":\"ชาเลนจ์ พิเศษ\",\"note\":null,\"templateId\":\"ddceea2f-474f-44bf-9323-ca1756fc86bb\"},\"after\":{\"id\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"title\":\"bybetterk\",\"periodType\":\"YEAR_12_MONTHS\",\"year\":2026,\"startDate\":\"2026-01-31T17:00:00.000Z\",\"endDate\":\"2027-05-30T17:00:00.000Z\",\"packageName\":\"ชาเลนจ์ พิเศษ\",\"note\":null,\"isArchived\":false,\"createdAt\":\"2026-05-26T07:58:29.185Z\",\"updatedAt\":\"2026-05-26T07:58:29.185Z\",\"customerId\":\"dacaddf6-870a-4dba-9950-4856a0e5be49\",\"createdById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\"},\"source\":\"template\",\"templateId\":\"ddceea2f-474f-44bf-9323-ca1756fc86bb\"}','2026-05-26 07:58:29.220'),
('2b478633-25f5-4ce3-9d6e-4f41a800a6b3','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','7c896529-a723-4eb2-b45a-1a7b9e693174','{\"after\":{\"id\":\"7c896529-a723-4eb2-b45a-1a7b9e693174\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/QT________1779700476024_e08013b0.pdf\",\"filename\":\"QT________1779700476024_e08013b0.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":107257,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:14:36.027Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"QT________1779700476024_e08013b0.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":107257,\"caption\":null}','2026-05-25 09:14:36.029'),
('2b4dd769-0132-4447-800b-7d48288d2be1','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6aa3d567-8a0e-4ed5-824d-871975ccf367','{\"input\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":\"ขบใบเสนอราคาและสัญญา\",\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-25T08:20:53.215Z\",\"activity\":\"เอกสารและสัญญา\",\"description\":\"ขบใบเสนอราคาและสัญญา\",\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":\"ขบใบเสนอราคาและสัญญา\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-25T08:20:53.215Z\",\"createdAt\":\"2026-05-25T07:45:14.633Z\",\"updatedAt\":\"2026-05-25T08:20:53.216Z\",\"assignedToId\":null}}','2026-05-25 08:20:53.219'),
('2bbd1531-c72e-4e18-9b22-883d5d158686','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','72735a57-5ba1-46de-9df7-92fec4a0e96a','{\"input\":{\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"72735a57-5ba1-46de-9df7-92fec4a0e96a\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:02:23.639Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:02:23.643'),
('2d2d46f8-9830-42e7-944a-27bf31883ee1','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','a9b66319-02bd-482b-a3e2-c07e238620d1','{\"input\":{\"title\":\"ใบกำกับภาษี\"},\"after\":{\"id\":\"a9b66319-02bd-482b-a3e2-c07e238620d1\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบกำกับภาษี\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:38:58.177Z\",\"updatedAt\":\"2026-05-25T08:38:58.177Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:38:58.179'),
('2d6103fa-582d-423e-b936-775f279ad055','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"fa9029f5-00fb-4702-ab29-deeec3e34c1e\"]},\"after\":{\"count\":1}}','2026-05-25 07:41:39.267'),
('2df529ba-e21a-4940-b697-da90671745ec','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','aa976cbe-b691-4144-94d3-c56d29d83fa5','{\"input\":{\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"aa976cbe-b691-4144-94d3-c56d29d83fa5\",\"itemId\":\"9a2f90d5-ddad-4149-9574-16b73af8da71\",\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:28:37.156Z\"},\"itemId\":\"9a2f90d5-ddad-4149-9574-16b73af8da71\"}','2026-05-27 09:28:37.159'),
('2f14d517-bcec-4b17-8065-fd4ba7728bf5','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','6a8c452d-be4f-44ff-a8fa-819bc677159a','{\"input\":{\"periodId\":\"e1da01aa-6923-4299-ad36-1810289ce77b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"6a8c452d-be4f-44ff-a8fa-819bc677159a\",\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\",\"periodId\":\"e1da01aa-6923-4299-ad36-1810289ce77b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:21.296Z\"},\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\"}','2026-05-25 07:56:21.299'),
('31090275-5b67-45da-82a1-8addee1e8d9c','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','5cca450c-d1f5-477d-b016-647968fdd693','{\"input\":{\"periodId\":\"07caf070-cce3-458b-a467-a6ea8530e7d0\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"5cca450c-d1f5-477d-b016-647968fdd693\",\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"periodId\":\"07caf070-cce3-458b-a467-a6ea8530e7d0\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:54.850Z\"},\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\"}','2026-05-26 08:27:54.853'),
('3227933e-4e97-4691-aa95-9c54c2c09b4a','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','2c844ea5-5713-4cee-9d93-76e811a45de6','{\"from\":false,\"to\":true,\"after\":{\"id\":\"2c844ea5-5713-4cee-9d93-76e811a45de6\",\"itemId\":\"8fa9e27a-6c41-4c9f-8ad1-6d8dff060004\",\"title\":\"ตรวจสอบเว็บไซต์ลูกค้า\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:07:07.712Z\",\"createdAt\":\"2026-05-26T07:51:45.612Z\",\"updatedAt\":\"2026-05-26T08:07:07.713Z\"},\"itemId\":\"8fa9e27a-6c41-4c9f-8ad1-6d8dff060004\"}','2026-05-26 08:07:07.716'),
('32be6359-53eb-4887-81c4-f89c00135ee3','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6aa3d567-8a0e-4ed5-824d-871975ccf367','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"completedAt\":null},\"after\":{\"id\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"progressPercent\":0,\"duration\":\"2 เดือน\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:45:14.633Z\",\"updatedAt\":\"2026-05-26T04:15:00.998Z\",\"assignedToId\":null}}','2026-05-26 04:15:01.003'),
('331ed41c-5527-461a-bdba-94ed26d95808','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','331aa183-adff-4ca8-af44-7b489a378eeb','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000002\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ติดตั้ง SEO และ config\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000002\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ติดตั้ง SEO และ config\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000002\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ติดตั้ง SEO และ config\",\"description\":null,\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":2,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.541Z\",\"updatedAt\":\"2026-05-25T07:48:00.167Z\",\"assignedToId\":null}}','2026-05-25 07:48:00.170'),
('34133510-5b47-4444-bf0f-fb5856eb818a','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','a0913279-3ae2-44a3-8a6c-2afcb77f34f7','{\"input\":{\"periodId\":\"29fcdc51-a5cb-4cda-bdbf-84fda9f55012\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"a0913279-3ae2-44a3-8a6c-2afcb77f34f7\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"periodId\":\"29fcdc51-a5cb-4cda-bdbf-84fda9f55012\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:23:50.387Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 08:23:50.390'),
('343cbfc2-e2a0-48e2-a796-88da87a92cd4','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','510f9900-5a15-4d7c-898c-94b6ffee3b84','{\"input\":{\"periodId\":\"a4bcbc88-0807-4ad1-b69e-a0601e6c68a6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"510f9900-5a15-4d7c-898c-94b6ffee3b84\",\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\",\"periodId\":\"a4bcbc88-0807-4ad1-b69e-a0601e6c68a6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:46.221Z\"},\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\"}','2026-05-26 08:27:46.225'),
('34c0d167-9806-4811-b3d4-d974058d3f36','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','dba85342-1157-4522-972c-64fb1d071541','{\"from\":false,\"to\":true,\"after\":{\"id\":\"dba85342-1157-4522-972c-64fb1d071541\",\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\",\"title\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:02:00.231Z\",\"createdAt\":\"2026-05-26T07:58:29.209Z\",\"updatedAt\":\"2026-05-26T08:02:00.232Z\"},\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\"}','2026-05-26 08:02:00.235'),
('34d70a93-3326-4b4c-a16e-18777f6aad81','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"input\":{\"title\":\"ใบเสร็จ/ใบกำกับภาษี\"},\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-25T08:43:16.352Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:43:16.355'),
('36073f84-dc05-48d6-ba3d-e27e2d04eed2','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"periodId\":\"a9dab332-64d0-4273-9f53-6d3266976416\"}','2026-05-26 08:20:12.896'),
('361705f5-d62b-4597-97e5-8f754504f5d9','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','5682238f-9e42-4b71-9b6d-8ec8f27592c3','{\"from\":false,\"to\":true,\"after\":{\"id\":\"5682238f-9e42-4b71-9b6d-8ec8f27592c3\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"ใบแจ้งหนี้ / วางบิล\",\"isDone\":true,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:52:14.097Z\",\"createdAt\":\"2026-05-26T08:31:17.961Z\",\"updatedAt\":\"2026-05-26T08:52:14.098Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:52:14.101'),
('36bb1151-b7d8-4a66-8af2-ee6172c1ce60','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','9c536556-302f-4ac6-800e-3bcdf8f8a040','{\"from\":true,\"to\":false,\"after\":{\"id\":\"9c536556-302f-4ac6-800e-3bcdf8f8a040\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"title\":\"ทราฟฟิก และ แบ็คลิงค์\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:58:29.212Z\",\"updatedAt\":\"2026-05-26T08:02:26.479Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:02:26.482'),
('36dc2a59-5755-4fe8-902a-c5f5513ae61c','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','50315187-0724-4e93-a878-b6209c64e0a5','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหา\",\"description\":null,\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":3,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.549Z\",\"updatedAt\":\"2026-05-25T07:48:33.695Z\",\"assignedToId\":null}}','2026-05-25 07:48:33.699'),
('36e4fa46-e28c-4d78-88a6-d07317e7db86','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','1a7251f9-dc62-405f-a656-13f60c652279','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"ปรับ OFFPAGE จากภายนอก\",\"description\":\"ปรับ OFFPAGE จากภายนอก\\nทราฟฟิก และ แบ็คลิงค์\",\"progressPercent\":0,\"duration\":\"3 เดือน\",\"note\":null,\"orderIndex\":5,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:51:45.615Z\",\"updatedAt\":\"2026-05-26T07:53:38.233Z\",\"assignedToId\":null}}','2026-05-26 07:53:38.236'),
('378cd7d6-e862-4fd7-bd15-0df6b8d05318','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','e8ffb40d-d2ac-4d1f-a15d-d4e131337d86','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"description\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"progressPercent\":0,\"duration\":\"1 เดือน\",\"note\":null,\"orderIndex\":4,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:58:29.207Z\",\"updatedAt\":\"2026-05-26T07:59:55.892Z\",\"assignedToId\":null}}','2026-05-26 07:59:55.896'),
('37bdcf4b-fc3d-40f6-b01e-1de18845ebfc','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','da5cdb84-3d75-44ce-8331-8f6a68ef04be','{\"input\":{\"title\":\"ใบเสร็จรับเงิน / ใบกำกับภาษี\"},\"after\":{\"id\":\"da5cdb84-3d75-44ce-8331-8f6a68ef04be\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"title\":\"ใบเสร็จรับเงิน / ใบกำกับภาษี\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:29:41.539Z\",\"updatedAt\":\"2026-05-27T09:29:41.539Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\"}','2026-05-27 09:29:41.541'),
('38083dab-5f92-44f7-bdf4-36b3253c8625','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','a5729e80-6be4-460c-813b-b82b5b11c453','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"a5729e80-6be4-460c-813b-b82b5b11c453\",\"itemId\":\"b699f02a-8221-4294-a0cc-ed5184dc0985\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:00:31.652Z\"},\"itemId\":\"b699f02a-8221-4294-a0cc-ed5184dc0985\"}','2026-05-26 08:00:31.656'),
('386f3c5a-3b19-4bcf-8363-b07640946107','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','68a0b4c4-f479-4ab4-92dc-a634dbd1dec0','{\"entity\":{\"id\":\"68a0b4c4-f479-4ab4-92dc-a634dbd1dec0\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"ใบแจ้งหนี้\",\"isDone\":false,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:31:03.503Z\",\"updatedAt\":\"2026-05-26T08:31:03.503Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:31:06.366'),
('3b8b55cd-eb1a-469c-adb6-9334004a0239','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','e6b70c99-bb2a-4dd4-91b7-315c785c65b3','{\"input\":{\"periodId\":\"9cfa1e89-2207-47ee-9a03-f970e134f745\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"e6b70c99-bb2a-4dd4-91b7-315c785c65b3\",\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"periodId\":\"9cfa1e89-2207-47ee-9a03-f970e134f745\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:46:59.669Z\"},\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\"}','2026-05-25 07:46:59.674'),
('3bb9bdb7-45db-4dbd-9d6d-9a3278539a70','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','6aa3d567-8a0e-4ed5-824d-871975ccf367','{\"input\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ขบใบเสนอราคาและสัญญา\",\"description\":\"ขบใบเสนอราคาและสัญญา\",\"duration\":\"1 week\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ขบใบเสนอราคาและสัญญา\",\"description\":\"ขบใบเสนอราคาและสัญญา\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":23,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:45:14.633Z\",\"updatedAt\":\"2026-05-25T07:45:14.633Z\",\"assignedToId\":null}}','2026-05-25 07:45:14.636'),
('3cd49c27-14ef-42de-a6da-5536ad87df17','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','4b067e8b-42c0-400d-9d87-f8e587128fe1','{\"input\":{\"periodId\":\"a9dab332-64d0-4273-9f53-6d3266976416\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"4b067e8b-42c0-400d-9d87-f8e587128fe1\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"periodId\":\"a9dab332-64d0-4273-9f53-6d3266976416\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:20:05.063Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:20:05.067'),
('3ebe9b83-6757-4a50-a6d6-8e8d4ec30379','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','07046dd2-03b3-42f4-9a46-f3ab4feb31c4','{\"from\":false,\"to\":true,\"after\":{\"id\":\"07046dd2-03b3-42f4-9a46-f3ab4feb31c4\",\"itemId\":\"b699f02a-8221-4294-a0cc-ed5184dc0985\",\"title\":\"วิเคราะคีย์\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:01:18.714Z\",\"createdAt\":\"2026-05-26T07:58:29.199Z\",\"updatedAt\":\"2026-05-26T08:01:18.715Z\"},\"itemId\":\"b699f02a-8221-4294-a0cc-ed5184dc0985\"}','2026-05-26 08:01:18.717'),
('3ebec0bc-73c4-4e0e-8dfe-55d21a570d97','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','7d157ec1-4428-48f7-adcb-36bcf12aff12','{\"from\":false,\"to\":true,\"after\":{\"id\":\"7d157ec1-4428-48f7-adcb-36bcf12aff12\",\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\",\"title\":\"วิเคราะคีย์\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-27T09:27:59.870Z\",\"createdAt\":\"2026-05-27T09:27:35.893Z\",\"updatedAt\":\"2026-05-27T09:27:59.871Z\"},\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\"}','2026-05-27 09:27:59.873'),
('3f0a0644-c143-4089-8eac-d4d1fd6f1a79','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','75515361-cef3-4a5f-8e32-da2ea8b9e6d4','{\"input\":{\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"75515361-cef3-4a5f-8e32-da2ea8b9e6d4\",\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\",\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:59.387Z\"},\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\"}','2026-05-27 10:00:59.390'),
('3f6858f2-7647-46a3-8772-c9f11e396761','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"b7662231-4544-4d70-a4f7-e9f5f575dea3\"]},\"after\":{\"count\":1}}','2026-05-25 07:41:56.558'),
('3f792b29-d482-4708-8392-5ed299a39173','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','f4a487d3-da47-4b9f-b716-cbbe36e8857f','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"ปรับ OFFPAGE จากภายนอก\",\"description\":\"ปรับ OFFPAGE จากภายนอก\\nทราฟฟิก และ แบ็คลิงค์\",\"progressPercent\":0,\"duration\":\"3 เดือน\",\"note\":null,\"orderIndex\":5,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:58:29.210Z\",\"updatedAt\":\"2026-05-26T08:00:00.030Z\",\"assignedToId\":null}}','2026-05-26 08:00:00.034'),
('401096ca-d4c5-46f0-aa41-dbdaa06ba670','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','8d03dabb-61ac-497e-b512-fcf705949b74','{\"input\":{\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"8d03dabb-61ac-497e-b512-fcf705949b74\",\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\",\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:28:07.531Z\"},\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\"}','2026-05-27 09:28:07.534'),
('40499d47-bbac-4b89-b9d2-dc5d98a7de6a','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','36366390-1091-4230-99e6-dc3ea2aa879f','{\"input\":{\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"36366390-1091-4230-99e6-dc3ea2aa879f\",\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\",\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:24:28.750Z\"},\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\"}','2026-05-26 08:24:28.752'),
('40716604-bb77-4684-a91d-ead2a7c83716','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','34a97c2b-f5f6-4ceb-9744-760e37b7a327','{\"input\":{\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"34a97c2b-f5f6-4ceb-9744-760e37b7a327\",\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:51:40.783Z\"},\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\"}','2026-05-25 07:51:40.786'),
('41240db2-91a4-485c-8c7a-7111a403be1b','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6aa3d567-8a0e-4ed5-824d-871975ccf367','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-27T04:11:54.620Z\"},\"after\":{\"id\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"progressPercent\":0,\"duration\":\"2 เดือน\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-27T04:11:54.620Z\",\"createdAt\":\"2026-05-25T07:45:14.633Z\",\"updatedAt\":\"2026-05-27T04:11:54.621Z\",\"assignedToId\":null}}','2026-05-27 04:11:54.625'),
('41a283ae-98c3-49ba-821b-8abfbe54dc3f','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','af07180a-51d9-4133-9bab-ca967b3cfd9a','{\"from\":false,\"to\":true,\"after\":{\"id\":\"af07180a-51d9-4133-9bab-ca967b3cfd9a\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารวางบิล\",\"isDone\":true,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:14:54.041Z\",\"createdAt\":\"2026-05-25T08:39:15.413Z\",\"updatedAt\":\"2026-05-25T09:14:54.042Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:14:54.045'),
('44b98dd3-a94f-4083-b219-b4e1570d8fd7','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','4126f67a-d157-4683-93af-c9eac2eb4f15','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T04:15:07.303Z\"},\"after\":{\"id\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์\",\"description\":null,\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":1,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T04:15:07.303Z\",\"createdAt\":\"2026-05-25T07:40:00.534Z\",\"updatedAt\":\"2026-05-26T04:15:07.304Z\",\"assignedToId\":null}}','2026-05-26 04:15:07.307'),
('45779163-fbfc-4f4e-bc7d-eebb5e9fb6d0','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','68a0b4c4-f479-4ab4-92dc-a634dbd1dec0','{\"input\":{\"title\":\"ใบแจ้งหนี้\"},\"after\":{\"id\":\"68a0b4c4-f479-4ab4-92dc-a634dbd1dec0\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"ใบแจ้งหนี้\",\"isDone\":false,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:31:03.503Z\",\"updatedAt\":\"2026-05-26T08:31:03.503Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:31:03.505'),
('45cf9906-ad1a-4e68-8f13-97b8c2f641d4','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','28158aeb-ad0f-4e15-8b37-e35566952096','{\"input\":{\"periodId\":\"07caf070-cce3-458b-a467-a6ea8530e7d0\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"28158aeb-ad0f-4e15-8b37-e35566952096\",\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\",\"periodId\":\"07caf070-cce3-458b-a467-a6ea8530e7d0\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:43.268Z\"},\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\"}','2026-05-26 08:27:43.271'),
('471707c9-f2bc-4212-8535-dd2efb400bb3','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','4126f67a-d157-4683-93af-c9eac2eb4f15','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์\",\"description\":null,\"progressPercent\":0,\"duration\":null,\"note\":null,\"orderIndex\":1,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.534Z\",\"updatedAt\":\"2026-05-25T07:47:06.623Z\",\"assignedToId\":null}}','2026-05-25 07:47:06.627'),
('49142c25-c564-4499-8f46-20c293a8eb03','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"from\":true,\"to\":false,\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-26T04:01:07.386Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 04:01:07.389'),
('497009ef-2ad3-4d45-b859-0a44473ef936','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','06c86d89-16e5-42ad-a45e-fc63fcf81d3d','{\"input\":{\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"06c86d89-16e5-42ad-a45e-fc63fcf81d3d\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:35.204Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:00:35.207'),
('49bd34e2-2b7a-4b0c-b412-94242f9b6d51','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','3579cd4b-a43a-494b-9791-17e0ce1763b2','{\"input\":{\"title\":\"ทราฟฟิก\"},\"after\":{\"id\":\"3579cd4b-a43a-494b-9791-17e0ce1763b2\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"ทราฟฟิก\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:28:28.202Z\",\"updatedAt\":\"2026-05-26T08:28:28.202Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 08:28:28.204'),
('49f75e11-ddf4-4737-a9f5-2dfb78205c05','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','e6425fb1-ff23-4a17-98e6-6a7fcbc5ec58','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"e6425fb1-ff23-4a17-98e6-6a7fcbc5ec58\",\"itemId\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T07:54:50.015Z\"},\"itemId\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\"}','2026-05-26 07:54:50.019'),
('4a720b97-e49a-43cc-9157-ff7b63d3b6f0','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','1060346e-1e75-4e0b-a6a6-dc15d40a25e8','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"description\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"progressPercent\":0,\"duration\":\"1 เดือน\",\"note\":null,\"orderIndex\":4,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:51:45.613Z\",\"updatedAt\":\"2026-05-26T07:53:38.115Z\",\"assignedToId\":null}}','2026-05-26 07:53:38.118'),
('4ccf6bb9-8042-45e7-8f89-2f6d23e74730','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','d0f0e7fc-176c-4cdd-85e3-6705cc086ec4','{\"input\":{\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"d0f0e7fc-176c-4cdd-85e3-6705cc086ec4\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:11.986Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\"}','2026-05-27 10:00:11.989'),
('4cff21bf-6f99-474d-855a-6cb33aa1edbf','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','91dc5382-c339-462a-9447-c847712b6bdf','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"91dc5382-c339-462a-9447-c847712b6bdf\",\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:01:45.956Z\"},\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\"}','2026-05-26 08:01:45.958'),
('4ed45069-9af4-4b9f-b728-57df53005542','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','a102f9ae-a01a-4583-9ebc-71419784c536','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000005\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000005\",\"completedAt\":\"2026-05-25T07:41:29.477Z\"},\"after\":{\"id\":\"a102f9ae-a01a-4583-9ebc-71419784c536\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000005\",\"activity\":\"เริ่มทำ Digital PR หากมี อาจมีค่าใช้จ่ายเพิ่ม\",\"description\":null,\"progressPercent\":0,\"duration\":null,\"note\":null,\"orderIndex\":14,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-25T07:41:29.477Z\",\"createdAt\":\"2026-05-25T07:40:00.566Z\",\"updatedAt\":\"2026-05-25T07:41:29.478Z\",\"assignedToId\":null}}','2026-05-25 07:41:29.488'),
('4f59c48f-fe1e-4e3f-b482-e3f2ff2649a2','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','85c4963f-af76-4f4c-9794-18e4df82b856','{\"from\":false,\"to\":true,\"after\":{\"id\":\"85c4963f-af76-4f4c-9794-18e4df82b856\",\"itemId\":\"83762e4f-b553-4ec7-ac18-340df8f05f26\",\"title\":\"ติดตั้งโค้ตที่เกี่ยวข้อง\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:01:06.077Z\",\"createdAt\":\"2026-05-26T07:58:29.203Z\",\"updatedAt\":\"2026-05-26T08:01:06.078Z\"},\"itemId\":\"83762e4f-b553-4ec7-ac18-340df8f05f26\"}','2026-05-26 08:01:06.080'),
('4f667680-0237-42c0-9d34-7d06a8697256','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_REORDERED','ITEM',NULL,'{\"input\":{\"order\":[{\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"orderIndex\":0},{\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"orderIndex\":1},{\"itemId\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"orderIndex\":2},{\"itemId\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"orderIndex\":3},{\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"orderIndex\":4},{\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"orderIndex\":5},{\"itemId\":\"c003a90a-0121-4a22-8908-b7b5ea860a11\",\"orderIndex\":6},{\"itemId\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\",\"orderIndex\":7},{\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\",\"orderIndex\":8},{\"itemId\":\"9ae31dc6-2117-4653-92c0-b79ea89f0bba\",\"orderIndex\":9}]}}','2026-05-25 07:54:57.775'),
('4fba4120-d664-42fa-8058-b7db6693444d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','PLAN_CREATED','PLAN','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','{\"input\":{\"title\":\"SEO chemtech\",\"periodType\":\"YEAR_12_MONTHS\",\"year\":2026,\"packageName\":\"Business Pro\",\"note\":null,\"templateId\":\"00000000-0000-4000-8000-000000000001\"},\"after\":{\"id\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"title\":\"SEO chemtech\",\"periodType\":\"YEAR_12_MONTHS\",\"year\":2026,\"startDate\":\"2025-12-31T17:00:00.000Z\",\"endDate\":\"2026-12-30T17:00:00.000Z\",\"packageName\":\"Business Pro\",\"note\":null,\"isArchived\":false,\"createdAt\":\"2026-05-25T07:40:00.522Z\",\"updatedAt\":\"2026-05-25T07:40:00.522Z\",\"customerId\":\"a5ec09b7-2066-4c94-853a-6a5bb8a37aaa\",\"createdById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\"},\"source\":\"template\",\"templateId\":\"00000000-0000-4000-8000-000000000001\"}','2026-05-25 07:40:00.589'),
('4fe14619-17aa-4e06-9897-9ac2ecb6da11','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','19674e18-d48e-474d-b694-e839382d9eb0','{\"after\":{\"id\":\"19674e18-d48e-474d-b694-e839382d9eb0\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/_____________________1779700954980_1624da58.pdf\",\"filename\":\"_____________________1779700954980_1624da58.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":2810892,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:22:34.989Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"_____________________1779700954980_1624da58.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":2810892,\"caption\":null}','2026-05-25 09:22:34.995'),
('4fe96578-f291-48b7-ab50-bde21e978030','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','2be9d523-ee38-431d-8d5b-706ea7478fb7','{\"after\":{\"id\":\"2be9d523-ee38-431d-8d5b-706ea7478fb7\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/__________________1779700561774_36aa2927.pdf\",\"filename\":\"__________________1779700561774_36aa2927.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":204076,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:16:01.777Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"__________________1779700561774_36aa2927.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":204076,\"caption\":null}','2026-05-25 09:16:01.779'),
('4ff14142-b78f-4ba5-af92-2548474373ef','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','c9f52b29-ed85-4e52-8995-a612b2bf0ff0','{\"from\":false,\"to\":true,\"after\":{\"id\":\"c9f52b29-ed85-4e52-8995-a612b2bf0ff0\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสนอราคา\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-25T07:45:58.539Z\",\"createdAt\":\"2026-05-25T07:45:51.088Z\",\"updatedAt\":\"2026-05-25T07:45:58.540Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 07:45:58.543'),
('500c5005-4d2a-4a48-8c8e-ac146b8eb8ee','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','6f1ba841-23ca-478f-9a73-1fd69ac8564b','{\"after\":{\"id\":\"6f1ba841-23ca-478f-9a73-1fd69ac8564b\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/PO________1779785379505_caf6963a.pdf\",\"filename\":\"PO________1779785379505_caf6963a.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":101747,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-26T08:49:39.510Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"filename\":\"PO________1779785379505_caf6963a.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":101747,\"caption\":null}','2026-05-26 08:49:39.513'),
('511e60e9-6def-493b-91f9-06e1f0cd5bdd','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','d0f08d33-cd1b-44f0-84ec-92408f7a807f','{\"input\":{\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"d0f08d33-cd1b-44f0-84ec-92408f7a807f\",\"itemId\":\"9a2f90d5-ddad-4149-9574-16b73af8da71\",\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:28.410Z\"},\"itemId\":\"9a2f90d5-ddad-4149-9574-16b73af8da71\"}','2026-05-27 10:00:28.413'),
('51dd444f-3fac-4528-9c80-27eb4ce9871c','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','67f03652-b37e-477f-9d66-bae8e9fb8c60','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"duration\":\"6 เดือน\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"progressPercent\":0,\"duration\":\"6 เดือน\",\"note\":null,\"orderIndex\":9,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:54:52.195Z\",\"updatedAt\":\"2026-05-25T07:54:52.195Z\",\"assignedToId\":null}}','2026-05-25 07:54:52.199'),
('531a222e-2a11-4a3a-afcf-f0ee9e757c4d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','331aa183-adff-4ca8-af44-7b489a378eeb','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-27T08:31:25.095Z\"},\"after\":{\"id\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000002\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ติดตั้ง SEO และ config\",\"description\":null,\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":2,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-27T08:31:25.095Z\",\"createdAt\":\"2026-05-25T07:40:00.541Z\",\"updatedAt\":\"2026-05-27T08:31:25.096Z\",\"assignedToId\":null}}','2026-05-27 08:31:25.100'),
('550d089c-dd1e-4e96-a4a1-7300d2a1018f','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','9900eef8-bc41-47fe-b8e6-c54db4ae2c5b','{\"input\":{\"periodId\":\"4f458884-0365-47fa-8bef-3fc737818eb9\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"9900eef8-bc41-47fe-b8e6-c54db4ae2c5b\",\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\",\"periodId\":\"4f458884-0365-47fa-8bef-3fc737818eb9\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:42.235Z\"},\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\"}','2026-05-26 08:27:42.239'),
('55549a19-d3e2-422b-a005-e36492aa61bf','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','21c874ee-a035-41bf-a9a2-cb8e90720505','{\"input\":{\"title\":\"PO ลูกค้า\"},\"after\":{\"id\":\"21c874ee-a035-41bf-a9a2-cb8e90720505\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"PO ลูกค้า\",\"isDone\":false,\"orderIndex\":6,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T09:15:15.092Z\",\"updatedAt\":\"2026-05-25T09:15:15.092Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:15:15.094'),
('55597664-b7f7-4a14-bea4-d443490bc4b3','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','f3c87c62-f2e2-48e1-85f9-d759b4672811','{\"input\":{\"periodId\":\"10927824-c6bb-41eb-b71f-749acf3b2f87\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"f3c87c62-f2e2-48e1-85f9-d759b4672811\",\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\",\"periodId\":\"10927824-c6bb-41eb-b71f-749acf3b2f87\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:46.387Z\"},\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\"}','2026-05-26 08:22:46.390'),
('55d69389-7412-44eb-bcb2-f60b81e73196','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','f53941c7-1150-4b97-a623-c2cf23d6bca4','{\"input\":{\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"f53941c7-1150-4b97-a623-c2cf23d6bca4\",\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\",\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:02:08.625Z\"},\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\"}','2026-05-26 08:02:08.629'),
('55fae706-4801-4a01-882c-27f8e4260df6','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','a210bfeb-f4e2-4888-bd9d-7d946fab35b8','{\"entity\":{\"id\":\"a210bfeb-f4e2-4888-bd9d-7d946fab35b8\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารสัญญา\",\"isDone\":true,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":\"2026-05-25T07:45:59.417Z\",\"createdAt\":\"2026-05-25T07:45:57.149Z\",\"updatedAt\":\"2026-05-25T07:45:59.418Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:38:09.893'),
('5867c414-ff96-4e49-b2b2-0719d750428b','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','96be8902-68f3-4677-8ad3-69fe15ba743c','{\"input\":{\"periodId\":\"cd635770-4df3-4d9a-8ade-2cb1d7a7aac4\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"96be8902-68f3-4677-8ad3-69fe15ba743c\",\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\",\"periodId\":\"cd635770-4df3-4d9a-8ade-2cb1d7a7aac4\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:43.422Z\"},\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\"}','2026-05-26 08:22:43.425'),
('598f2ea7-0495-4b80-b905-e3f75f293f36','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','445b6e8b-d033-456b-9c3b-c01843ab8208','{\"from\":false,\"to\":true,\"after\":{\"id\":\"445b6e8b-d033-456b-9c3b-c01843ab8208\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"ทราฟฟิก และ แบ็คลิงค์\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T07:55:09.903Z\",\"createdAt\":\"2026-05-26T07:51:45.617Z\",\"updatedAt\":\"2026-05-26T07:55:09.904Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 07:55:09.908'),
('5a779e1e-9153-4ad7-a9a9-d27bf44498cc','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\",\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\"}','2026-05-27 09:56:38.313'),
('5ac7d019-d844-43ac-8bab-ebfc8380d997','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','73d841b5-d5a6-4e68-9d10-802f1cfe7933','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"73d841b5-d5a6-4e68-9d10-802f1cfe7933\",\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:26:50.142Z\"},\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\"}','2026-05-26 08:26:50.145'),
('5b310e0e-cdce-48f4-ab46-88f74b636a4a','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\"}','2026-05-26 08:02:15.287'),
('5b33fbda-0836-4893-a26f-11cbe8526f54','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','21c874ee-a035-41bf-a9a2-cb8e90720505','{\"from\":false,\"to\":true,\"after\":{\"id\":\"21c874ee-a035-41bf-a9a2-cb8e90720505\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"PO ลูกค้า\",\"isDone\":true,\"orderIndex\":6,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:15:19.530Z\",\"createdAt\":\"2026-05-25T09:15:15.092Z\",\"updatedAt\":\"2026-05-25T09:15:19.531Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:15:19.534'),
('5b34a7f3-3c60-4ea1-9568-eccc6d54d672','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','2e6a12f9-92d6-4e63-821d-b4495e421a16','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"2e6a12f9-92d6-4e63-821d-b4495e421a16\",\"itemId\":\"6adcbda7-dc88-4641-9c3a-6a123b578c15\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:00:49.107Z\"},\"itemId\":\"6adcbda7-dc88-4641-9c3a-6a123b578c15\"}','2026-05-26 08:00:49.109'),
('5d1c0007-5253-447e-8474-bc1c60b45401','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','b4565f71-0f9b-4a61-89f7-645ac0436691','{\"input\":{\"periodId\":\"592e05a2-8b1d-4727-8634-cc8285b11d2b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"b4565f71-0f9b-4a61-89f7-645ac0436691\",\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\",\"periodId\":\"592e05a2-8b1d-4727-8634-cc8285b11d2b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:01:02.130Z\"},\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\"}','2026-05-27 10:01:02.132'),
('5e8d1d47-6979-423a-b4f0-f5866d6d8664','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','596e298b-b03c-4fdc-b374-e3320775950d','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"596e298b-b03c-4fdc-b374-e3320775950d\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000006\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"ตรวจสอบผล 3 เดือนแรก\",\"description\":\"ตรวจสอบผล 3 เดือนแรก\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":6,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:58:29.213Z\",\"updatedAt\":\"2026-05-26T08:00:08.807Z\",\"assignedToId\":null}}','2026-05-26 08:00:08.811'),
('5eac4818-0b0a-47a9-b5f4-36588d87c120','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','7b84f4ad-42e5-4a6a-93e4-28bd428a528b','{\"input\":{\"periodId\":\"6daa4a06-bc83-4127-9867-c458929ea93a\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"7b84f4ad-42e5-4a6a-93e4-28bd428a528b\",\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\",\"periodId\":\"6daa4a06-bc83-4127-9867-c458929ea93a\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:35.203Z\"},\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\"}','2026-05-26 08:22:35.206'),
('5f1e9bc1-5b36-49ef-807c-cf6036a5ba5f','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','a210bfeb-f4e2-4888-bd9d-7d946fab35b8','{\"input\":{\"title\":\"เอกสารสัญญา\"},\"after\":{\"id\":\"a210bfeb-f4e2-4888-bd9d-7d946fab35b8\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารสัญญา\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:45:57.149Z\",\"updatedAt\":\"2026-05-25T07:45:57.149Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 07:45:57.151'),
('5f28598d-5646-4a8a-b763-0914e4f1502f','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_DELETED','ATTACHMENT','e6115ca8-4c1e-4e39-bbc0-02a6640e4a53','{\"entity\":{\"id\":\"e6115ca8-4c1e-4e39-bbc0-02a6640e4a53\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"IMAGE\",\"url\":\"/uploads/work-progress/___________________1779701010961_46520aff.jpg\",\"filename\":\"___________________1779701010961_46520aff.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":25897,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:23:30.964Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:26:02.138'),
('5f4280dc-1280-4662-b60b-97eee54c199f','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','38a96e27-faf4-4b3c-9909-426068654dcc','{\"input\":{\"periodId\":\"c1145ae5-f413-4f10-8ee9-717140af3501\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"38a96e27-faf4-4b3c-9909-426068654dcc\",\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"periodId\":\"c1145ae5-f413-4f10-8ee9-717140af3501\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:51:46.678Z\"},\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\"}','2026-05-25 07:51:46.681'),
('5fd90263-db81-4dfb-b36d-b403db54df02','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"596e298b-b03c-4fdc-b374-e3320775950d\",\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\"}','2026-05-26 08:22:11.792'),
('604ac7c7-d9d9-4bc6-a6fb-f45829625b03','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','8629f9d8-a291-41ef-b41a-ed531ef19be9','{\"from\":true,\"to\":false,\"after\":{\"id\":\"8629f9d8-a291-41ef-b41a-ed531ef19be9\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":false,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:47:52.370Z\",\"updatedAt\":\"2026-05-25T09:15:00.555Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:15:00.557'),
('60f7396a-c0a4-4805-a916-3a8abbd4dd1a','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','e074df36-8588-4d93-bf62-13d21fa85bc1','{\"input\":{\"periodId\":\"cc878f77-ac38-455d-8683-38275bf46111\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"e074df36-8588-4d93-bf62-13d21fa85bc1\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"periodId\":\"cc878f77-ac38-455d-8683-38275bf46111\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:02:21.316Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:02:21.318'),
('612ac407-6273-47db-96f9-60f1bf290dd5','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','af07180a-51d9-4133-9bab-ca967b3cfd9a','{\"from\":false,\"to\":true,\"after\":{\"id\":\"af07180a-51d9-4133-9bab-ca967b3cfd9a\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารวางบิล\",\"isDone\":true,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":\"2026-05-26T04:01:03.318Z\",\"createdAt\":\"2026-05-25T08:39:15.413Z\",\"updatedAt\":\"2026-05-26T04:01:03.319Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 04:01:03.323'),
('6354ca2e-ea97-4e88-a5e0-3ffa6babec0b','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','75897620-e8ea-486a-9976-7111afb0333e','{\"input\":{\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"75897620-e8ea-486a-9976-7111afb0333e\",\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\",\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:26.813Z\"},\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\"}','2026-05-27 10:00:26.816'),
('64067f30-00be-4c0e-b44b-35fd9d457027','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','8b620768-c73e-4795-944d-75ea28010932','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"8b620768-c73e-4795-944d-75ea28010932\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T07:54:53.645Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 07:54:53.648'),
('64368418-5edf-47d0-8fd6-a7ef057bc837','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','d40ca0f6-b78d-45be-9411-4ee7b1f54da3','{\"after\":{\"id\":\"d40ca0f6-b78d-45be-9411-4ee7b1f54da3\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/___________SEO_AMH_1779785476218_dec205f4.pdf\",\"filename\":\"___________SEO_AMH_1779785476218_dec205f4.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":204203,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-26T08:51:16.231Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"filename\":\"___________SEO_AMH_1779785476218_dec205f4.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":204203,\"caption\":null}','2026-05-26 08:51:16.234'),
('6440617c-39e2-4ac1-a537-791f3309e607','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d62b136b-c522-4154-a682-72607c2760b9','{\"from\":false,\"to\":true,\"after\":{\"id\":\"d62b136b-c522-4154-a682-72607c2760b9\",\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"title\":\"คีย์ที่ดำเนินการผ่านอนุมัติ\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-25T07:46:53.364Z\",\"createdAt\":\"2026-05-25T07:46:52.026Z\",\"updatedAt\":\"2026-05-25T07:46:53.365Z\"},\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\"}','2026-05-25 07:46:53.369'),
('6559e33d-3603-401b-b459-a73897433664','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"223d5223-b3c1-40ca-ac4e-04685e0f94bd\"]},\"after\":{\"count\":1}}','2026-05-27 09:32:33.315'),
('6647fb3d-2ac7-45be-b412-60df4343cfb7','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','28d463c6-9038-4f61-a686-d7ea48020b10','{\"input\":{\"periodId\":\"a4bcbc88-0807-4ad1-b69e-a0601e6c68a6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"28d463c6-9038-4f61-a686-d7ea48020b10\",\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"periodId\":\"a4bcbc88-0807-4ad1-b69e-a0601e6c68a6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:57.572Z\"},\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\"}','2026-05-26 08:27:57.575'),
('67661213-1cd8-40b7-a350-514478fb913c','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_REORDERED','ITEM',NULL,'{\"input\":{\"order\":[{\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"orderIndex\":0},{\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"orderIndex\":1},{\"itemId\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"orderIndex\":2},{\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"orderIndex\":3},{\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"orderIndex\":4},{\"itemId\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"orderIndex\":5},{\"itemId\":\"9ae31dc6-2117-4653-92c0-b79ea89f0bba\",\"orderIndex\":6},{\"itemId\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\",\"orderIndex\":7}]}}','2026-05-25 07:45:18.157'),
('6842967b-dfaa-4adf-8053-25b5c274851d','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','fab15d40-7fcd-41f3-ab87-349552ae3d5b','{\"from\":false,\"to\":true,\"after\":{\"id\":\"fab15d40-7fcd-41f3-ab87-349552ae3d5b\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"ใบสนอราคา\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:49:43.943Z\",\"createdAt\":\"2026-05-26T07:51:45.603Z\",\"updatedAt\":\"2026-05-26T08:49:43.944Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:49:43.947'),
('688eccb4-46d8-4357-9d49-5600c48f7c14','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','9ddb75d5-0ecf-43e3-954e-5e0bccfe20f7','{\"input\":{\"periodId\":\"29fcdc51-a5cb-4cda-bdbf-84fda9f55012\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"9ddb75d5-0ecf-43e3-954e-5e0bccfe20f7\",\"itemId\":\"f78b3a2e-b22b-4eb3-a094-a9fc56e0bb8a\",\"periodId\":\"29fcdc51-a5cb-4cda-bdbf-84fda9f55012\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:23:55.932Z\"},\"itemId\":\"f78b3a2e-b22b-4eb3-a094-a9fc56e0bb8a\"}','2026-05-26 08:23:55.935'),
('6adb3512-58c1-4d15-911d-340c503f628a','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','788d0e49-bd7a-46e1-82c1-b8d06f12b544','{\"after\":{\"id\":\"788d0e49-bd7a-46e1-82c1-b8d06f12b544\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/___________SEO_AMH2_1779785529229_28bc524b.pdf\",\"filename\":\"___________SEO_AMH2_1779785529229_28bc524b.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":199139,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-26T08:52:09.231Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"filename\":\"___________SEO_AMH2_1779785529229_28bc524b.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":199139,\"caption\":null}','2026-05-26 08:52:09.233'),
('6d7f09dd-801b-4499-a9e9-ccf70d1ea3f5','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','7ee8a5d9-e50a-446e-a782-1079f0a00593','{\"input\":{\"periodId\":\"594cdf1f-1933-4b09-9e3b-ed805a72d140\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"7ee8a5d9-e50a-446e-a782-1079f0a00593\",\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\",\"periodId\":\"594cdf1f-1933-4b09-9e3b-ed805a72d140\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:18.802Z\"},\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\"}','2026-05-25 07:56:18.805'),
('6e2bb52f-1074-4daf-87bf-528ee2a72bc6','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','34a0a4f2-a374-4a60-81aa-9009b1f3596e','{\"input\":{\"title\":\"เพิ่มบทความแบ็คลิงค์\"},\"after\":{\"id\":\"34a0a4f2-a374-4a60-81aa-9009b1f3596e\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"title\":\"เพิ่มบทความแบ็คลิงค์\",\"isDone\":false,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T10:02:30.744Z\",\"updatedAt\":\"2026-05-27T10:02:30.744Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:02:30.747'),
('7092c32f-2db9-45b1-aa60-19fb498fb285','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','beda5e67-c568-4ec4-bc94-b368ea882543','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"beda5e67-c568-4ec4-bc94-b368ea882543\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T07:52:13.948Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 07:52:13.952'),
('71482427-22a0-457b-8f64-28a571d29d20','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"periodId\":\"c1145ae5-f413-4f10-8ee9-717140af3501\"}','2026-05-25 07:51:19.592'),
('71ca24ed-135b-47e0-8ee5-c0407a5e8822','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','eddc6dd6-af3c-43db-81eb-57fb9f57ca9e','{\"after\":{\"id\":\"eddc6dd6-af3c-43db-81eb-57fb9f57ca9e\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"kind\":\"IMAGE\",\"url\":\"/uploads/work-progress/QT_AMH_1779785387978_f2a7608f.jpg\",\"filename\":\"QT_AMH_1779785387978_f2a7608f.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":165764,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-26T08:49:47.980Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"filename\":\"QT_AMH_1779785387978_f2a7608f.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":165764,\"caption\":null}','2026-05-26 08:49:47.982'),
('71cc9cbc-9730-468e-801b-68d9360a2c90','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','6629cf93-bd1c-4018-83bb-9b4b1b862430','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"duration\":\"6 เดือน\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"progressPercent\":0,\"duration\":\"6 เดือน\",\"note\":null,\"orderIndex\":9,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:59:30.440Z\",\"updatedAt\":\"2026-05-26T07:59:30.440Z\",\"assignedToId\":null}}','2026-05-26 07:59:30.444'),
('72ea9983-8f1c-4a58-8244-916e9401849e','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\"}','2026-05-26 08:24:23.385'),
('745f7c2d-e7ac-4b71-b143-2e28091d8e0c','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','d62b136b-c522-4154-a682-72607c2760b9','{\"input\":{\"title\":\"คีย์ที่ดำเนินการผ่านอนุมัติ\"},\"after\":{\"id\":\"d62b136b-c522-4154-a682-72607c2760b9\",\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"title\":\"คีย์ที่ดำเนินการผ่านอนุมัติ\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:46:52.026Z\",\"updatedAt\":\"2026-05-25T07:46:52.026Z\"},\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\"}','2026-05-25 07:46:52.029'),
('7469b363-221d-450e-8640-3586362a6e06','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"duration\":\"6 เดือน\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"duration\":\"6 เดือน\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"progressPercent\":0,\"duration\":\"6 เดือน\",\"note\":null,\"orderIndex\":9,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:53:19.614Z\",\"updatedAt\":\"2026-05-26T07:54:21.793Z\",\"assignedToId\":null}}','2026-05-26 07:54:21.797'),
('74c19404-99fc-4613-ba20-304845864ca3','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','9c536556-302f-4ac6-800e-3bcdf8f8a040','{\"from\":false,\"to\":true,\"after\":{\"id\":\"9c536556-302f-4ac6-800e-3bcdf8f8a040\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"title\":\"ทราฟฟิก และ แบ็คลิงค์\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:02:26.060Z\",\"createdAt\":\"2026-05-26T07:58:29.212Z\",\"updatedAt\":\"2026-05-26T08:02:26.061Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:02:26.064'),
('750ad088-86ac-41fb-9f28-4d3342ab8d5e','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','a81b7652-ef05-45f3-90c9-1444771bce82','{\"input\":{\"title\":\"ใบเสนอราคา\"},\"after\":{\"id\":\"a81b7652-ef05-45f3-90c9-1444771bce82\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสนอราคา\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:38:49.454Z\",\"updatedAt\":\"2026-05-25T08:38:49.454Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:38:49.458'),
('75683426-ad83-452e-9fb1-ffd1fe9d3014','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"duration\":null,\"note\":null,\"weight\":1},\"after\":{\"id\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"description\":\"ปรับแต่งเว็บจากภายนอกรอบถัดไป\",\"progressPercent\":0,\"duration\":null,\"note\":null,\"orderIndex\":9,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:53:19.614Z\",\"updatedAt\":\"2026-05-26T07:53:19.614Z\",\"assignedToId\":null}}','2026-05-26 07:53:19.618'),
('756b783f-78e0-4707-877d-0d0032e99624','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','af07180a-51d9-4133-9bab-ca967b3cfd9a','{\"from\":true,\"to\":false,\"after\":{\"id\":\"af07180a-51d9-4133-9bab-ca967b3cfd9a\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารวางบิล\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:39:15.413Z\",\"updatedAt\":\"2026-05-26T03:59:29.548Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 03:59:29.550'),
('760bb420-7b11-43fe-880a-9b819821bce9','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','672161a5-50a8-4461-99ac-11a4d36c7208','{\"from\":false,\"to\":true,\"after\":{\"id\":\"672161a5-50a8-4461-99ac-11a4d36c7208\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารหัก ณ ที่จ่าย\",\"isDone\":true,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:20:43.457Z\",\"createdAt\":\"2026-05-25T08:43:27.063Z\",\"updatedAt\":\"2026-05-25T09:20:43.458Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:20:43.462'),
('7701c2b0-7e70-44fd-8fd2-072ff34ad52e','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','81aad78d-e821-4bba-99ac-305a5cfcf36d','{\"input\":{\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"81aad78d-e821-4bba-99ac-305a5cfcf36d\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T04:16:05.224Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 04:16:05.227'),
('77aa212f-b6d6-408a-b00b-9f65d311e1df','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','5a63b917-1255-4c1e-834d-d70371018f36','{\"entity\":{\"id\":\"5a63b917-1255-4c1e-834d-d70371018f36\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"title\":\"เอกสารสัญาญา (หากมี)\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:27:35.889Z\",\"updatedAt\":\"2026-05-27T09:27:35.889Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\"}','2026-05-27 09:29:01.567'),
('77b3d612-c79c-4e50-98d7-1f27cb1b9850','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"activity\":\"ปรับโครงสร้างเนื้อหารอบถัดไป\",\"description\":\"ปรับโครงสร้างเนื้อหารอบถัดไป\",\"duration\":\"6 เดือน\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับโครงสร้างเนื้อหารอบถัดไป\",\"description\":\"ปรับโครงสร้างเนื้อหารอบถัดไป\",\"progressPercent\":0,\"duration\":\"6 เดือน\",\"note\":null,\"orderIndex\":8,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:52:57.729Z\",\"updatedAt\":\"2026-05-26T07:52:57.729Z\",\"assignedToId\":null}}','2026-05-26 07:52:57.732'),
('77cd1fc0-6677-4186-9733-6eb5129899f5','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','c0298199-9465-476d-a8e4-eae874788cff','{\"input\":{\"periodId\":\"592e05a2-8b1d-4727-8634-cc8285b11d2b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"c0298199-9465-476d-a8e4-eae874788cff\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"periodId\":\"592e05a2-8b1d-4727-8634-cc8285b11d2b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:36.846Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:00:36.848'),
('7826d6db-332c-420e-b661-136616b7c242','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','5682238f-9e42-4b71-9b6d-8ec8f27592c3','{\"input\":{\"title\":\"ใบแจ้งหนี้ / วางบิล\"},\"after\":{\"id\":\"5682238f-9e42-4b71-9b6d-8ec8f27592c3\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"ใบแจ้งหนี้ / วางบิล\",\"isDone\":false,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:31:17.961Z\",\"updatedAt\":\"2026-05-26T08:31:17.961Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:31:17.962'),
('79724b94-f9e5-4259-ad25-ca9923e1090b','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6785a560-1536-4639-bfbb-be8344fcbd87','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:53:46.085Z\"},\"after\":{\"id\":\"6785a560-1536-4639-bfbb-be8344fcbd87\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"วิเคราะคีย์ วางแผนคีย์\",\"description\":\"วิเคราะคีย์ วางแผนคีย์\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":1,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:53:46.085Z\",\"createdAt\":\"2026-05-26T07:51:45.605Z\",\"updatedAt\":\"2026-05-26T07:53:46.086Z\",\"assignedToId\":null}}','2026-05-26 07:53:46.089'),
('79e5fbbb-2e15-49b3-bc24-45f7ad66ebe0','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','c9f52b29-ed85-4e52-8995-a612b2bf0ff0','{\"input\":{\"title\":\"ใบเสนอราคา\"},\"after\":{\"id\":\"c9f52b29-ed85-4e52-8995-a612b2bf0ff0\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสนอราคา\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:45:51.088Z\",\"updatedAt\":\"2026-05-25T07:45:51.088Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 07:45:51.092'),
('79f2966e-b2da-4b1d-baaf-51d694a03280','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','e2e2b644-be0b-4ce5-b892-f0da7a0699df','{\"entity\":{\"id\":\"e2e2b644-be0b-4ce5-b892-f0da7a0699df\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"title\":\"ทราฟฟิก และ แบ็คลิงค์\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:27:35.909Z\",\"updatedAt\":\"2026-05-27T09:27:35.909Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:01:24.749'),
('7a35312a-8bfd-4a80-8311-c8a6fdac8b5d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','9d9da962-a053-4319-87f4-150db07a7920','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอก\",\"description\":\"ปรับแต่งเว็บจากภายนอก\",\"duration\":\"3 เดือน\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอก\",\"description\":\"ปรับแต่งเว็บจากภายนอก\",\"duration\":\"3 เดือน\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ปรับแต่งเว็บจากภายนอก\",\"description\":\"ปรับแต่งเว็บจากภายนอก\",\"progressPercent\":0,\"duration\":\"3 เดือน\",\"note\":null,\"orderIndex\":5,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.564Z\",\"updatedAt\":\"2026-05-25T07:52:29.094Z\",\"assignedToId\":null}}','2026-05-25 07:52:29.098'),
('7a4279cf-8413-4653-a831-fd736c689597','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','21ae677b-2802-48dc-86cb-1a0ef93ea3dd','{\"input\":{\"periodId\":\"b6d11e89-ba3c-4a74-b548-08c933f4afc7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"21ae677b-2802-48dc-86cb-1a0ef93ea3dd\",\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\",\"periodId\":\"b6d11e89-ba3c-4a74-b548-08c933f4afc7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:49.979Z\"},\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\"}','2026-05-26 08:22:49.982'),
('7ab8e41f-1d8c-4ca1-98dd-49ff8a6ade51','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','9802923c-8669-4d8f-aea1-f5d457f11171','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"9802923c-8669-4d8f-aea1-f5d457f11171\",\"itemId\":\"6785a560-1536-4639-bfbb-be8344fcbd87\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T07:54:38.058Z\"},\"itemId\":\"6785a560-1536-4639-bfbb-be8344fcbd87\"}','2026-05-26 07:54:38.060'),
('7b32d76a-c359-46ed-b5ff-89f0cc78cfc6','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','6ac6cb16-1082-4d51-9fad-bdfa37989e4b','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"6ac6cb16-1082-4d51-9fad-bdfa37989e4b\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:08:00.467Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:08:00.472'),
('7bcc3c33-6f9b-4ad0-b210-eb52183d0369','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','513cf9e9-4d3a-4a93-bc7c-ce3e35a7ea73','{\"input\":{\"title\":\"backlink\"},\"after\":{\"id\":\"513cf9e9-4d3a-4a93-bc7c-ce3e35a7ea73\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"backlink\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:29:04.296Z\",\"updatedAt\":\"2026-05-26T08:29:04.296Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 08:29:04.298'),
('7ccc4d88-7563-419d-b3ae-016a348fea4a','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','e6bd1217-440d-4783-ba06-41a7a24e1787','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000007\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"เข้าสู่ระบบ seoprime เข้าดูได้ ตลอด 24 ชม\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000007\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"เข้าสู่ระบบ seoprime เข้าดูได้ ตลอด 24 ชม\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000007\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"เข้าสู่ระบบ seoprime เข้าดูได้ ตลอด 24 ชม\",\"description\":null,\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":7,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.585Z\",\"updatedAt\":\"2026-05-25T07:54:11.836Z\",\"assignedToId\":null}}','2026-05-25 07:54:11.841'),
('7d21177d-ac05-40a7-a5c7-b4dbcbbcaeb8','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','09c14c39-3279-4a0e-b3b3-accd7e911eff','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000006\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ตั้งค่า GSC / Analytics วิเคราะห์\",\"description\":\"ตรวจเช้คเว็บให้พร้อมสำหรับจัดทำ SEO\",\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000006\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ตั้งค่า GSC / Analytics วิเคราะห์\",\"description\":\"ตรวจเช้คเว็บให้พร้อมสำหรับจัดทำ SEO\",\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000006\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ตั้งค่า GSC / Analytics วิเคราะห์\",\"description\":\"ตรวจเช้คเว็บให้พร้อมสำหรับจัดทำ SEO\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":3,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.577Z\",\"updatedAt\":\"2026-05-25T07:49:37.711Z\",\"assignedToId\":null}}','2026-05-25 07:49:37.715'),
('7d8d735d-1936-4729-92e6-b728f144285a','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','147936ca-a952-4ac9-8a55-909d891c6253','{\"from\":false,\"to\":true,\"after\":{\"id\":\"147936ca-a952-4ac9-8a55-909d891c6253\",\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\",\"title\":\"ติดตั้งโค้ตที่เกี่ยวข้อง\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-27T09:28:11.748Z\",\"createdAt\":\"2026-05-27T09:27:35.897Z\",\"updatedAt\":\"2026-05-27T09:28:11.749Z\"},\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\"}','2026-05-27 09:28:11.752'),
('810e4ee9-a363-48cd-ae34-49957434f26f','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','eddca19e-b15e-47ba-b93f-f7867eeb4e4c','{\"input\":{\"periodId\":\"edd567e0-269c-44f7-a254-db80962b98f7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"eddca19e-b15e-47ba-b93f-f7867eeb4e4c\",\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\",\"periodId\":\"edd567e0-269c-44f7-a254-db80962b98f7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:22.510Z\"},\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\"}','2026-05-25 07:56:22.513'),
('8197b923-ab4e-4908-8994-fa3e04a17379','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','a9b66319-02bd-482b-a3e2-c07e238620d1','{\"entity\":{\"id\":\"a9b66319-02bd-482b-a3e2-c07e238620d1\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบกำกับภาษี\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:38:58.177Z\",\"updatedAt\":\"2026-05-25T08:38:58.177Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:39:03.698'),
('82c9a07d-27b4-458a-8de5-bba4da31ebbd','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','4e6e5159-bfd1-4eb5-aa9a-7b2925f92a6f','{\"input\":{\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"4e6e5159-bfd1-4eb5-aa9a-7b2925f92a6f\",\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\",\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:10.548Z\"},\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\"}','2026-05-25 07:56:10.551'),
('82df78fe-479f-4b62-a09d-6403fee8049a','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','a63ec9be-9ceb-436b-80ac-f35edec17ed3','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-27T09:28:16.014Z\"},\"after\":{\"id\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000002\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ติดตั้ง GSC TAG Website\",\"description\":\"ติดตั้ง GSC TAG Website\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":2,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-27T09:28:16.014Z\",\"createdAt\":\"2026-05-27T09:27:35.895Z\",\"updatedAt\":\"2026-05-27T09:28:16.015Z\",\"assignedToId\":null}}','2026-05-27 09:28:16.019'),
('833fd636-ebce-4bf0-bde8-9a4669ebcd56','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','fc4ef7d3-2828-47f5-a41b-673971b14911','{\"input\":{\"periodId\":\"cc878f77-ac38-455d-8683-38275bf46111\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"fc4ef7d3-2828-47f5-a41b-673971b14911\",\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\",\"periodId\":\"cc878f77-ac38-455d-8683-38275bf46111\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:04:06.958Z\"},\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\"}','2026-05-26 08:04:06.961'),
('83ac49cf-6e3d-406d-a154-073dfdb2d9ab','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6aa3d567-8a0e-4ed5-824d-871975ccf367','{\"input\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"duration\":\"2 เดือน\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"duration\":\"2 เดือน\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"progressPercent\":0,\"duration\":\"2 เดือน\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-25T08:20:53.215Z\",\"createdAt\":\"2026-05-25T07:45:14.633Z\",\"updatedAt\":\"2026-05-26T04:00:41.750Z\",\"assignedToId\":null}}','2026-05-26 04:00:41.755'),
('83e6668c-cd04-4f2c-a7d6-6b7f94bac991','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"from\":false,\"to\":true,\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":true,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":\"2026-05-27T03:50:46.086Z\",\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-27T03:50:46.088Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-27 03:50:46.092'),
('85c73c84-6fd7-4c05-b23e-bd0836ef0c7a','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','6dbb65ad-62ee-41a8-a9b3-cb3a56c63c2a','{\"input\":{\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"6dbb65ad-62ee-41a8-a9b3-cb3a56c63c2a\",\"itemId\":\"51ca57b4-b6d1-4b03-83ae-9df2b823cb4b\",\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:30.762Z\"},\"itemId\":\"51ca57b4-b6d1-4b03-83ae-9df2b823cb4b\"}','2026-05-27 10:00:30.764'),
('85d97554-0336-46bc-8d15-f9a66d71f7b4','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','3c90a7a1-d6fc-4b11-9607-39b08360d124','{\"after\":{\"id\":\"3c90a7a1-d6fc-4b11-9607-39b08360d124\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/_______________1779855094135_b3b45edd.pdf\",\"filename\":\"_______________1779855094135_b3b45edd.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":107427,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-27T04:11:34.137Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"_______________1779855094135_b3b45edd.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":107427,\"caption\":null}','2026-05-27 04:11:34.140'),
('8709d2d8-49e6-4de1-a232-14b50415e742','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','a924c48a-fabe-4982-bc8f-77bf14e0f4e2','{\"input\":{\"periodId\":\"2057d65c-23ef-4514-9ea6-fb81383d93f6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"a924c48a-fabe-4982-bc8f-77bf14e0f4e2\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"periodId\":\"2057d65c-23ef-4514-9ea6-fb81383d93f6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:29:42.453Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 09:29:42.456'),
('87120691-8f0a-4838-8486-4cfa52c08f83','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"a63ec9be-9ceb-436b-80ac-f35edec17ed3\",\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\"}','2026-05-27 09:56:37.133'),
('8898f99a-9ceb-421a-a019-1ea8e566c2ca','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"periodId\":\"16bd6215-98a8-4295-ad1b-76d3f1b28369\"}','2026-05-25 08:38:18.053'),
('8924a246-5fef-4bb4-9eba-0359d31c0d0d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','8629f9d8-a291-41ef-b41a-ed531ef19be9','{\"from\":false,\"to\":true,\"after\":{\"id\":\"8629f9d8-a291-41ef-b41a-ed531ef19be9\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":true,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":\"2026-05-25T09:14:56.714Z\",\"createdAt\":\"2026-05-25T08:47:52.370Z\",\"updatedAt\":\"2026-05-25T09:14:56.715Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:14:56.718'),
('8ada8b64-ef71-43d0-a30e-be58a39f4d80','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','8ddd3794-0b53-412e-b871-eb48c8466f5e','{\"input\":{\"periodId\":\"c9e357f8-681c-4d84-a810-f299b76b520c\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"8ddd3794-0b53-412e-b871-eb48c8466f5e\",\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"periodId\":\"c9e357f8-681c-4d84-a810-f299b76b520c\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:53.261Z\"},\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\"}','2026-05-26 08:27:53.264'),
('8b550525-a906-427a-aba0-0c6423be0c2a','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','4a6d5a78-bd24-4856-bcba-082fbbe14a84','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"4a6d5a78-bd24-4856-bcba-082fbbe14a84\",\"itemId\":\"8fa9e27a-6c41-4c9f-8ad1-6d8dff060004\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T07:54:33.570Z\"},\"itemId\":\"8fa9e27a-6c41-4c9f-8ad1-6d8dff060004\"}','2026-05-26 07:54:33.572'),
('8bc1bcac-72e0-4234-8d76-970e58ce4b97','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','a210bfeb-f4e2-4888-bd9d-7d946fab35b8','{\"from\":false,\"to\":true,\"after\":{\"id\":\"a210bfeb-f4e2-4888-bd9d-7d946fab35b8\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารสัญญา\",\"isDone\":true,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":\"2026-05-25T07:45:59.417Z\",\"createdAt\":\"2026-05-25T07:45:57.149Z\",\"updatedAt\":\"2026-05-25T07:45:59.418Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 07:45:59.422'),
('8d4470e1-4614-4375-bee8-1b3ce1bd7912','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','2f477830-5662-4fe3-bf19-29a9127522bf','{\"input\":{\"periodId\":\"10927824-c6bb-41eb-b71f-749acf3b2f87\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"2f477830-5662-4fe3-bf19-29a9127522bf\",\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\",\"periodId\":\"10927824-c6bb-41eb-b71f-749acf3b2f87\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:36.607Z\"},\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\"}','2026-05-26 08:22:36.610'),
('8ddf35a6-082a-4845-86fe-ccdd8677bbe1','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','543c2cc2-aab9-4348-9300-8380d02cabb3','{\"input\":{\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"543c2cc2-aab9-4348-9300-8380d02cabb3\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T07:55:41.195Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 07:55:41.208'),
('8f675e01-8880-456f-8530-d0cdc74f27ef','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','42a88391-4fc0-4d06-8c19-79adc4084340','{\"input\":{\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"42a88391-4fc0-4d06-8c19-79adc4084340\",\"itemId\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\",\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:54:09.027Z\"},\"itemId\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\"}','2026-05-25 07:54:09.030'),
('90e272d8-9bc2-42b3-86b4-8c032c419e87','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','c003a90a-0121-4a22-8908-b7b5ea860a11','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"activity\":\"ตรวจสอบผลดำเนินการ\",\"description\":\"ตรวจสอบผลดำเนินการ  ปรับแก้หากผลลัพธ์ไม่ดี\",\"duration\":\"1 week\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"c003a90a-0121-4a22-8908-b7b5ea860a11\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ตรวจสอบผลดำเนินการ\",\"description\":\"ตรวจสอบผลดำเนินการ  ปรับแก้หากผลลัพธ์ไม่ดี\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":8,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:53:18.369Z\",\"updatedAt\":\"2026-05-25T07:53:18.369Z\",\"assignedToId\":null}}','2026-05-25 07:53:18.373'),
('9228a43c-d6c7-4102-8449-3f7cadbbf301','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','9cbc9ee6-04c6-4447-9648-84b18fabe732','{\"input\":{\"periodId\":\"a9dab332-64d0-4273-9f53-6d3266976416\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"9cbc9ee6-04c6-4447-9648-84b18fabe732\",\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\",\"periodId\":\"a9dab332-64d0-4273-9f53-6d3266976416\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:41.807Z\"},\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\"}','2026-05-26 08:22:41.810'),
('9396f142-7311-4c3c-b968-6cb8c6566bc2','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"6091a5d4-53c3-42ae-ad32-e1257114e93f\"]},\"after\":{\"count\":1}}','2026-05-25 07:41:43.787'),
('959cca3d-5317-4397-bc47-04941bd6c610','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','5db73880-5a93-4301-b056-26e533e3897a','{\"input\":{\"periodId\":\"4f458884-0365-47fa-8bef-3fc737818eb9\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"5db73880-5a93-4301-b056-26e533e3897a\",\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\",\"periodId\":\"4f458884-0365-47fa-8bef-3fc737818eb9\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:49.684Z\"},\"itemId\":\"1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7\"}','2026-05-26 08:27:49.688'),
('96f45a57-6850-4add-aa84-7ec62fc0d396','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','928d6845-3f27-4d02-9f6b-4027b123494c','{\"input\":{\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"928d6845-3f27-4d02-9f6b-4027b123494c\",\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\",\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:17.570Z\"},\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\"}','2026-05-25 07:56:17.572'),
('972d394c-b74b-40df-b993-4d7409ee25d5','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','672161a5-50a8-4461-99ac-11a4d36c7208','{\"from\":false,\"to\":true,\"after\":{\"id\":\"672161a5-50a8-4461-99ac-11a4d36c7208\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารหัก ณ ที่จ่าย\",\"isDone\":true,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":\"2026-05-26T04:01:04.231Z\",\"createdAt\":\"2026-05-25T08:43:27.063Z\",\"updatedAt\":\"2026-05-26T04:01:04.232Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 04:01:04.234'),
('97315e32-5f01-44da-b6d4-5f6244e00d5e','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','3673b2e9-3a04-4472-be86-c096f80e6c51','{\"input\":{\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"3673b2e9-3a04-4472-be86-c096f80e6c51\",\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\",\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:30:12.006Z\"},\"itemId\":\"f2676ee0-c2f5-45a0-bb0b-f73277430312\"}','2026-05-27 09:30:12.010'),
('973fb645-4f1b-4b9c-a7d8-cc375fe5105e','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','4d4d29d0-8c13-427b-bfd8-72a5704983a4','{\"input\":{\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"4d4d29d0-8c13-427b-bfd8-72a5704983a4\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:29:39.318Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 09:29:39.322'),
('97e330f7-3c21-48b3-917a-fe6620c469a6','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','af07180a-51d9-4133-9bab-ca967b3cfd9a','{\"input\":{\"title\":\"เอกสารวางบิล\"},\"after\":{\"id\":\"af07180a-51d9-4133-9bab-ca967b3cfd9a\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารวางบิล\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:39:15.413Z\",\"updatedAt\":\"2026-05-25T08:39:15.413Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:39:15.416'),
('98b543f5-a993-4c4a-b740-86a893652f4c','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','08d542e9-75f8-426d-9887-f32b9b8059a7','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"ใบเสนอราคา วางบิล สัญญา\",\"description\":\"ใบเสนอราคา วางบิล สัญญา\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:27:35.884Z\",\"updatedAt\":\"2026-05-27T09:27:44.244Z\",\"assignedToId\":null}}','2026-05-27 09:27:44.248'),
('99bffcef-3b31-4d6d-8a00-59689954a9ec','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6aa3d567-8a0e-4ed5-824d-871975ccf367','{\"input\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"duration\":\"2 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"duration\":\"2 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":null,\"progressPercent\":0,\"duration\":\"2 week\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-25T08:20:53.215Z\",\"createdAt\":\"2026-05-25T07:45:14.633Z\",\"updatedAt\":\"2026-05-25T09:17:26.012Z\",\"assignedToId\":null}}','2026-05-25 09:17:26.016'),
('9af5a2fd-7560-42ff-8987-9187845ab813','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_CREATED','ITEM','223d5223-b3c1-40ca-ac4e-04685e0f94bd','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"เข้าตรวจเช้คเว็บไซต์\",\"description\":\"เข้าตรวจเช้คเว็บไซต์ รอบ ใหม่\",\"duration\":\"1 week\",\"note\":null,\"weight\":1},\"after\":{\"id\":\"223d5223-b3c1-40ca-ac4e-04685e0f94bd\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"เข้าตรวจเช้คเว็บไซต์\",\"description\":\"เข้าตรวจเช้คเว็บไซต์ รอบ ใหม่\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":8,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:31:55.304Z\",\"updatedAt\":\"2026-05-27T09:31:55.304Z\",\"assignedToId\":null}}','2026-05-27 09:31:55.307'),
('9b30ceef-d638-4db8-90ce-af39757d5b2d','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','445b6e8b-d033-456b-9c3b-c01843ab8208','{\"entity\":{\"id\":\"445b6e8b-d033-456b-9c3b-c01843ab8208\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"ทราฟฟิก และ แบ็คลิงค์\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:51:45.617Z\",\"updatedAt\":\"2026-05-26T07:55:12.876Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 08:28:25.638'),
('9b354c3e-01d5-48a1-be9c-b77a1a08d0e7','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','33a3ac05-8877-484f-8164-8dbe531dc49a','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"33a3ac05-8877-484f-8164-8dbe531dc49a\",\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:04:06.957Z\"},\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\"}','2026-05-26 08:04:06.960'),
('9ba14b46-f24e-44fe-b49f-8236d69afacc','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\"}','2026-05-26 04:16:14.702'),
('9e03eaac-e8fa-4272-919d-32a00e3a49a2','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','679902b9-a42b-4c55-9c7d-400db5cfab12','{\"from\":false,\"to\":true,\"after\":{\"id\":\"679902b9-a42b-4c55-9c7d-400db5cfab12\",\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\",\"title\":\"รายงานลูกค้าทุกเดือน\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:24:32.253Z\",\"createdAt\":\"2026-05-26T07:51:45.622Z\",\"updatedAt\":\"2026-05-26T08:24:32.254Z\"},\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\"}','2026-05-26 08:24:32.256'),
('9e3086f2-3d3d-45ff-a8e7-6e7ae4dd615c','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','366581ab-94c2-41f2-bbef-3e1e331a5302','{\"input\":{\"periodId\":\"ad1e0b8a-3209-4cfc-8267-9ac79bc84515\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"366581ab-94c2-41f2-bbef-3e1e331a5302\",\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\",\"periodId\":\"ad1e0b8a-3209-4cfc-8267-9ac79bc84515\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:27:44.780Z\"},\"itemId\":\"f97948ec-db54-4f9f-9d3f-9c4d6e899e2f\"}','2026-05-26 08:27:44.783'),
('9e82deab-744b-43a9-a0d5-2e9671ed78fd','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"from\":false,\"to\":true,\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":true,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":\"2026-05-26T04:01:03.724Z\",\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-26T04:01:03.725Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 04:01:03.728'),
('9f2e9f07-316c-45e0-8642-1f94213791f3','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','1d2b17f7-c3d8-4053-89bf-4ad1953dfd2d','{\"input\":{\"periodId\":\"64d32d81-6a93-4964-8c00-9776dea9f009\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"1d2b17f7-c3d8-4053-89bf-4ad1953dfd2d\",\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\",\"periodId\":\"64d32d81-6a93-4964-8c00-9776dea9f009\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:13.539Z\"},\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\"}','2026-05-25 07:56:13.542'),
('a21fee21-fe51-40b6-8530-93c9920abdb6','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','1fa563f5-77b0-4ab8-8dfc-2fa11e226449','{\"input\":{\"title\":\"เอกสาร PO\"},\"after\":{\"id\":\"1fa563f5-77b0-4ab8-8dfc-2fa11e226449\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"เอกสาร PO\",\"isDone\":false,\"orderIndex\":5,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:49:14.908Z\",\"updatedAt\":\"2026-05-26T08:49:14.908Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:49:14.912'),
('a2c47a3c-d626-48e0-93f4-a1cb6f5a82e2','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','c5db108d-3374-41a6-8a1d-21018680b058','{\"from\":false,\"to\":true,\"after\":{\"id\":\"c5db108d-3374-41a6-8a1d-21018680b058\",\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\",\"title\":\"ใบสนอราคา\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:01:23.281Z\",\"createdAt\":\"2026-05-26T07:58:29.195Z\",\"updatedAt\":\"2026-05-26T08:01:23.282Z\"},\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\"}','2026-05-26 08:01:23.284'),
('a466925d-21c0-4593-b0ef-12490e0e8e2c','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','66019357-de28-4fcd-a222-5246e09018ec','{\"from\":false,\"to\":true,\"after\":{\"id\":\"66019357-de28-4fcd-a222-5246e09018ec\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"title\":\"ใบสนอราคา\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-27T09:28:47.690Z\",\"createdAt\":\"2026-05-27T09:27:35.889Z\",\"updatedAt\":\"2026-05-27T09:28:47.691Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\"}','2026-05-27 09:28:47.694'),
('a473a053-6f04-4a50-b688-fba7db9987c7','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','8629f9d8-a291-41ef-b41a-ed531ef19be9','{\"from\":true,\"to\":false,\"after\":{\"id\":\"8629f9d8-a291-41ef-b41a-ed531ef19be9\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":false,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:47:52.370Z\",\"updatedAt\":\"2026-05-26T03:59:20.647Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 03:59:20.655'),
('a4ac290d-b2e8-43ca-bc5c-a8fe6b9dceff','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','da2eb239-4928-4713-bf7f-7977a2c233db','{\"after\":{\"id\":\"da2eb239-4928-4713-bf7f-7977a2c233db\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/PO________1779700554304_08176ade.pdf\",\"filename\":\"PO________1779700554304_08176ade.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":101747,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:15:54.309Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"PO________1779700554304_08176ade.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":101747,\"caption\":null}','2026-05-25 09:15:54.315'),
('a4f7e752-bd46-430f-9ad6-993e810eaf24','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','83762e4f-b553-4ec7-ac18-340df8f05f26','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:59:50.956Z\"},\"after\":{\"id\":\"83762e4f-b553-4ec7-ac18-340df8f05f26\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000002\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ติดตั้ง GSC TAG Website\",\"description\":\"ติดตั้ง GSC TAG Website\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":2,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:59:50.956Z\",\"createdAt\":\"2026-05-26T07:58:29.201Z\",\"updatedAt\":\"2026-05-26T07:59:50.957Z\",\"assignedToId\":null}}','2026-05-26 07:59:50.960'),
('a58a2330-fb16-45e5-aa37-afd0faed436b','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','a644adaa-3719-42e7-a0e6-91463ee9032f','{\"from\":false,\"to\":true,\"after\":{\"id\":\"a644adaa-3719-42e7-a0e6-91463ee9032f\",\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\",\"title\":\"รายงานลูกค้าทุกเดือน\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:04:01.002Z\",\"createdAt\":\"2026-05-26T07:58:29.218Z\",\"updatedAt\":\"2026-05-26T08:04:01.003Z\"},\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\"}','2026-05-26 08:04:01.006'),
('a5b30978-3111-4a40-9b40-0eaaea98c8de','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','3579cd4b-a43a-494b-9791-17e0ce1763b2','{\"from\":false,\"to\":true,\"after\":{\"id\":\"3579cd4b-a43a-494b-9791-17e0ce1763b2\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"ทราฟฟิก\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:28:29.636Z\",\"createdAt\":\"2026-05-26T08:28:28.202Z\",\"updatedAt\":\"2026-05-26T08:28:29.638Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 08:28:29.641'),
('a6364075-5608-4e73-8e37-6316abf52506','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','6171bdce-9f7a-4bcf-aa0d-d873f3f93016','{\"input\":{\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"6171bdce-9f7a-4bcf-aa0d-d873f3f93016\",\"itemId\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:48:14.254Z\"},\"itemId\":\"331aa183-adff-4ca8-af44-7b489a378eeb\"}','2026-05-25 07:48:14.257'),
('a7dcd66b-ad7f-4a83-a14c-c863e704403b','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"a102f9ae-a01a-4583-9ebc-71419784c536\"]},\"after\":{\"count\":1}}','2026-05-25 07:41:34.373'),
('a81d2ebb-a9a3-44ea-a822-4d4809d28756','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','a9a86265-585e-423a-a42b-faf800302a23','{\"input\":{\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"a9a86265-585e-423a-a42b-faf800302a23\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:33.752Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:00:33.755'),
('a8443b10-9119-404e-976c-8bd0f44d32ee','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','16739289-335f-4fd3-9e5a-64c7301627b6','{\"input\":{\"title\":\"หลักฐานการชำระเงิน\"},\"after\":{\"id\":\"16739289-335f-4fd3-9e5a-64c7301627b6\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":false,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:30:45.144Z\",\"updatedAt\":\"2026-05-26T08:30:45.144Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:30:45.147'),
('a8f14d4a-539b-4096-af9c-8d6b42283f32','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','729644fe-7657-4274-b25d-3eac6a8e88bc','{\"entity\":{\"id\":\"729644fe-7657-4274-b25d-3eac6a8e88bc\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"ใบวางบิล (หากมี)\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:51:45.603Z\",\"updatedAt\":\"2026-05-26T07:51:45.603Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:30:57.203'),
('a92c44d4-1273-4e2c-bc47-a6a583123045','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','a7d228de-a63b-4b4e-9724-a4ec05bf4577','{\"entity\":{\"id\":\"a7d228de-a63b-4b4e-9724-a4ec05bf4577\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"เอกสารสัญาญา (หากมี)\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:51:45.603Z\",\"updatedAt\":\"2026-05-26T07:51:45.603Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:52:16.536'),
('a9f410ec-50b8-4a6d-8aba-570d93a8133d','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','PLAN_UPDATED','PLAN','62835ed8-01b0-4ffb-b365-a922948ea382','{\"before\":{\"title\":\"SEO PNA\",\"packageName\":\"พิเศษ\",\"note\":null,\"startDate\":\"2026-05-31T17:00:00.000Z\",\"endDate\":\"2027-05-30T17:00:00.000Z\"},\"after\":{\"title\":\"SEO PNA\",\"packageName\":\"พิเศษ\",\"note\":null,\"startDate\":\"2026-04-30T17:00:00.000Z\",\"endDate\":\"2027-05-30T17:00:00.000Z\"}}','2026-05-27 09:55:03.673'),
('ab6199bb-e1ae-4c24-9879-6d12caa73684','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','70105358-109c-4ee7-8480-58e783d5fc0e','{\"after\":{\"id\":\"70105358-109c-4ee7-8480-58e783d5fc0e\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/_______AMH______1779785494154_286f5901.pdf\",\"filename\":\"_______AMH______1779785494154_286f5901.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":334136,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-26T08:51:34.157Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"filename\":\"_______AMH______1779785494154_286f5901.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":334136,\"caption\":null}','2026-05-26 08:51:34.159'),
('aba847d7-196b-45ca-a027-aaad3daa25c0','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\"}','2026-05-25 07:51:34.001'),
('ad218ac6-b461-41bd-a4e2-5a1c5380fdcd','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"9ae31dc6-2117-4653-92c0-b79ea89f0bba\"]},\"after\":{\"count\":1}}','2026-05-25 07:55:02.399'),
('add97703-f296-4c67-9ab6-d92ecff80689','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','0a0d97f9-91ee-4a03-b6d4-05e2dbdc1763','{\"input\":{\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"0a0d97f9-91ee-4a03-b6d4-05e2dbdc1763\",\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\",\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:04:08.117Z\"},\"itemId\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\"}','2026-05-26 08:04:08.120'),
('ae0c996c-bf11-46e9-8cd5-3039abe470b9','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6aa3d567-8a0e-4ed5-824d-871975ccf367','{\"input\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":\"ใบเสนอราคาและสัญญา\",\"duration\":\"2 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":\"ใบเสนอราคาและสัญญา\",\"duration\":\"2 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"dac60f09-fcbe-4591-b2f1-7a2716b11200\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เอกสารและสัญญา\",\"description\":\"ใบเสนอราคาและสัญญา\",\"progressPercent\":0,\"duration\":\"2 week\",\"note\":null,\"orderIndex\":0,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-25T08:20:53.215Z\",\"createdAt\":\"2026-05-25T07:45:14.633Z\",\"updatedAt\":\"2026-05-25T09:17:05.066Z\",\"assignedToId\":null}}','2026-05-25 09:17:05.070'),
('ae97f8bb-855d-44a4-bbbd-c645b83cbb2d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','21c874ee-a035-41bf-a9a2-cb8e90720505','{\"from\":true,\"to\":false,\"after\":{\"id\":\"21c874ee-a035-41bf-a9a2-cb8e90720505\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"PO ลูกค้า\",\"isDone\":false,\"orderIndex\":6,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T09:15:15.092Z\",\"updatedAt\":\"2026-05-26T03:59:27.622Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 03:59:27.625'),
('b02ca3f3-b0a9-4ed2-8627-a847b4b62ab4','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','55f9deff-0769-4ab5-9ac5-a70455a5193b','{\"input\":{\"title\":\"เพิ่ม แบ็คลิงค์\"},\"after\":{\"id\":\"55f9deff-0769-4ab5-9ac5-a70455a5193b\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"title\":\"เพิ่ม แบ็คลิงค์\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T10:01:18.408Z\",\"updatedAt\":\"2026-05-27T10:01:18.408Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:01:18.411'),
('b0a32ecd-7d27-4a60-8356-4963651c593f','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','223d5223-b3c1-40ca-ac4e-04685e0f94bd','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000001\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000001\"},\"after\":{\"id\":\"223d5223-b3c1-40ca-ac4e-04685e0f94bd\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"เข้าตรวจเช้คเว็บไซต์\",\"description\":\"เข้าตรวจเช้คเว็บไซต์ รอบ ใหม่\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":8,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:31:55.304Z\",\"updatedAt\":\"2026-05-27T09:32:20.430Z\",\"assignedToId\":null}}','2026-05-27 09:32:20.433'),
('b0b3ff6c-0435-4ffc-98c8-ec87e4c6ac14','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','9c536556-302f-4ac6-800e-3bcdf8f8a040','{\"from\":false,\"to\":true,\"after\":{\"id\":\"9c536556-302f-4ac6-800e-3bcdf8f8a040\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"title\":\"ทราฟฟิก และ แบ็คลิงค์\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:02:27.520Z\",\"createdAt\":\"2026-05-26T07:58:29.212Z\",\"updatedAt\":\"2026-05-26T08:02:27.521Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:02:27.524'),
('b0f18d3d-6df2-4e19-b6b2-4565be046987','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','c8b3a032-5a6a-4fbe-8fad-b9ac066cc807','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"c8b3a032-5a6a-4fbe-8fad-b9ac066cc807\",\"itemId\":\"ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T07:56:23.153Z\"},\"itemId\":\"ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8\"}','2026-05-26 07:56:23.157'),
('b3d27ebe-7179-4765-a1c2-30f72698a1c0','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','d8c91177-48c3-48d4-b69f-186f04c3a470','{\"after\":{\"id\":\"d8c91177-48c3-48d4-b69f-186f04c3a470\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"IMAGE\",\"url\":\"/uploads/work-progress/___________________1779701634020_5e1c4a67.jpg\",\"filename\":\"___________________1779701634020_5e1c4a67.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":25897,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-25T09:33:54.022Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"___________________1779701634020_5e1c4a67.jpg\",\"mimeType\":\"image/jpeg\",\"sizeBytes\":25897,\"caption\":null}','2026-05-25 09:33:54.024'),
('b4a4dbb7-e63d-45be-9cba-737ed73cb94c','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','543907e3-6ed1-486e-ba6a-cc21cc80f9cd','{\"input\":{\"periodId\":\"16bd6215-98a8-4295-ad1b-76d3f1b28369\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":85,\"note\":null},\"after\":{\"id\":\"543907e3-6ed1-486e-ba6a-cc21cc80f9cd\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"periodId\":\"16bd6215-98a8-4295-ad1b-76d3f1b28369\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":85,\"note\":null,\"updatedAt\":\"2026-05-25T09:16:40.924Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:16:40.929'),
('b4f85ab6-55d4-434b-9753-b8e1ecbc7886','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"from\":true,\"to\":false,\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-25T09:15:54.305Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 09:15:54.309'),
('b5405dcf-eaf1-482a-9a65-2228d5b2f12d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','501391e1-22cc-4d2d-b849-fb3bcf18c388','{\"input\":{\"periodId\":\"16bd6215-98a8-4295-ad1b-76d3f1b28369\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"501391e1-22cc-4d2d-b849-fb3bcf18c388\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"periodId\":\"16bd6215-98a8-4295-ad1b-76d3f1b28369\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:45:33.392Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 07:45:33.396'),
('b7769513-3c30-4cc6-8460-a88b3f383266','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000002\"},\"after\":{\"id\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000005\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"ปรับ OFFPAGE จากภายนอก\",\"description\":\"ปรับ OFFPAGE จากภายนอก\\nทราฟฟิก และ แบ็คลิงค์\",\"progressPercent\":0,\"duration\":\"3 เดือน\",\"note\":null,\"orderIndex\":5,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:27:35.906Z\",\"updatedAt\":\"2026-05-27T09:30:25.180Z\",\"assignedToId\":null}}','2026-05-27 09:30:25.184'),
('b86798ea-f345-4c26-8e19-76cde16d5219','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','55f9deff-0769-4ab5-9ac5-a70455a5193b','{\"from\":false,\"to\":true,\"after\":{\"id\":\"55f9deff-0769-4ab5-9ac5-a70455a5193b\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"title\":\"เพิ่ม แบ็คลิงค์\",\"isDone\":true,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":\"2026-05-27T10:01:19.897Z\",\"createdAt\":\"2026-05-27T10:01:18.408Z\",\"updatedAt\":\"2026-05-27T10:01:19.898Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:01:19.901'),
('b86e9328-dc91-477c-b4b1-be49cf502552','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','ae708ed9-c84d-4f19-ac61-22715869ef7e','{\"input\":{\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"ae708ed9-c84d-4f19-ac61-22715869ef7e\",\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:51:47.992Z\"},\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\"}','2026-05-25 07:51:47.996'),
('b92e48b3-cfad-4245-bcf7-bfa4a7ae7f53','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','2e62a368-5687-4a8c-a90d-cc3f2757f562','{\"input\":{\"periodId\":\"4bd799e5-1217-4e67-9194-dece439a139f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"2e62a368-5687-4a8c-a90d-cc3f2757f562\",\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\",\"periodId\":\"4bd799e5-1217-4e67-9194-dece439a139f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:38.517Z\"},\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\"}','2026-05-26 08:22:38.520'),
('bb4aad53-6a44-43df-b56d-fd60f24b7585','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','e6b70c99-bb2a-4dd4-91b7-315c785c65b3','{\"input\":{\"periodId\":\"9cfa1e89-2207-47ee-9a03-f970e134f745\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"e6b70c99-bb2a-4dd4-91b7-315c785c65b3\",\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"periodId\":\"9cfa1e89-2207-47ee-9a03-f970e134f745\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:46:28.868Z\"},\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\"}','2026-05-25 07:46:28.872'),
('bc240ae0-7768-452c-9f72-b39f9a0946d7','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','c9f52b29-ed85-4e52-8995-a612b2bf0ff0','{\"entity\":{\"id\":\"c9f52b29-ed85-4e52-8995-a612b2bf0ff0\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสนอราคา\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-25T07:45:58.539Z\",\"createdAt\":\"2026-05-25T07:45:51.088Z\",\"updatedAt\":\"2026-05-25T07:45:58.540Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:38:10.428'),
('bc40df45-3683-4a2b-bceb-c0b0267befa0','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','6fa3c854-d3d9-4863-b0ef-5f011eb62800','{\"input\":{\"periodId\":\"cd635770-4df3-4d9a-8ade-2cb1d7a7aac4\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"6fa3c854-d3d9-4863-b0ef-5f011eb62800\",\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\",\"periodId\":\"cd635770-4df3-4d9a-8ade-2cb1d7a7aac4\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:33.635Z\"},\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\"}','2026-05-26 08:22:33.638'),
('bf127da9-4052-45f9-a531-acd89f347197','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','10c81a80-82f6-424c-9b36-3fb6d3c02b45','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"10c81a80-82f6-424c-9b36-3fb6d3c02b45\",\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:20:41.210Z\"},\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\"}','2026-05-26 08:20:41.213'),
('bf94fffa-89cc-492f-b3ac-5620cee07edf','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','616e547a-aea6-4183-8d81-95fe9985adf5','{\"input\":{\"periodId\":\"cc878f77-ac38-455d-8683-38275bf46111\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"616e547a-aea6-4183-8d81-95fe9985adf5\",\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\",\"periodId\":\"cc878f77-ac38-455d-8683-38275bf46111\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:01:57.330Z\"},\"itemId\":\"e8ffb40d-d2ac-4d1f-a15d-d4e131337d86\"}','2026-05-26 08:01:57.333'),
('c0c23add-b093-4484-b8df-6c2c188f3f0c','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\"}','2026-05-26 07:52:17.490'),
('c0fcc9bc-208b-4d8d-92df-1f01ec689d2f','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','f06b0853-b2de-4fba-b368-ed213706d815','{\"input\":{\"title\":\"เพิ่มทราฟฟิก\"},\"after\":{\"id\":\"f06b0853-b2de-4fba-b368-ed213706d815\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"title\":\"เพิ่มทราฟฟิก\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T10:01:32.391Z\",\"updatedAt\":\"2026-05-27T10:01:32.391Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 10:01:32.393'),
('c1631343-c895-4dfc-b482-c142d74d0169','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','18232fd8-df34-43d5-bd3a-39f034373f66','{\"input\":{\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"18232fd8-df34-43d5-bd3a-39f034373f66\",\"itemId\":\"c003a90a-0121-4a22-8908-b7b5ea860a11\",\"periodId\":\"53dd5567-f3cd-4757-822f-a059c6284edf\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:53:36.871Z\"},\"itemId\":\"c003a90a-0121-4a22-8908-b7b5ea860a11\"}','2026-05-25 07:53:36.875'),
('c1fec88b-6ed2-40f9-822e-b8ef3657d7d7','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','139e64cb-d3be-4fd8-875a-77392d6c2be6','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"139e64cb-d3be-4fd8-875a-77392d6c2be6\",\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:24:11.154Z\"},\"itemId\":\"900031ee-e810-464e-9738-0e2cb93d9801\"}','2026-05-26 08:24:11.157'),
('c2b2406a-6847-4986-b521-93afacaec8e6','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','beda5e67-c568-4ec4-bc94-b368ea882543','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"beda5e67-c568-4ec4-bc94-b368ea882543\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T07:52:09.391Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 07:52:09.395'),
('c4ae16d6-f1b9-489d-a17b-7298d7311ab9','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','9215b5d7-9569-4946-b2ad-a8c1ce3ba8af','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T08:05:06.752Z\"},\"after\":{\"id\":\"9215b5d7-9569-4946-b2ad-a8c1ce3ba8af\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000007\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"รายงานลูกค้าทุกเดือน\",\"description\":\"รายงานลูกค้าทุกเดือน สามารถเข้าสู่ระบบ ดูรายละเอียดได้ทุกเดือน อัพเดทช่วงวันที่ 25-30 ของเดือนนั้นๆ\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":7,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T08:05:06.752Z\",\"createdAt\":\"2026-05-26T07:58:29.216Z\",\"updatedAt\":\"2026-05-26T08:05:06.753Z\",\"assignedToId\":null}}','2026-05-26 08:05:06.758'),
('c654b944-8ca2-41ad-b39d-d82301b46008','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','2e7e2ad1-d403-476a-b66f-9b1406a61968','{\"entity\":{\"id\":\"2e7e2ad1-d403-476a-b66f-9b1406a61968\",\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\",\"title\":\"เอกสารสัญาญา (หากมี)\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:58:29.195Z\",\"updatedAt\":\"2026-05-26T07:58:29.195Z\"},\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\"}','2026-05-26 08:01:33.858'),
('c6e0b5c5-1edf-466c-b873-9337bc4b6104','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','16739289-335f-4fd3-9e5a-64c7301627b6','{\"from\":false,\"to\":true,\"after\":{\"id\":\"16739289-335f-4fd3-9e5a-64c7301627b6\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":true,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:52:12.992Z\",\"createdAt\":\"2026-05-26T08:30:45.144Z\",\"updatedAt\":\"2026-05-26T08:52:12.993Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:52:12.996'),
('c71d25a2-87a1-4953-aba3-1addf406b257','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','b699f02a-8221-4294-a0cc-ed5184dc0985','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:59:45.311Z\"},\"after\":{\"id\":\"b699f02a-8221-4294-a0cc-ed5184dc0985\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"วิเคราะคีย์ วางแผนคีย์\",\"description\":\"วิเคราะคีย์ วางแผนคีย์\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":1,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:59:45.311Z\",\"createdAt\":\"2026-05-26T07:58:29.197Z\",\"updatedAt\":\"2026-05-26T07:59:45.312Z\",\"assignedToId\":null}}','2026-05-26 07:59:45.316'),
('c891b867-0ac5-4ec1-bbec-22a0eaca6402','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','2f71e96d-8a3a-4038-b4d7-1ce53c135e35','{\"input\":{\"periodId\":\"64d32d81-6a93-4964-8c00-9776dea9f009\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"2f71e96d-8a3a-4038-b4d7-1ce53c135e35\",\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\",\"periodId\":\"64d32d81-6a93-4964-8c00-9776dea9f009\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:19.848Z\"},\"itemId\":\"59e90d7d-1346-4307-8665-620511f2c354\"}','2026-05-25 07:56:19.851'),
('c94fa8fe-fb34-4315-a978-bf16062d5c90','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_CLEARED','MARK',NULL,'{\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\"}','2026-05-25 07:48:18.176'),
('c9a93a8b-b67c-4cf1-9bce-f2855f85f020','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','51ca57b4-b6d1-4b03-83ae-9df2b823cb4b','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-27T09:28:42.086Z\"},\"after\":{\"id\":\"51ca57b4-b6d1-4b03-83ae-9df2b823cb4b\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000003\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"description\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"progressPercent\":0,\"duration\":\"1 เดือน\",\"note\":null,\"orderIndex\":4,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-27T09:28:42.086Z\",\"createdAt\":\"2026-05-27T09:27:35.902Z\",\"updatedAt\":\"2026-05-27T09:28:42.087Z\",\"assignedToId\":null}}','2026-05-27 09:28:42.090'),
('ca328b82-e490-4364-bd60-30d2fdb8aafb','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','6adcbda7-dc88-4641-9c3a-6a123b578c15','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T07:59:52.999Z\"},\"after\":{\"id\":\"6adcbda7-dc88-4641-9c3a-6a123b578c15\",\"planId\":\"9f731b50-2cb4-4692-80ed-8e3b311c0999\",\"categoryId\":\"00000000-0000-4000-8001-000000000004\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"ตรวจสอบเว็บไซต์ลูกค้า\",\"description\":\"ตรวจสอบเว็บไซต์ลูกค้า ความเร็ว และปัญหา เพื่อให้เหมาะสมกับการทำ SEO\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":3,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T07:59:52.999Z\",\"createdAt\":\"2026-05-26T07:58:29.205Z\",\"updatedAt\":\"2026-05-26T07:59:53.000Z\",\"assignedToId\":null}}','2026-05-26 07:59:53.003'),
('cac1dbe4-da0b-44d3-a43f-12fa27769e92','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','e4afd696-93ac-49c1-aec6-cc210cb2e2b8','{\"input\":{\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"e4afd696-93ac-49c1-aec6-cc210cb2e2b8\",\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\",\"periodId\":\"7c74cb42-6130-4fa8-9bde-fdbc5256b41f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:56:33.056Z\"},\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\"}','2026-05-27 09:56:33.060'),
('cb6b62fc-8f0e-482a-a44d-28153ac8e871','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','7775a80f-74ce-48d3-a882-9fc580944253','{\"entity\":{\"id\":\"7775a80f-74ce-48d3-a882-9fc580944253\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/กำกับภาษี\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:01.354Z\",\"updatedAt\":\"2026-05-25T08:43:01.354Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:43:01.831'),
('cc529bc3-a1d5-4509-ac62-dca4857d5d69','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','0b2ecefd-b95a-40df-91f2-02702a559dcf','{\"input\":{\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"0b2ecefd-b95a-40df-91f2-02702a559dcf\",\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"periodId\":\"d3632b4f-5bcb-4cfa-a6d9-b35643b58505\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:51:45.232Z\"},\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\"}','2026-05-25 07:51:45.236'),
('d1161041-56d0-4e23-8846-e8bb337636cf','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','4a6d5a78-bd24-4856-bcba-082fbbe14a84','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"4a6d5a78-bd24-4856-bcba-082fbbe14a84\",\"itemId\":\"8fa9e27a-6c41-4c9f-8ad1-6d8dff060004\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T07:56:26.770Z\"},\"itemId\":\"8fa9e27a-6c41-4c9f-8ad1-6d8dff060004\"}','2026-05-26 07:56:26.773'),
('d231ad97-34c2-4671-bfec-8f0b5e13c312','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','6d592762-0eeb-43c8-bef1-bc7567422944','{\"from\":false,\"to\":true,\"after\":{\"id\":\"6d592762-0eeb-43c8-bef1-bc7567422944\",\"itemId\":\"ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8\",\"title\":\"ติดตั้งโค้ตที่เกี่ยวข้อง\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:07:02.773Z\",\"createdAt\":\"2026-05-26T07:51:45.609Z\",\"updatedAt\":\"2026-05-26T08:07:02.774Z\"},\"itemId\":\"ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8\"}','2026-05-26 08:07:02.776'),
('d2a00df8-ea88-4e6c-bac2-7def5cfbcadb','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','17e0cf28-3a55-44bd-82be-3b13012e7ee1','{\"input\":{\"periodId\":\"b6d11e89-ba3c-4a74-b548-08c933f4afc7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"17e0cf28-3a55-44bd-82be-3b13012e7ee1\",\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\",\"periodId\":\"b6d11e89-ba3c-4a74-b548-08c933f4afc7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:40.255Z\"},\"itemId\":\"8ad7b003-a17e-4916-b0a8-f86c675dfc0f\"}','2026-05-26 08:22:40.258'),
('d6500932-a029-4964-adea-7b021b002138','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','be7af798-0aaf-4984-b74d-ababccc915b0','{\"input\":{\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"be7af798-0aaf-4984-b74d-ababccc915b0\",\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\",\"periodId\":\"bed3fc28-d68a-491a-99c1-07ccae84e93f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T10:00:24.455Z\"},\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\"}','2026-05-27 10:00:24.458'),
('d7a64e33-275f-4267-a4c5-207b42844419','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','e323d945-81ab-41da-88b7-42adbefc5c0d','{\"input\":{\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"e323d945-81ab-41da-88b7-42adbefc5c0d\",\"itemId\":\"596e298b-b03c-4fdc-b374-e3320775950d\",\"periodId\":\"d00668f8-ce62-4238-ad9a-975675431268\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:16.421Z\"},\"itemId\":\"596e298b-b03c-4fdc-b374-e3320775950d\"}','2026-05-26 08:22:16.425'),
('d814c5d9-aaaf-4bfe-9dde-7a84074d598f','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','b5c7033d-d3fc-40b2-a64d-91ed986dddb5','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-27T09:27:52.076Z\"},\"after\":{\"id\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\",\"planId\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"วิเคราะคีย์ วางแผนคีย์\",\"description\":\"วิเคราะคีย์ วางแผนคีย์\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":1,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-27T09:27:52.076Z\",\"createdAt\":\"2026-05-27T09:27:35.891Z\",\"updatedAt\":\"2026-05-27T09:27:52.077Z\",\"assignedToId\":null}}','2026-05-27 09:27:52.081'),
('d834fb92-d023-4dfc-a744-71b85d6c7873','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','8629f9d8-a291-41ef-b41a-ed531ef19be9','{\"input\":{\"title\":\"หลักฐานการชำระเงิน\"},\"after\":{\"id\":\"8629f9d8-a291-41ef-b41a-ed531ef19be9\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":false,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:47:52.370Z\",\"updatedAt\":\"2026-05-25T08:47:52.370Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-25 08:47:52.373'),
('d8910f52-10d6-45cf-81e1-03e36ed8bf80','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','c6b1ea16-dbf6-41a6-9e40-37d0215ef6f7','{\"input\":{\"periodId\":\"0bb4c2dc-bd6b-450f-ad90-c44be3bec4b3\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"c6b1ea16-dbf6-41a6-9e40-37d0215ef6f7\",\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\",\"periodId\":\"0bb4c2dc-bd6b-450f-ad90-c44be3bec4b3\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:29:40.778Z\"},\"itemId\":\"83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1\"}','2026-05-27 09:29:40.781'),
('d8a2b70b-57dc-47b8-ba03-087393efa847','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','8e55610b-29a8-4597-9d6f-ba7f195258df','{\"input\":{\"periodId\":\"edd567e0-269c-44f7-a254-db80962b98f7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"8e55610b-29a8-4597-9d6f-ba7f195258df\",\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\",\"periodId\":\"edd567e0-269c-44f7-a254-db80962b98f7\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:16.009Z\"},\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\"}','2026-05-25 07:56:16.012'),
('da35fe78-ab88-480e-b7c5-c0d1f06cb81d','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','ba3c50d9-d4f0-4765-b967-07f8daab63fa','{\"from\":false,\"to\":true,\"after\":{\"id\":\"ba3c50d9-d4f0-4765-b967-07f8daab63fa\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"สัญญา NDA\",\"isDone\":true,\"orderIndex\":5,\"assignedToId\":null,\"completedAt\":\"2026-05-27T04:06:45.143Z\",\"createdAt\":\"2026-05-25T09:13:46.708Z\",\"updatedAt\":\"2026-05-27T04:06:45.144Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-27 04:06:45.147'),
('daeb94cc-d803-42fb-91a7-622acf5edf3c','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','d42e8276-ed32-43f7-941d-23d1a1620781','{\"from\":true,\"to\":false,\"after\":{\"id\":\"d42e8276-ed32-43f7-941d-23d1a1620781\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"ใบเสร็จ/ใบกำกับภาษี\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:16.352Z\",\"updatedAt\":\"2026-05-26T03:59:25.596Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 03:59:25.598'),
('dc840087-48a2-4566-9046-a8b181658425','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','eec0f3d6-718e-4005-bee7-ea2f61f56a8a','{\"from\":false,\"to\":true,\"after\":{\"id\":\"eec0f3d6-718e-4005-bee7-ea2f61f56a8a\",\"itemId\":\"6785a560-1536-4639-bfbb-be8344fcbd87\",\"title\":\"วิเคราะคีย์\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T07:56:15.986Z\",\"createdAt\":\"2026-05-26T07:51:45.607Z\",\"updatedAt\":\"2026-05-26T07:56:15.987Z\"},\"itemId\":\"6785a560-1536-4639-bfbb-be8344fcbd87\"}','2026-05-26 07:56:15.990'),
('dc9cc3c3-cdc3-4ab5-a817-1db2cbe75b24','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','a36de58b-2a61-4bbe-8f63-0ca7945c88b2','{\"from\":false,\"to\":true,\"after\":{\"id\":\"a36de58b-2a61-4bbe-8f63-0ca7945c88b2\",\"itemId\":\"51ca57b4-b6d1-4b03-83ae-9df2b823cb4b\",\"title\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-27T09:28:46.380Z\",\"createdAt\":\"2026-05-27T09:27:35.905Z\",\"updatedAt\":\"2026-05-27T09:28:46.381Z\"},\"itemId\":\"51ca57b4-b6d1-4b03-83ae-9df2b823cb4b\"}','2026-05-27 09:28:46.384'),
('dce91f25-0f48-47f7-8ddd-f11dc96ba428','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','c8b3a032-5a6a-4fbe-8fad-b9ac066cc807','{\"input\":{\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"c8b3a032-5a6a-4fbe-8fad-b9ac066cc807\",\"itemId\":\"ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8\",\"periodId\":\"cbfdae26-2407-47f0-aa69-01afea730662\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T07:54:35.646Z\"},\"itemId\":\"ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8\"}','2026-05-26 07:54:35.649'),
('dd78301f-ac5a-4804-ac48-9c3a7ec0f4e1','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','09c14c39-3279-4a0e-b3b3-accd7e911eff','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000006\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ตั้งค่า GSC / Analytics วิเคราะห์\",\"description\":\"ตรวจเช้คเว็บให้พร้อมสำหรับจัดทำ SEO\",\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000006\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ตั้งค่า GSC / Analytics วิเคราะห์\",\"description\":\"ตรวจเช้คเว็บให้พร้อมสำหรับจัดทำ SEO\",\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000006\",\"statusId\":\"00000000-0000-4000-8002-000000000001\",\"activity\":\"ตั้งค่า GSC / Analytics วิเคราะห์\",\"description\":\"ตรวจเช้คเว็บให้พร้อมสำหรับจัดทำ SEO\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":3,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.577Z\",\"updatedAt\":\"2026-05-25T07:49:25.876Z\",\"assignedToId\":null}}','2026-05-25 07:49:25.881'),
('df0d059c-2af4-48ed-8c37-13d40ae237ca','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','23403498-744b-45df-8277-a50ccc8d21e0','{\"from\":false,\"to\":true,\"after\":{\"id\":\"23403498-744b-45df-8277-a50ccc8d21e0\",\"itemId\":\"6adcbda7-dc88-4641-9c3a-6a123b578c15\",\"title\":\"ตรวจสอบเว็บไซต์ลูกค้า\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:01:01.262Z\",\"createdAt\":\"2026-05-26T07:58:29.206Z\",\"updatedAt\":\"2026-05-26T08:01:01.263Z\"},\"itemId\":\"6adcbda7-dc88-4641-9c3a-6a123b578c15\"}','2026-05-26 08:01:01.266'),
('e0062715-32cf-4c19-bd59-ec3890f81194','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','1fa563f5-77b0-4ab8-8dfc-2fa11e226449','{\"from\":false,\"to\":true,\"after\":{\"id\":\"1fa563f5-77b0-4ab8-8dfc-2fa11e226449\",\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\",\"title\":\"เอกสาร PO\",\"isDone\":true,\"orderIndex\":5,\"assignedToId\":null,\"completedAt\":\"2026-05-26T08:49:42.457Z\",\"createdAt\":\"2026-05-26T08:49:14.908Z\",\"updatedAt\":\"2026-05-26T08:49:42.458Z\"},\"itemId\":\"2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a\"}','2026-05-26 08:49:42.461'),
('e00f2ebe-d677-4485-85f1-485c91b57d68','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','56399859-45ed-40d7-a95b-1d3abf27a28d','{\"input\":{\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"56399859-45ed-40d7-a95b-1d3abf27a28d\",\"itemId\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\",\"periodId\":\"6f9ab246-b791-410b-adce-687c5079b7bd\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T07:55:32.974Z\"},\"itemId\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\"}','2026-05-26 07:55:32.977'),
('e1ec8a22-d3ff-44a1-a16c-02deb1560125','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','PLAN_CREATED','PLAN','62835ed8-01b0-4ffb-b365-a922948ea382','{\"input\":{\"title\":\"SEO PNA\",\"periodType\":\"YEAR_12_MONTHS\",\"startMonth\":6,\"startYear\":2026,\"endMonth\":5,\"endYear\":2027,\"packageName\":\"พิเศษ\",\"note\":null,\"templateId\":\"ddceea2f-474f-44bf-9323-ca1756fc86bb\"},\"after\":{\"id\":\"62835ed8-01b0-4ffb-b365-a922948ea382\",\"title\":\"SEO PNA\",\"periodType\":\"YEAR_12_MONTHS\",\"year\":2026,\"startDate\":\"2026-05-31T17:00:00.000Z\",\"endDate\":\"2027-05-30T17:00:00.000Z\",\"packageName\":\"พิเศษ\",\"note\":null,\"isArchived\":false,\"createdAt\":\"2026-05-27T09:27:35.874Z\",\"updatedAt\":\"2026-05-27T09:27:35.874Z\",\"customerId\":\"c4fd4aaa-1c09-4355-bb5e-732309fc0e9e\",\"createdById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\"},\"source\":\"template\",\"templateId\":\"ddceea2f-474f-44bf-9323-ca1756fc86bb\"}','2026-05-27 09:27:35.918'),
('e373d0c8-315a-489d-894e-031754ed6455','05226ec5-75c7-425b-9084-c0130c794f19','888f6fb4-c911-4e4a-8fda-bb172a6928a4','PLAN_CREATED','PLAN','05226ec5-75c7-425b-9084-c0130c794f19','{\"input\":{\"title\":\"55555555555\",\"periodType\":\"YEAR_12_MONTHS\",\"year\":2026,\"packageName\":null,\"note\":null,\"templateId\":\"00000000-0000-4000-8000-000000000001\"},\"after\":{\"id\":\"05226ec5-75c7-425b-9084-c0130c794f19\",\"title\":\"55555555555\",\"periodType\":\"YEAR_12_MONTHS\",\"year\":2026,\"startDate\":\"2025-12-31T17:00:00.000Z\",\"endDate\":\"2026-12-30T17:00:00.000Z\",\"packageName\":null,\"note\":null,\"isArchived\":false,\"createdAt\":\"2026-05-25T09:00:08.194Z\",\"updatedAt\":\"2026-05-25T09:00:08.194Z\",\"customerId\":\"68212a2c-e01b-48a3-877b-aebb07ea28d4\",\"createdById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\"},\"source\":\"template\",\"templateId\":\"00000000-0000-4000-8000-000000000001\"}','2026-05-25 09:00:08.238'),
('e3983f42-2f90-4d18-9c21-e276c7925288','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','7ceda713-197b-4c03-a9ce-2b5a32a62c2e','{\"input\":{\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"7ceda713-197b-4c03-a9ce-2b5a32a62c2e\",\"itemId\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:49:49.125Z\"},\"itemId\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\"}','2026-05-25 07:49:49.129'),
('e6480b7c-4435-4cd9-a170-50683ab6c17f','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','002355c7-a7f0-4a9d-a84b-b7847b0bf9c5','{\"from\":false,\"to\":true,\"after\":{\"id\":\"002355c7-a7f0-4a9d-a84b-b7847b0bf9c5\",\"itemId\":\"9a2f90d5-ddad-4149-9574-16b73af8da71\",\"title\":\"ตรวจสอบเว็บไซต์ลูกค้า\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-27T09:28:23.809Z\",\"createdAt\":\"2026-05-27T09:27:35.901Z\",\"updatedAt\":\"2026-05-27T09:28:23.810Z\"},\"itemId\":\"9a2f90d5-ddad-4149-9574-16b73af8da71\"}','2026-05-27 09:28:23.814'),
('e71f3453-41eb-4457-91f4-8a46a63ca7e2','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','8629f9d8-a291-41ef-b41a-ed531ef19be9','{\"from\":false,\"to\":true,\"after\":{\"id\":\"8629f9d8-a291-41ef-b41a-ed531ef19be9\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"หลักฐานการชำระเงิน\",\"isDone\":true,\"orderIndex\":4,\"assignedToId\":null,\"completedAt\":\"2026-05-26T04:01:04.980Z\",\"createdAt\":\"2026-05-25T08:47:52.370Z\",\"updatedAt\":\"2026-05-26T04:01:04.981Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 04:01:04.984'),
('e74483e3-a947-47dc-bef4-2f1d6a1ef1c8','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','4e7dc5f8-12f5-47ee-bc96-4b7b668e3a36','{\"input\":{\"periodId\":\"594cdf1f-1933-4b09-9e3b-ed805a72d140\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"4e7dc5f8-12f5-47ee-bc96-4b7b668e3a36\",\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\",\"periodId\":\"594cdf1f-1933-4b09-9e3b-ed805a72d140\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:11.856Z\"},\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\"}','2026-05-25 07:56:11.859'),
('e80b7b02-0962-4e2a-90c4-c05e978cb4d1','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','445b6e8b-d033-456b-9c3b-c01843ab8208','{\"from\":true,\"to\":false,\"after\":{\"id\":\"445b6e8b-d033-456b-9c3b-c01843ab8208\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"ทราฟฟิก และ แบ็คลิงค์\",\"isDone\":false,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:51:45.617Z\",\"updatedAt\":\"2026-05-26T07:55:12.876Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 07:55:12.879'),
('e8f3e4d9-e636-4ca8-bd59-6fa0505d2274','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','39024731-3970-4266-adb1-f65eb7e1a220','{\"input\":{\"title\":\"เอกสารวางบิล\"},\"after\":{\"id\":\"39024731-3970-4266-adb1-f65eb7e1a220\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"title\":\"เอกสารวางบิล\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-27T09:29:13.486Z\",\"updatedAt\":\"2026-05-27T09:29:13.486Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\"}','2026-05-27 09:29:13.489'),
('e8f6e4f0-db12-4433-a87c-1ee2a35616d7','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','167f5b82-877a-46eb-bf20-7ca1bcd617de','{\"input\":{\"periodId\":\"e1da01aa-6923-4299-ad36-1810289ce77b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"167f5b82-877a-46eb-bf20-7ca1bcd617de\",\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\",\"periodId\":\"e1da01aa-6923-4299-ad36-1810289ce77b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:56:14.687Z\"},\"itemId\":\"67f03652-b37e-477f-9d66-bae8e9fb8c60\"}','2026-05-25 07:56:14.690'),
('e9efc62c-8b5e-4f2b-84fd-c7c5e770ebe0','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_REORDERED','ITEM',NULL,'{\"input\":{\"order\":[{\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"orderIndex\":0},{\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"orderIndex\":1},{\"itemId\":\"331aa183-adff-4ca8-af44-7b489a378eeb\",\"orderIndex\":2},{\"itemId\":\"09c14c39-3279-4a0e-b3b3-accd7e911eff\",\"orderIndex\":3},{\"itemId\":\"50315187-0724-4e93-a878-b6209c64e0a5\",\"orderIndex\":4},{\"itemId\":\"9d9da962-a053-4319-87f4-150db07a7920\",\"orderIndex\":5},{\"itemId\":\"c003a90a-0121-4a22-8908-b7b5ea860a11\",\"orderIndex\":6},{\"itemId\":\"9ae31dc6-2117-4653-92c0-b79ea89f0bba\",\"orderIndex\":7},{\"itemId\":\"e6bd1217-440d-4783-ba06-41a7a24e1787\",\"orderIndex\":8}]}}','2026-05-25 07:53:26.394'),
('ea7386e2-ab40-46db-a109-6f620980d50f','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','b41c3055-6a19-4c33-afd0-b3cd768c3fd1','{\"input\":{\"periodId\":\"2057d65c-23ef-4514-9ea6-fb81383d93f6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"b41c3055-6a19-4c33-afd0-b3cd768c3fd1\",\"itemId\":\"46e10acb-11a4-4f10-bda8-7ea9f470168d\",\"periodId\":\"2057d65c-23ef-4514-9ea6-fb81383d93f6\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-27T09:29:46.326Z\"},\"itemId\":\"46e10acb-11a4-4f10-bda8-7ea9f470168d\"}','2026-05-27 09:29:46.329'),
('ed18c6d3-3c18-457f-9066-d58cab1449c8','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','672161a5-50a8-4461-99ac-11a4d36c7208','{\"from\":true,\"to\":false,\"after\":{\"id\":\"672161a5-50a8-4461-99ac-11a4d36c7208\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"title\":\"เอกสารหัก ณ ที่จ่าย\",\"isDone\":false,\"orderIndex\":3,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T08:43:27.063Z\",\"updatedAt\":\"2026-05-26T03:59:23.926Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 03:59:23.929'),
('ed561764-fe9d-4dfb-a610-d5616000a3c1','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','a21a190c-5394-4b4a-a722-cc9f05392164','{\"input\":{\"periodId\":\"4bd799e5-1217-4e67-9194-dece439a139f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"a21a190c-5394-4b4a-a722-cc9f05392164\",\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\",\"periodId\":\"4bd799e5-1217-4e67-9194-dece439a139f\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:22:48.235Z\"},\"itemId\":\"6629cf93-bd1c-4018-83bb-9b4b1b862430\"}','2026-05-26 08:22:48.239'),
('effc1fa6-2f38-4e52-9c20-05e4263716d4','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_CREATED','SUBTASK','44834fc5-1322-412f-bac6-3404959ddc37','{\"input\":{\"title\":\"ฺbacklink\"},\"after\":{\"id\":\"44834fc5-1322-412f-bac6-3404959ddc37\",\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\",\"title\":\"ฺbacklink\",\"isDone\":false,\"orderIndex\":1,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T08:28:56.984Z\",\"updatedAt\":\"2026-05-26T08:28:56.984Z\"},\"itemId\":\"1a7251f9-dc62-405f-a656-13f60c652279\"}','2026-05-26 08:28:56.986'),
('f08ef827-64cc-4576-ad2c-193d5b82733c','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','9db7d893-e7c3-4f32-b807-66406fbd63f2','{\"after\":{\"id\":\"9db7d893-e7c3-4f32-b807-66406fbd63f2\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/___________________1779855086053_b6ad63d6.pdf\",\"filename\":\"___________________1779855086053_b6ad63d6.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":106496,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-27T04:11:26.057Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"filename\":\"___________________1779855086053_b6ad63d6.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":106496,\"caption\":null}','2026-05-27 04:11:26.060'),
('f0b510dc-c562-4a51-91ec-f681f7fcd838','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','5a213f5e-af08-4cbf-b931-332b188c2dbd','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"5a213f5e-af08-4cbf-b931-332b188c2dbd\",\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:00:28.210Z\"},\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\"}','2026-05-26 08:00:28.214'),
('f1121410-bee4-4ee1-bc4f-a452f7e193ec','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','2e6a12f9-92d6-4e63-821d-b4495e421a16','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"2e6a12f9-92d6-4e63-821d-b4495e421a16\",\"itemId\":\"6adcbda7-dc88-4641-9c3a-6a123b578c15\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-26T08:00:58.974Z\"},\"itemId\":\"6adcbda7-dc88-4641-9c3a-6a123b578c15\"}','2026-05-26 08:00:58.977'),
('f26daf09-f2f8-4746-b4f2-4171efaee850','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','f9ccafbc-7df3-434d-a944-bbd0ddc3ac41','{\"input\":{\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"f9ccafbc-7df3-434d-a944-bbd0ddc3ac41\",\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\",\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T03:59:04.495Z\"},\"itemId\":\"6aa3d567-8a0e-4ed5-824d-871975ccf367\"}','2026-05-26 03:59:04.511'),
('f3d0583c-d5bd-4292-b88a-7ffa1d3fa1a2','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','900031ee-e810-464e-9738-0e2cb93d9801','{\"input\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\"},\"patch\":{\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"completedAt\":\"2026-05-26T08:24:38.334Z\"},\"after\":{\"id\":\"900031ee-e810-464e-9738-0e2cb93d9801\",\"planId\":\"3dcca793-f000-4a80-adbd-65037a83784f\",\"categoryId\":\"00000000-0000-4000-8001-000000000007\",\"statusId\":\"00000000-0000-4000-8002-000000000003\",\"activity\":\"รายงานลูกค้าทุกเดือน\",\"description\":\"รายงานลูกค้าทุกเดือน สามารถเข้าสู่ระบบ ดูรายละเอียดได้ทุกเดือน อัพเดทช่วงวันที่ 25-30 ของเดือนนั้นๆ\",\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":7,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":\"2026-05-26T08:24:38.334Z\",\"createdAt\":\"2026-05-26T07:51:45.620Z\",\"updatedAt\":\"2026-05-26T08:24:38.335Z\",\"assignedToId\":null}}','2026-05-26 08:24:38.339'),
('f4f0a273-5a96-4999-aa62-b80210f55ad2','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','b9b1e909-ce63-4f80-88ad-864f7e42b10e','{\"input\":{\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"b9b1e909-ce63-4f80-88ad-864f7e42b10e\",\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"periodId\":\"1753f9eb-ea9d-4a51-abcc-8e3be26285b2\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-25T07:48:12.232Z\"},\"itemId\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\"}','2026-05-25 07:48:12.235'),
('f8a291dc-85d4-499f-ad3d-3ba79a489e18','05226ec5-75c7-425b-9084-c0130c794f19','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','fc7decea-f2a2-494a-a8fe-9c43775e0a82','{\"input\":{\"periodId\":\"e09af3b9-98db-4f51-86c0-275b1644b509\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":\"555555555555555\"},\"after\":{\"id\":\"fc7decea-f2a2-494a-a8fe-9c43775e0a82\",\"itemId\":\"f9709235-33c1-451d-9022-a5433d0d8db5\",\"periodId\":\"e09af3b9-98db-4f51-86c0-275b1644b509\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":\"555555555555555\",\"updatedAt\":\"2026-05-25T09:00:16.377Z\"},\"itemId\":\"f9709235-33c1-451d-9022-a5433d0d8db5\"}','2026-05-25 09:00:16.380'),
('f913afb4-3fb8-4fc9-89c2-d6bcb991e950','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','1e509c92-8a3c-48f0-a3ac-0fcd4d2f7d8b','{\"input\":{\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null},\"after\":{\"id\":\"1e509c92-8a3c-48f0-a3ac-0fcd4d2f7d8b\",\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\",\"periodId\":\"e43f51c4-7c83-485f-845d-676ed2eebb9e\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":100,\"note\":null,\"updatedAt\":\"2026-05-27T09:27:57.141Z\"},\"itemId\":\"b5c7033d-d3fc-40b2-a64d-91ed986dddb5\"}','2026-05-27 09:27:57.145'),
('fba1d243-54f5-4314-a700-2246eb1d8b88','62835ed8-01b0-4ffb-b365-a922948ea382','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ATTACHMENT_UPLOADED','ATTACHMENT','d2b0c4eb-091a-4430-9db4-b1d07739c219','{\"after\":{\"id\":\"d2b0c4eb-091a-4430-9db4-b1d07739c219\",\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"kind\":\"FILE\",\"url\":\"/uploads/work-progress/_______PNA_1779874287161_c4af4e49.pdf\",\"filename\":\"_______PNA_1779874287161_c4af4e49.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":40490,\"caption\":null,\"uploadedById\":\"888f6fb4-c911-4e4a-8fda-bb172a6928a4\",\"createdAt\":\"2026-05-27T09:31:27.163Z\"},\"itemId\":\"08d542e9-75f8-426d-9887-f32b9b8059a7\",\"filename\":\"_______PNA_1779874287161_c4af4e49.pdf\",\"mimeType\":\"application/pdf\",\"sizeBytes\":40490,\"caption\":null}','2026-05-27 09:31:27.165'),
('fcd7cd69-7152-452e-b39e-a90f6cb33691','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_UPDATED','ITEM','4126f67a-d157-4683-93af-c9eac2eb4f15','{\"input\":{\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"patch\":{\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์\",\"description\":null,\"duration\":\"1 week\",\"note\":null,\"weight\":1,\"progressPercent\":0},\"after\":{\"id\":\"4126f67a-d157-4683-93af-c9eac2eb4f15\",\"planId\":\"d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb\",\"categoryId\":\"00000000-0000-4000-8001-000000000001\",\"statusId\":\"00000000-0000-4000-8002-000000000002\",\"activity\":\"วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์\",\"description\":null,\"progressPercent\":0,\"duration\":\"1 week\",\"note\":null,\"orderIndex\":1,\"weight\":1,\"startDate\":null,\"dueDate\":null,\"completedAt\":null,\"createdAt\":\"2026-05-25T07:40:00.534Z\",\"updatedAt\":\"2026-05-25T07:55:20.513Z\",\"assignedToId\":null}}','2026-05-25 07:55:20.519'),
('ff5a1682-60f0-4eaf-aa04-64e506dae3a6','3dcca793-f000-4a80-adbd-65037a83784f','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_TOGGLED','SUBTASK','b81f706e-edf2-47ac-9cde-aab106cb93b4','{\"from\":false,\"to\":true,\"after\":{\"id\":\"b81f706e-edf2-47ac-9cde-aab106cb93b4\",\"itemId\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\",\"title\":\"เข้าปรับแต่งเว็บไซต์ลูกค้า\",\"isDone\":true,\"orderIndex\":0,\"assignedToId\":null,\"completedAt\":\"2026-05-26T07:55:02.324Z\",\"createdAt\":\"2026-05-26T07:51:45.614Z\",\"updatedAt\":\"2026-05-26T07:55:02.325Z\"},\"itemId\":\"1060346e-1e75-4e0b-a6a6-dc15d40a25e8\"}','2026-05-26 07:55:02.328'),
('ff7b36b0-3379-49e7-823c-a512961cc729','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','888f6fb4-c911-4e4a-8fda-bb172a6928a4','ITEM_BULK_DELETED','ITEM',NULL,'{\"input\":{\"itemIds\":[\"f30a8ca7-f5a4-4454-81fb-9980325975a7\",\"3e868e17-bef8-4eeb-9b1e-186f24a0e1ca\",\"7da750df-7046-49df-b12c-7dd97583f1b0\",\"ffad80a5-65a9-4a3a-a179-8cf0725475f6\",\"5c035873-d05c-4777-84b0-b2601acece39\",\"10f8f30c-69b8-4b25-a4fa-379af7c2502b\",\"c30a1847-e30b-4264-9828-ae906a002442\",\"0df9f41b-8f03-459e-8cab-34ce95464937\",\"77f2d15b-2345-46b9-93db-1ed29fd071c5\",\"04ad0785-4ba8-4836-8b41-7ee44ba70393\",\"569306e8-fad1-4087-87de-80497c59021d\"]},\"after\":{\"count\":11}}','2026-05-25 07:42:34.862'),
('ffd65d07-e9c5-4844-9bf1-a8d2cd3b6b84','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','MARK_SET','MARK','3fab7f7f-d628-4956-9358-b6d4c88beed1','{\"input\":{\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null},\"after\":{\"id\":\"3fab7f7f-d628-4956-9358-b6d4c88beed1\",\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\",\"periodId\":\"6d206511-353f-40f2-b7dc-3f0b48149a0b\",\"markTypeId\":\"00000000-0000-4000-8003-000000000001\",\"progressPercent\":null,\"note\":null,\"updatedAt\":\"2026-05-26T08:21:14.447Z\"},\"itemId\":\"f4a487d3-da47-4b9f-b716-cbbe36e8857f\"}','2026-05-26 08:21:14.450'),
('fffadf52-c045-428c-b26b-246ed697e75d','9f731b50-2cb4-4692-80ed-8e3b311c0999','888f6fb4-c911-4e4a-8fda-bb172a6928a4','SUBTASK_DELETED','SUBTASK','647e18f9-a6c0-49ef-b058-48f5d1f21516','{\"entity\":{\"id\":\"647e18f9-a6c0-49ef-b058-48f5d1f21516\",\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\",\"title\":\"ใบวางบิล (หากมี)\",\"isDone\":false,\"orderIndex\":2,\"assignedToId\":null,\"completedAt\":null,\"createdAt\":\"2026-05-26T07:58:29.195Z\",\"updatedAt\":\"2026-05-26T07:58:29.195Z\"},\"itemId\":\"91420496-3589-4123-b9ad-46bfc8f06f91\"}','2026-05-26 08:01:34.668');
/*!40000 ALTER TABLE `workprogressactivity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressattachment`
--

DROP TABLE IF EXISTS `workprogressattachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressattachment` (
  `id` varchar(191) NOT NULL,
  `itemId` varchar(191) NOT NULL,
  `kind` varchar(191) NOT NULL,
  `url` text NOT NULL,
  `filename` varchar(191) DEFAULT NULL,
  `mimeType` varchar(191) DEFAULT NULL,
  `sizeBytes` int(11) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `uploadedById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `workprogressattachment_itemId_idx` (`itemId`),
  KEY `workprogressattachment_uploadedById_fkey` (`uploadedById`),
  CONSTRAINT `workprogressattachment_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workprogressattachment_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressattachment`
--

LOCK TABLES `workprogressattachment` WRITE;
/*!40000 ALTER TABLE `workprogressattachment` DISABLE KEYS */;
INSERT INTO `workprogressattachment` VALUES
('19674e18-d48e-474d-b694-e839382d9eb0','6aa3d567-8a0e-4ed5-824d-871975ccf367','FILE','/uploads/work-progress/_____________________1779700954980_1624da58.pdf','_____________________1779700954980_1624da58.pdf','application/pdf',2810892,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-25 09:22:34.989'),
('2be9d523-ee38-431d-8d5b-706ea7478fb7','6aa3d567-8a0e-4ed5-824d-871975ccf367','FILE','/uploads/work-progress/__________________1779700561774_36aa2927.pdf','__________________1779700561774_36aa2927.pdf','application/pdf',204076,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-25 09:16:01.777'),
('3c90a7a1-d6fc-4b11-9607-39b08360d124','6aa3d567-8a0e-4ed5-824d-871975ccf367','FILE','/uploads/work-progress/_______________1779855094135_b3b45edd.pdf','_______________1779855094135_b3b45edd.pdf','application/pdf',107427,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 04:11:34.137'),
('6f1ba841-23ca-478f-9a73-1fd69ac8564b','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','FILE','/uploads/work-progress/PO________1779785379505_caf6963a.pdf','PO________1779785379505_caf6963a.pdf','application/pdf',101747,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-26 08:49:39.510'),
('70105358-109c-4ee7-8480-58e783d5fc0e','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','FILE','/uploads/work-progress/_______AMH______1779785494154_286f5901.pdf','_______AMH______1779785494154_286f5901.pdf','application/pdf',334136,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-26 08:51:34.157'),
('788d0e49-bd7a-46e1-82c1-b8d06f12b544','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','FILE','/uploads/work-progress/___________SEO_AMH2_1779785529229_28bc524b.pdf','___________SEO_AMH2_1779785529229_28bc524b.pdf','application/pdf',199139,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-26 08:52:09.231'),
('7c896529-a723-4eb2-b45a-1a7b9e693174','6aa3d567-8a0e-4ed5-824d-871975ccf367','FILE','/uploads/work-progress/QT________1779700476024_e08013b0.pdf','QT________1779700476024_e08013b0.pdf','application/pdf',107257,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-25 09:14:36.027'),
('9db7d893-e7c3-4f32-b807-66406fbd63f2','6aa3d567-8a0e-4ed5-824d-871975ccf367','FILE','/uploads/work-progress/___________________1779855086053_b6ad63d6.pdf','___________________1779855086053_b6ad63d6.pdf','application/pdf',106496,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 04:11:26.057'),
('d2b0c4eb-091a-4430-9db4-b1d07739c219','08d542e9-75f8-426d-9887-f32b9b8059a7','FILE','/uploads/work-progress/_______PNA_1779874287161_c4af4e49.pdf','_______PNA_1779874287161_c4af4e49.pdf','application/pdf',40490,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-27 09:31:27.163'),
('d40ca0f6-b78d-45be-9411-4ee7b1f54da3','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','FILE','/uploads/work-progress/___________SEO_AMH_1779785476218_dec205f4.pdf','___________SEO_AMH_1779785476218_dec205f4.pdf','application/pdf',204203,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-26 08:51:16.231'),
('d8c91177-48c3-48d4-b69f-186f04c3a470','6aa3d567-8a0e-4ed5-824d-871975ccf367','IMAGE','/uploads/work-progress/___________________1779701634020_5e1c4a67.jpg','___________________1779701634020_5e1c4a67.jpg','image/jpeg',25897,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-25 09:33:54.022'),
('da2eb239-4928-4713-bf7f-7977a2c233db','6aa3d567-8a0e-4ed5-824d-871975ccf367','FILE','/uploads/work-progress/PO________1779700554304_08176ade.pdf','PO________1779700554304_08176ade.pdf','application/pdf',101747,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-25 09:15:54.309'),
('eddc6dd6-af3c-43db-81eb-57fb9f57ca9e','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','IMAGE','/uploads/work-progress/QT_AMH_1779785387978_f2a7608f.jpg','QT_AMH_1779785387978_f2a7608f.jpg','image/jpeg',165764,NULL,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-26 08:49:47.980');
/*!40000 ALTER TABLE `workprogressattachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogresscategory`
--

DROP TABLE IF EXISTS `workprogresscategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogresscategory` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isSystem` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workprogresscategory_code_key` (`code`),
  KEY `workprogresscategory_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogresscategory`
--

LOCK TABLES `workprogresscategory` WRITE;
/*!40000 ALTER TABLE `workprogresscategory` DISABLE KEYS */;
INSERT INTO `workprogresscategory` VALUES
('00000000-0000-4000-8001-000000000001','KEYWORD_INTENT','Keyword & Intent',NULL,NULL,'Search',1,1,1,'2026-05-25 09:27:42.207','2026-05-25 09:27:42.207'),
('00000000-0000-4000-8001-000000000002','SETUP_TRACKING','SETUP GSC / Analytics / TAG',NULL,NULL,'Settings',2,1,1,'2026-05-25 09:27:42.207','2026-05-25 09:27:42.207'),
('00000000-0000-4000-8001-000000000003','ON_PAGE_SEO','On-Page SEO',NULL,NULL,'FileText',3,1,1,'2026-05-25 09:27:42.207','2026-05-25 09:27:42.207'),
('00000000-0000-4000-8001-000000000004','TECHNICAL_SEO','Technical SEO',NULL,NULL,'Wrench',4,1,1,'2026-05-25 09:27:42.207','2026-05-25 09:27:42.207'),
('00000000-0000-4000-8001-000000000005','OFF_PAGE_BACKLINKS','Off-Page (Backlinks)',NULL,NULL,'Link',5,1,1,'2026-05-25 09:27:42.207','2026-05-25 09:27:42.207'),
('00000000-0000-4000-8001-000000000006','MONITORING_AUDIT','Monitoring & Audit',NULL,NULL,'Activity',6,1,1,'2026-05-25 09:27:42.207','2026-05-25 09:27:42.207'),
('00000000-0000-4000-8001-000000000007','REPORT','Report',NULL,NULL,'FileBarChart',7,1,1,'2026-05-25 09:27:42.207','2026-05-25 09:27:42.207'),
('dac60f09-fcbe-4591-b2f1-7a2716b11200','DOC','เอกสารและสัญญา','เอกสารและสัญญา  เช่นใบเสนอราคา และเอกสารสัญญา ต่างๆ','#ff85d2',NULL,0,1,0,'2026-05-25 07:44:10.207','2026-05-25 08:10:13.921');
/*!40000 ALTER TABLE `workprogresscategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressitem`
--

DROP TABLE IF EXISTS `workprogressitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressitem` (
  `id` varchar(191) NOT NULL,
  `planId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `statusId` varchar(191) NOT NULL,
  `activity` text NOT NULL,
  `description` text DEFAULT NULL,
  `progressPercent` int(11) NOT NULL DEFAULT 0,
  `duration` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `weight` int(11) NOT NULL DEFAULT 1,
  `startDate` datetime(3) DEFAULT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `assignedToId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workprogressitem_planId_idx` (`planId`),
  KEY `workprogressitem_categoryId_idx` (`categoryId`),
  KEY `workprogressitem_statusId_idx` (`statusId`),
  KEY `workprogressitem_assignedToId_idx` (`assignedToId`),
  CONSTRAINT `workprogressitem_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workprogressitem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `workprogresscategory` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `workprogressitem_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workprogressitem_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `workprogressstatus` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressitem`
--

LOCK TABLES `workprogressitem` WRITE;
/*!40000 ALTER TABLE `workprogressitem` DISABLE KEYS */;
INSERT INTO `workprogressitem` VALUES
('08d542e9-75f8-426d-9887-f32b9b8059a7','62835ed8-01b0-4ffb-b365-a922948ea382','dac60f09-fcbe-4591-b2f1-7a2716b11200','00000000-0000-4000-8002-000000000002','ใบเสนอราคา วางบิล สัญญา','ใบเสนอราคา วางบิล สัญญา',0,'1 week',NULL,0,1,NULL,NULL,NULL,NULL,'2026-05-27 09:27:35.884','2026-05-27 09:27:44.244'),
('09c14c39-3279-4a0e-b3b3-accd7e911eff','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000001','ตั้งค่า GSC / Analytics วิเคราะห์','ตรวจเช้คเว็บให้พร้อมสำหรับจัดทำ SEO',0,'1 week',NULL,3,1,NULL,NULL,NULL,NULL,'2026-05-25 07:40:00.577','2026-05-25 07:54:57.768'),
('1060346e-1e75-4e0b-a6a6-dc15d40a25e8','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000003','เข้าปรับแต่งเว็บไซต์ลูกค้า','เข้าปรับแต่งเว็บไซต์ลูกค้า',0,'1 เดือน',NULL,4,1,NULL,NULL,'2026-05-26 08:07:22.576',NULL,'2026-05-26 07:51:45.613','2026-05-26 08:07:22.577'),
('1a7251f9-dc62-405f-a656-13f60c652279','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000002','ปรับ OFFPAGE จากภายนอก','ปรับ OFFPAGE จากภายนอก\nทราฟฟิก และ แบ็คลิงค์',0,'3 เดือน',NULL,5,1,NULL,NULL,NULL,NULL,'2026-05-26 07:51:45.615','2026-05-26 07:53:38.233'),
('1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','ปรับแต่งเว็บจากภายนอกรอบถัดไป','ปรับแต่งเว็บจากภายนอกรอบถัดไป',0,'6 เดือน',NULL,9,1,NULL,NULL,NULL,NULL,'2026-05-26 07:53:19.614','2026-05-26 07:54:21.793'),
('238a0519-1c40-4124-9343-89e8a188782a','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000001','ตั้งค่า GSC / Analytics วิเคราะห์',NULL,0,NULL,NULL,18,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.229','2026-05-25 09:00:08.229'),
('2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','3dcca793-f000-4a80-adbd-65037a83784f','dac60f09-fcbe-4591-b2f1-7a2716b11200','00000000-0000-4000-8002-000000000003','ใบเสนอราคา วางบิล สัญญา','ใบเสนอราคา วางบิล สัญญา',0,'1 week',NULL,0,1,NULL,NULL,'2026-05-26 07:53:58.977',NULL,'2026-05-26 07:51:45.600','2026-05-26 07:53:58.978'),
('2e0dda47-e130-46c0-8917-a3e4b5d7dbad','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','เพิ่ม Rich Snippets Structured Data',NULL,0,NULL,NULL,7,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.212','2026-05-25 09:00:08.212'),
('300b2eb7-0ab9-4548-908e-038fe9178e6a','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','สร้าง Content Partnership',NULL,0,NULL,NULL,15,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.224','2026-05-25 09:00:08.224'),
('331aa183-adff-4ca8-af44-7b489a378eeb','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000002','00000000-0000-4000-8002-000000000003','ติดตั้ง SEO และ config',NULL,0,'1 week',NULL,2,1,NULL,NULL,'2026-05-27 08:31:25.095',NULL,'2026-05-25 07:40:00.541','2026-05-27 08:31:25.096'),
('4126f67a-d157-4683-93af-c9eac2eb4f15','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000003','วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์',NULL,0,'1 week',NULL,1,1,NULL,NULL,'2026-05-26 04:15:07.303',NULL,'2026-05-25 07:40:00.534','2026-05-26 04:15:07.304'),
('46e10acb-11a4-4f10-bda8-7ea9f470168d','62835ed8-01b0-4ffb-b365-a922948ea382','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000001','ตรวจสอบผล 3 เดือนแรก','ตรวจสอบผล 3 เดือนแรก',0,'1 week',NULL,6,1,NULL,NULL,NULL,NULL,'2026-05-27 09:27:35.910','2026-05-27 09:27:35.910'),
('4d7152f2-4b25-4c1e-9147-2c1ec4e74155','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000001','วิเคราะห์ Conversion',NULL,0,NULL,NULL,21,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.234','2026-05-25 09:00:08.234'),
('4ed761f5-cf74-47d0-bed2-9ecb51520145','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','เริ่มทำ Digital PR หากมี อาจมีค่าใช้จ่ายเพิ่ม',NULL,0,NULL,NULL,14,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.223','2026-05-25 09:00:08.223'),
('4ff9b4b2-8b1f-4ab7-875f-2e42a36bf3ee','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000001','เจาะจง Intent กลุ่มซื้อ',NULL,0,NULL,NULL,3,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.206','2026-05-25 09:00:08.206'),
('50315187-0724-4e93-a878-b6209c64e0a5','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','ปรับโครงสร้างเนื้อหา',NULL,0,'2week',NULL,4,1,NULL,NULL,NULL,NULL,'2026-05-25 07:40:00.549','2026-05-25 07:54:57.768'),
('51ca57b4-b6d1-4b03-83ae-9df2b823cb4b','62835ed8-01b0-4ffb-b365-a922948ea382','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000003','เข้าปรับแต่งเว็บไซต์ลูกค้า','เข้าปรับแต่งเว็บไซต์ลูกค้า',0,'1 เดือน',NULL,4,1,NULL,NULL,'2026-05-27 09:28:42.086',NULL,'2026-05-27 09:27:35.902','2026-05-27 09:28:42.087'),
('596e298b-b03c-4fdc-b374-e3320775950d','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000002','ตรวจสอบผล 3 เดือนแรก','ตรวจสอบผล 3 เดือนแรก',0,'1 week',NULL,6,1,NULL,NULL,NULL,NULL,'2026-05-26 07:58:29.213','2026-05-26 08:00:08.807'),
('59e90d7d-1346-4307-8665-620511f2c354','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','ปรับแต่งเว็บจากภายในเพิ่มเติม','ปรับแต่งเว็บจากภายในเพิ่มเติม',0,'6 เดือน',NULL,9,1,NULL,NULL,NULL,NULL,'2026-05-25 07:55:53.355','2026-05-25 07:55:53.355'),
('615b9ee0-4abe-44e4-8292-2dbe5fbf7574','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000001','ตรวจสอบ Mobile Friendly',NULL,0,NULL,NULL,11,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.218','2026-05-25 09:00:08.218'),
('65ba25fe-eaf6-47df-b40d-b5f8c5e18f94','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000001','แก้ Error (403, 404) หากมีปัญหาเยอะเกินไป',NULL,0,NULL,NULL,9,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.215','2026-05-25 09:00:08.215'),
('6629cf93-bd1c-4018-83bb-9b4b1b862430','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','ปรับแต่งเว็บจากภายนอกรอบถัดไป','ปรับแต่งเว็บจากภายนอกรอบถัดไป',0,'6 เดือน',NULL,9,1,NULL,NULL,NULL,NULL,'2026-05-26 07:59:30.440','2026-05-26 07:59:30.440'),
('6785a560-1536-4639-bfbb-be8344fcbd87','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000003','วิเคราะคีย์ วางแผนคีย์','วิเคราะคีย์ วางแผนคีย์',0,'1 week',NULL,1,1,NULL,NULL,'2026-05-26 07:53:46.085',NULL,'2026-05-26 07:51:45.605','2026-05-26 07:53:46.086'),
('67f03652-b37e-477f-9d66-bae8e9fb8c60','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','ปรับแต่งเว็บจากภายนอกรอบถัดไป','ปรับแต่งเว็บจากภายนอกรอบถัดไป',0,'6 เดือน',NULL,8,1,NULL,NULL,NULL,NULL,'2026-05-25 07:54:52.195','2026-05-25 07:54:57.768'),
('6aa3d567-8a0e-4ed5-824d-871975ccf367','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','dac60f09-fcbe-4591-b2f1-7a2716b11200','00000000-0000-4000-8002-000000000003','เอกสารและสัญญา',NULL,0,'2 เดือน',NULL,0,1,NULL,NULL,'2026-05-27 04:11:54.620',NULL,'2026-05-25 07:45:14.633','2026-05-27 04:11:54.621'),
('6adcbda7-dc88-4641-9c3a-6a123b578c15','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000003','ตรวจสอบเว็บไซต์ลูกค้า','ตรวจสอบเว็บไซต์ลูกค้า ความเร็ว และปัญหา เพื่อให้เหมาะสมกับการทำ SEO',0,'1 week',NULL,3,1,NULL,NULL,'2026-05-26 07:59:52.999',NULL,'2026-05-26 07:58:29.205','2026-05-26 07:59:53.000'),
('6eafbca5-cbe0-4a53-94d2-40a7d3b4eaf4','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','ลงทะเบียน Directory index',NULL,0,NULL,NULL,13,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.221','2026-05-25 09:00:08.221'),
('760f63d1-41a2-431c-a800-8f7d25c36ac5','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000007','00000000-0000-4000-8002-000000000001','เข้าสู่ระบบ seoprime เข้าดูได้ ตลอด 24 ชม',NULL,0,NULL,NULL,22,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.235','2026-05-25 09:00:08.235'),
('7a87cd7f-cf90-4190-b597-a89e475c546f','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','ปรับปรุงบทความเดิม หรือสร้างบทความเพิ่ม',NULL,0,NULL,NULL,8,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.214','2026-05-25 09:00:08.214'),
('83762e4f-b553-4ec7-ac18-340df8f05f26','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000002','00000000-0000-4000-8002-000000000003','ติดตั้ง GSC TAG Website','ติดตั้ง GSC TAG Website',0,'1 week',NULL,2,1,NULL,NULL,'2026-05-26 07:59:50.956',NULL,'2026-05-26 07:58:29.201','2026-05-26 07:59:50.957'),
('83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','62835ed8-01b0-4ffb-b365-a922948ea382','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000002','ปรับ OFFPAGE จากภายนอก','ปรับ OFFPAGE จากภายนอก\nทราฟฟิก และ แบ็คลิงค์',0,'3 เดือน',NULL,5,1,NULL,NULL,NULL,NULL,'2026-05-27 09:27:35.906','2026-05-27 09:30:25.180'),
('83fea883-dcaa-4190-829f-9855b4025c2e','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','ส่งทราฟฟิกคุณภาพ',NULL,0,NULL,NULL,17,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.227','2026-05-25 09:00:08.227'),
('8ad7b003-a17e-4916-b0a8-f86c675dfc0f','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','ปรับโครงสร้างเนื้อหา รอบถัดไป','ปรับโครงสร้างเนื้อหา รอบถัดไป',0,'6 เดือน',NULL,8,1,NULL,NULL,NULL,NULL,'2026-05-26 07:59:11.539','2026-05-26 07:59:11.539'),
('8fa9e27a-6c41-4c9f-8ad1-6d8dff060004','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000003','ตรวจสอบเว็บไซต์ลูกค้า','ตรวจสอบเว็บไซต์ลูกค้า ความเร็ว และปัญหา เพื่อให้เหมาะสมกับการทำ SEO',0,'1 week',NULL,3,1,NULL,NULL,'2026-05-26 07:53:42.050',NULL,'2026-05-26 07:51:45.611','2026-05-26 07:53:42.051'),
('900031ee-e810-464e-9738-0e2cb93d9801','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000007','00000000-0000-4000-8002-000000000003','รายงานลูกค้าทุกเดือน','รายงานลูกค้าทุกเดือน สามารถเข้าสู่ระบบ ดูรายละเอียดได้ทุกเดือน อัพเดทช่วงวันที่ 25-30 ของเดือนนั้นๆ',0,'1 week',NULL,7,1,NULL,NULL,'2026-05-26 08:24:38.334',NULL,'2026-05-26 07:51:45.620','2026-05-26 08:24:38.335'),
('91420496-3589-4123-b9ad-46bfc8f06f91','9f731b50-2cb4-4692-80ed-8e3b311c0999','dac60f09-fcbe-4591-b2f1-7a2716b11200','00000000-0000-4000-8002-000000000003','ใบเสนอราคา วางบิล สัญญา','ใบเสนอราคา วางบิล สัญญา',0,'1 week',NULL,0,1,NULL,NULL,'2026-05-26 07:59:37.066',NULL,'2026-05-26 07:58:29.192','2026-05-26 07:59:37.066'),
('9215b5d7-9569-4946-b2ad-a8c1ce3ba8af','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000007','00000000-0000-4000-8002-000000000003','รายงานลูกค้าทุกเดือน','รายงานลูกค้าทุกเดือน สามารถเข้าสู่ระบบ ดูรายละเอียดได้ทุกเดือน อัพเดทช่วงวันที่ 25-30 ของเดือนนั้นๆ',0,'1 week',NULL,7,1,NULL,NULL,'2026-05-26 08:05:06.752',NULL,'2026-05-26 07:58:29.216','2026-05-26 08:05:06.753'),
('9a2f90d5-ddad-4149-9574-16b73af8da71','62835ed8-01b0-4ffb-b365-a922948ea382','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000003','ตรวจสอบเว็บไซต์ลูกค้า','ตรวจสอบเว็บไซต์ลูกค้า ความเร็ว และปัญหา เพื่อให้เหมาะสมกับการทำ SEO',0,'1 week',NULL,3,1,NULL,NULL,'2026-05-27 09:28:19.383',NULL,'2026-05-27 09:27:35.899','2026-05-27 09:28:19.384'),
('9d9d56f1-7989-4c87-9882-276ae041c24b','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','กระจาย Backlink คุณภาพ',NULL,0,NULL,NULL,16,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.226','2026-05-25 09:00:08.226'),
('9d9da962-a053-4319-87f4-150db07a7920','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000001','ปรับแต่งเว็บจากภายนอก','ปรับแต่งเว็บจากภายนอก',0,'3 เดือน',NULL,5,1,NULL,NULL,NULL,NULL,'2026-05-25 07:40:00.564','2026-05-25 07:54:57.768'),
('a63ec9be-9ceb-436b-80ac-f35edec17ed3','62835ed8-01b0-4ffb-b365-a922948ea382','00000000-0000-4000-8001-000000000002','00000000-0000-4000-8002-000000000003','ติดตั้ง GSC TAG Website','ติดตั้ง GSC TAG Website',0,'1 week',NULL,2,1,NULL,NULL,'2026-05-27 09:28:16.014',NULL,'2026-05-27 09:27:35.895','2026-05-27 09:28:16.015'),
('b25057c7-d0cb-46fc-912c-207c9e87b7cf','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','ปรับโครงสร้างเนื้อหา',NULL,0,NULL,NULL,5,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.209','2026-05-25 09:00:08.209'),
('b5c7033d-d3fc-40b2-a64d-91ed986dddb5','62835ed8-01b0-4ffb-b365-a922948ea382','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000003','วิเคราะคีย์ วางแผนคีย์','วิเคราะคีย์ วางแผนคีย์',0,'1 week',NULL,1,1,NULL,NULL,'2026-05-27 09:27:52.076',NULL,'2026-05-27 09:27:35.891','2026-05-27 09:27:52.077'),
('b5d8aebf-1a88-424d-93d8-856277e42f78','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000001','Crawl Website',NULL,0,NULL,NULL,20,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.232','2026-05-25 09:00:08.232'),
('b699f02a-8221-4294-a0cc-ed5184dc0985','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000003','วิเคราะคีย์ วางแผนคีย์','วิเคราะคีย์ วางแผนคีย์',0,'1 week',NULL,1,1,NULL,NULL,'2026-05-26 07:59:45.311',NULL,'2026-05-26 07:58:29.197','2026-05-26 07:59:45.312'),
('b73b6426-d43c-4a3d-a6fc-9b32b098656a','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000001','ปรับความเร็ว (Speed)',NULL,0,NULL,NULL,10,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.217','2026-05-25 09:00:08.217'),
('c003a90a-0121-4a22-8908-b7b5ea860a11','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000001','ตรวจสอบผลดำเนินการ','ตรวจสอบผลดำเนินการ  ปรับแก้หากผลลัพธ์ไม่ดี',0,'1 week',NULL,6,1,NULL,NULL,NULL,NULL,'2026-05-25 07:53:18.369','2026-05-25 07:54:57.768'),
('cb1a6f81-ef2c-4cc2-a765-bd53ce239cf9','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000001','ขยายสู่คีย์เวิร์ดเฉพาะกลุ่ม',NULL,0,NULL,NULL,2,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.204','2026-05-25 09:00:08.204'),
('df5fabf4-86af-4420-b8c8-f344b04f96dd','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','ทำคอนเทนต์ E-E-A-T',NULL,0,NULL,NULL,6,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.211','2026-05-25 09:00:08.211'),
('e21f8606-0286-4b88-9afb-eff33d712db7','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000001','ตรวจสอบอันดับ (Rank)',NULL,0,NULL,NULL,19,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.231','2026-05-25 09:00:08.231'),
('e2fc3f0b-5fcf-4d6f-ac93-37b7ad48777c','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000001','อัปเดตตามเทรนด์',NULL,0,NULL,NULL,4,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.207','2026-05-25 09:00:08.207'),
('e6bd1217-440d-4783-ba06-41a7a24e1787','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','00000000-0000-4000-8001-000000000007','00000000-0000-4000-8002-000000000001','เข้าสู่ระบบ seoprime เข้าดูได้ ตลอด 24 ชม',NULL,0,'1 week',NULL,7,1,NULL,NULL,NULL,NULL,'2026-05-25 07:40:00.585','2026-05-25 07:54:57.768'),
('e8ffb40d-d2ac-4d1f-a15d-d4e131337d86','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000002','เข้าปรับแต่งเว็บไซต์ลูกค้า','เข้าปรับแต่งเว็บไซต์ลูกค้า',0,'1 เดือน',NULL,4,1,NULL,NULL,NULL,NULL,'2026-05-26 07:58:29.207','2026-05-26 07:59:55.892'),
('ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000002','00000000-0000-4000-8002-000000000003','ติดตั้ง GSC TAG Website','ติดตั้ง GSC TAG Website',0,'1 week',NULL,2,1,NULL,NULL,'2026-05-26 07:53:44.244',NULL,'2026-05-26 07:51:45.608','2026-05-26 07:53:44.245'),
('f2676ee0-c2f5-45a0-bb0b-f73277430312','62835ed8-01b0-4ffb-b365-a922948ea382','00000000-0000-4000-8001-000000000007','00000000-0000-4000-8002-000000000001','รายงานลูกค้าทุกเดือน','รายงานลูกค้าทุกเดือน สามารถเข้าสู่ระบบ ดูรายละเอียดได้ทุกเดือน อัพเดทช่วงวันที่ 25-30 ของเดือนนั้นๆ',0,'1 week',NULL,7,1,NULL,NULL,NULL,NULL,'2026-05-27 09:27:35.914','2026-05-27 09:27:35.914'),
('f4a487d3-da47-4b9f-b716-cbbe36e8857f','9f731b50-2cb4-4692-80ed-8e3b311c0999','00000000-0000-4000-8001-000000000005','00000000-0000-4000-8002-000000000002','ปรับ OFFPAGE จากภายนอก','ปรับ OFFPAGE จากภายนอก\nทราฟฟิก และ แบ็คลิงค์',0,'3 เดือน',NULL,5,1,NULL,NULL,NULL,NULL,'2026-05-26 07:58:29.210','2026-05-26 08:00:00.030'),
('f78b3a2e-b22b-4eb3-a094-a9fc56e0bb8a','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000006','00000000-0000-4000-8002-000000000001','ตรวจสอบผล 3 เดือนแรก','ตรวจสอบผล 3 เดือนแรก',0,'1 week',NULL,6,1,NULL,NULL,NULL,NULL,'2026-05-26 07:51:45.618','2026-05-26 07:51:45.618'),
('f9709235-33c1-451d-9022-a5433d0d8db5','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000001','00000000-0000-4000-8002-000000000001','วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์',NULL,0,NULL,NULL,0,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.200','2026-05-25 09:00:08.200'),
('f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','3dcca793-f000-4a80-adbd-65037a83784f','00000000-0000-4000-8001-000000000003','00000000-0000-4000-8002-000000000001','ปรับโครงสร้างเนื้อหารอบถัดไป','ปรับโครงสร้างเนื้อหารอบถัดไป',0,'6 เดือน',NULL,8,1,NULL,NULL,NULL,NULL,'2026-05-26 07:52:57.729','2026-05-26 07:52:57.729'),
('fedb1a5f-efaa-457f-8a88-406a4c05e9f3','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000002','00000000-0000-4000-8002-000000000001','ติดตั้ง SEO และ config',NULL,0,NULL,NULL,1,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.202','2026-05-25 09:00:08.202'),
('ffbd5d39-5d6c-4c10-93bd-e94acaff41fc','05226ec5-75c7-425b-9084-c0130c794f19','00000000-0000-4000-8001-000000000004','00000000-0000-4000-8002-000000000001','ตรวจสอบความปลอดภัย',NULL,0,NULL,NULL,12,1,NULL,NULL,NULL,NULL,'2026-05-25 09:00:08.220','2026-05-25 09:00:08.220');
/*!40000 ALTER TABLE `workprogressitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressitemperiodmark`
--

DROP TABLE IF EXISTS `workprogressitemperiodmark`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressitemperiodmark` (
  `id` varchar(191) NOT NULL,
  `itemId` varchar(191) NOT NULL,
  `periodId` varchar(191) NOT NULL,
  `markTypeId` varchar(191) NOT NULL,
  `progressPercent` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workprogressitemperiodmark_itemId_periodId_key` (`itemId`,`periodId`),
  KEY `workprogressitemperiodmark_itemId_idx` (`itemId`),
  KEY `workprogressitemperiodmark_periodId_idx` (`periodId`),
  KEY `workprogressitemperiodmark_markTypeId_fkey` (`markTypeId`),
  CONSTRAINT `workprogressitemperiodmark_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workprogressitemperiodmark_markTypeId_fkey` FOREIGN KEY (`markTypeId`) REFERENCES `workprogressmarktype` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `workprogressitemperiodmark_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `workprogressperiod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressitemperiodmark`
--

LOCK TABLES `workprogressitemperiodmark` WRITE;
/*!40000 ALTER TABLE `workprogressitemperiodmark` DISABLE KEYS */;
INSERT INTO `workprogressitemperiodmark` VALUES
('06c86d89-16e5-42ad-a45e-fc63fcf81d3d','83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','7c74cb42-6130-4fa8-9bde-fdbc5256b41f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:35.204'),
('0a0d97f9-91ee-4a03-b6d4-05e2dbdc1763','9215b5d7-9569-4946-b2ad-a8c1ce3ba8af','d00668f8-ce62-4238-ad9a-975675431268','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:04:08.117'),
('0b2ecefd-b95a-40df-91f2-02702a559dcf','9d9da962-a053-4319-87f4-150db07a7920','d3632b4f-5bcb-4cfa-a6d9-b35643b58505','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:51:45.232'),
('10c81a80-82f6-424c-9b36-3fb6d3c02b45','e8ffb40d-d2ac-4d1f-a15d-d4e131337d86','6d206511-353f-40f2-b7dc-3f0b48149a0b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:20:41.210'),
('167f5b82-877a-46eb-bf20-7ca1bcd617de','67f03652-b37e-477f-9d66-bae8e9fb8c60','e1da01aa-6923-4299-ad36-1810289ce77b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:14.687'),
('17e0cf28-3a55-44bd-82be-3b13012e7ee1','8ad7b003-a17e-4916-b0a8-f86c675dfc0f','b6d11e89-ba3c-4a74-b548-08c933f4afc7','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:40.255'),
('18232fd8-df34-43d5-bd3a-39f034373f66','c003a90a-0121-4a22-8908-b7b5ea860a11','53dd5567-f3cd-4757-822f-a059c6284edf','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:53:36.871'),
('1d2b17f7-c3d8-4053-89bf-4ad1953dfd2d','67f03652-b37e-477f-9d66-bae8e9fb8c60','64d32d81-6a93-4964-8c00-9776dea9f009','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:13.539'),
('21ae677b-2802-48dc-86cb-1a0ef93ea3dd','6629cf93-bd1c-4018-83bb-9b4b1b862430','b6d11e89-ba3c-4a74-b548-08c933f4afc7','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:49.979'),
('28158aeb-ad0f-4e15-8b37-e35566952096','f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','07caf070-cce3-458b-a467-a6ea8530e7d0','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:43.268'),
('28d463c6-9038-4f61-a686-d7ea48020b10','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','a4bcbc88-0807-4ad1-b69e-a0601e6c68a6','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:57.572'),
('2e62a368-5687-4a8c-a90d-cc3f2757f562','8ad7b003-a17e-4916-b0a8-f86c675dfc0f','4bd799e5-1217-4e67-9194-dece439a139f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:38.517'),
('2e6a12f9-92d6-4e63-821d-b4495e421a16','6adcbda7-dc88-4641-9c3a-6a123b578c15','6d206511-353f-40f2-b7dc-3f0b48149a0b','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 08:00:58.974'),
('2f477830-5662-4fe3-bf19-29a9127522bf','8ad7b003-a17e-4916-b0a8-f86c675dfc0f','10927824-c6bb-41eb-b71f-749acf3b2f87','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:36.607'),
('2f71e96d-8a3a-4038-b4d7-1ce53c135e35','59e90d7d-1346-4307-8665-620511f2c354','64d32d81-6a93-4964-8c00-9776dea9f009','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:19.848'),
('33a3ac05-8877-484f-8164-8dbe531dc49a','9215b5d7-9569-4946-b2ad-a8c1ce3ba8af','6d206511-353f-40f2-b7dc-3f0b48149a0b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:04:06.957'),
('34a97c2b-f5f6-4ceb-9744-760e37b7a327','50315187-0724-4e93-a878-b6209c64e0a5','d3632b4f-5bcb-4cfa-a6d9-b35643b58505','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:51:40.783'),
('36366390-1091-4230-99e6-dc3ea2aa879f','900031ee-e810-464e-9738-0e2cb93d9801','6f9ab246-b791-410b-adce-687c5079b7bd','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 08:24:28.750'),
('366581ab-94c2-41f2-bbef-3e1e331a5302','f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','ad1e0b8a-3209-4cfc-8267-9ac79bc84515','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:44.780'),
('38a96e27-faf4-4b3c-9909-426068654dcc','9d9da962-a053-4319-87f4-150db07a7920','c1145ae5-f413-4f10-8ee9-717140af3501','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:51:46.678'),
('3fab7f7f-d628-4956-9358-b6d4c88beed1','f4a487d3-da47-4b9f-b716-cbbe36e8857f','6d206511-353f-40f2-b7dc-3f0b48149a0b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:21:14.447'),
('42a88391-4fc0-4d06-8c19-79adc4084340','e6bd1217-440d-4783-ba06-41a7a24e1787','53dd5567-f3cd-4757-822f-a059c6284edf','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:54:09.027'),
('4a6d5a78-bd24-4856-bcba-082fbbe14a84','8fa9e27a-6c41-4c9f-8ad1-6d8dff060004','cbfdae26-2407-47f0-aa69-01afea730662','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 07:56:26.770'),
('4e6e5159-bfd1-4eb5-aa9a-7b2925f92a6f','67f03652-b37e-477f-9d66-bae8e9fb8c60','53dd5567-f3cd-4757-822f-a059c6284edf','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:10.548'),
('4e7dc5f8-12f5-47ee-bc96-4b7b668e3a36','67f03652-b37e-477f-9d66-bae8e9fb8c60','594cdf1f-1933-4b09-9e3b-ed805a72d140','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:11.856'),
('510f9900-5a15-4d7c-898c-94b6ffee3b84','f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','a4bcbc88-0807-4ad1-b69e-a0601e6c68a6','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:46.221'),
('543907e3-6ed1-486e-ba6a-cc21cc80f9cd','6aa3d567-8a0e-4ed5-824d-871975ccf367','16bd6215-98a8-4295-ad1b-76d3f1b28369','00000000-0000-4000-8003-000000000001',85,NULL,'2026-05-25 09:16:40.924'),
('543c2cc2-aab9-4348-9300-8380d02cabb3','1a7251f9-dc62-405f-a656-13f60c652279','6f9ab246-b791-410b-adce-687c5079b7bd','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 07:55:41.195'),
('56399859-45ed-40d7-a95b-1d3abf27a28d','1060346e-1e75-4e0b-a6a6-dc15d40a25e8','6f9ab246-b791-410b-adce-687c5079b7bd','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 07:55:32.974'),
('5a213f5e-af08-4cbf-b931-332b188c2dbd','91420496-3589-4123-b9ad-46bfc8f06f91','6d206511-353f-40f2-b7dc-3f0b48149a0b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:00:28.210'),
('5cca450c-d1f5-477d-b016-647968fdd693','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','07caf070-cce3-458b-a467-a6ea8530e7d0','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:54.850'),
('5db73880-5a93-4301-b056-26e533e3897a','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','4f458884-0365-47fa-8bef-3fc737818eb9','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:49.684'),
('616e547a-aea6-4183-8d81-95fe9985adf5','e8ffb40d-d2ac-4d1f-a15d-d4e131337d86','cc878f77-ac38-455d-8683-38275bf46111','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 08:01:57.330'),
('6171bdce-9f7a-4bcf-aa0d-d873f3f93016','331aa183-adff-4ca8-af44-7b489a378eeb','1753f9eb-ea9d-4a51-abcc-8e3be26285b2','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:48:14.254'),
('6a8c452d-be4f-44ff-a8fa-819bc677159a','59e90d7d-1346-4307-8665-620511f2c354','e1da01aa-6923-4299-ad36-1810289ce77b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:21.296'),
('6ac6cb16-1082-4d51-9fad-bdfa37989e4b','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','cbfdae26-2407-47f0-aa69-01afea730662','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:08:00.467'),
('6dbb65ad-62ee-41a8-a9b3-cb3a56c63c2a','51ca57b4-b6d1-4b03-83ae-9df2b823cb4b','bed3fc28-d68a-491a-99c1-07ccae84e93f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:30.762'),
('6fa3c854-d3d9-4863-b0ef-5f011eb62800','8ad7b003-a17e-4916-b0a8-f86c675dfc0f','cd635770-4df3-4d9a-8ade-2cb1d7a7aac4','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:33.635'),
('72735a57-5ba1-46de-9df7-92fec4a0e96a','f4a487d3-da47-4b9f-b716-cbbe36e8857f','d00668f8-ce62-4238-ad9a-975675431268','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:02:23.639'),
('72ae0397-df79-41b6-ae83-77dd0e0b3759','8ad7b003-a17e-4916-b0a8-f86c675dfc0f','a9dab332-64d0-4273-9f53-6d3266976416','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:31.574'),
('73d841b5-d5a6-4e68-9d10-802f1cfe7933','900031ee-e810-464e-9738-0e2cb93d9801','cbfdae26-2407-47f0-aa69-01afea730662','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 08:26:50.142'),
('75515361-cef3-4a5f-8e32-da2ea8b9e6d4','f2676ee0-c2f5-45a0-bb0b-f73277430312','bed3fc28-d68a-491a-99c1-07ccae84e93f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:59.387'),
('75897620-e8ea-486a-9976-7111afb0333e','a63ec9be-9ceb-436b-80ac-f35edec17ed3','bed3fc28-d68a-491a-99c1-07ccae84e93f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:26.813'),
('7b84f4ad-42e5-4a6a-93e4-28bd428a528b','8ad7b003-a17e-4916-b0a8-f86c675dfc0f','6daa4a06-bc83-4127-9867-c458929ea93a','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:35.203'),
('7ceda713-197b-4c03-a9ce-2b5a32a62c2e','09c14c39-3279-4a0e-b3b3-accd7e911eff','1753f9eb-ea9d-4a51-abcc-8e3be26285b2','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:49:49.125'),
('7ee8a5d9-e50a-446e-a782-1079f0a00593','59e90d7d-1346-4307-8665-620511f2c354','594cdf1f-1933-4b09-9e3b-ed805a72d140','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:18.802'),
('830c3d08-5df2-401c-a7ad-b8e0d9b9b886','46e10acb-11a4-4f10-bda8-7ea9f470168d','592e05a2-8b1d-4727-8634-cc8285b11d2b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:50.102'),
('875a141e-ae3a-41ca-b2e6-084419bb9f20','6629cf93-bd1c-4018-83bb-9b4b1b862430','6daa4a06-bc83-4127-9867-c458929ea93a','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:44.737'),
('8b620768-c73e-4795-944d-75ea28010932','1a7251f9-dc62-405f-a656-13f60c652279','cbfdae26-2407-47f0-aa69-01afea730662','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 07:54:53.645'),
('8ddd3794-0b53-412e-b871-eb48c8466f5e','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','c9e357f8-681c-4d84-a810-f299b76b520c','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:53.261'),
('8e55610b-29a8-4597-9d6f-ba7f195258df','67f03652-b37e-477f-9d66-bae8e9fb8c60','edd567e0-269c-44f7-a254-db80962b98f7','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:16.009'),
('928d6845-3f27-4d02-9f6b-4027b123494c','59e90d7d-1346-4307-8665-620511f2c354','53dd5567-f3cd-4757-822f-a059c6284edf','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:17.570'),
('96be8902-68f3-4677-8ad3-69fe15ba743c','6629cf93-bd1c-4018-83bb-9b4b1b862430','cd635770-4df3-4d9a-8ade-2cb1d7a7aac4','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:43.422'),
('9802923c-8669-4d8f-aea1-f5d457f11171','6785a560-1536-4639-bfbb-be8344fcbd87','cbfdae26-2407-47f0-aa69-01afea730662','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 07:56:15.987'),
('9900eef8-bc41-47fe-b8e6-c54db4ae2c5b','f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','4f458884-0365-47fa-8bef-3fc737818eb9','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:42.235'),
('9cbc9ee6-04c6-4447-9648-84b18fabe732','6629cf93-bd1c-4018-83bb-9b4b1b862430','a9dab332-64d0-4273-9f53-6d3266976416','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:41.807'),
('a0913279-3ae2-44a3-8a6c-2afcb77f34f7','1a7251f9-dc62-405f-a656-13f60c652279','29fcdc51-a5cb-4cda-bdbf-84fda9f55012','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:23:50.387'),
('a21a190c-5394-4b4a-a722-cc9f05392164','6629cf93-bd1c-4018-83bb-9b4b1b862430','4bd799e5-1217-4e67-9194-dece439a139f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:48.235'),
('a46449ee-5658-4e3f-bd71-ba4c458bb0d5','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','ad1e0b8a-3209-4cfc-8267-9ac79bc84515','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:56.215'),
('a5729e80-6be4-460c-813b-b82b5b11c453','b699f02a-8221-4294-a0cc-ed5184dc0985','6d206511-353f-40f2-b7dc-3f0b48149a0b','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 08:00:31.652'),
('a9a86265-585e-423a-a42b-faf800302a23','83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','bed3fc28-d68a-491a-99c1-07ccae84e93f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:33.752'),
('abef69d5-3517-4dfe-96a6-7b96c2a4efe6','f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','fea44a99-f59d-41bb-a810-791d3c71101e','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:47.685'),
('ae708ed9-c84d-4f19-ac61-22715869ef7e','9d9da962-a053-4319-87f4-150db07a7920','53dd5567-f3cd-4757-822f-a059c6284edf','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:51:47.992'),
('b4565f71-0f9b-4a61-89f7-645ac0436691','f2676ee0-c2f5-45a0-bb0b-f73277430312','592e05a2-8b1d-4727-8634-cc8285b11d2b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:01:02.130'),
('be7af798-0aaf-4984-b74d-ababccc915b0','b5c7033d-d3fc-40b2-a64d-91ed986dddb5','bed3fc28-d68a-491a-99c1-07ccae84e93f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:24.455'),
('c0298199-9465-476d-a8e4-eae874788cff','83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','592e05a2-8b1d-4727-8634-cc8285b11d2b','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:36.846'),
('c8b3a032-5a6a-4fbe-8fad-b9ac066cc807','ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8','cbfdae26-2407-47f0-aa69-01afea730662','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 07:56:23.153'),
('ccc024bf-968e-4d02-a8af-512eff2cbd7d','1d3c358d-ec3d-4e91-8c3a-7fac6bdc9ab7','fea44a99-f59d-41bb-a810-791d3c71101e','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:59.228'),
('d0f08d33-cd1b-44f0-84ec-92408f7a807f','9a2f90d5-ddad-4149-9574-16b73af8da71','bed3fc28-d68a-491a-99c1-07ccae84e93f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:28.410'),
('d0f0e7fc-176c-4cdd-85e3-6705cc086ec4','08d542e9-75f8-426d-9887-f32b9b8059a7','bed3fc28-d68a-491a-99c1-07ccae84e93f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:00:11.986'),
('dbc553cb-388e-4fb8-b377-7302072e31e6','f2676ee0-c2f5-45a0-bb0b-f73277430312','7c74cb42-6130-4fa8-9bde-fdbc5256b41f','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-27 10:01:00.795'),
('e074df36-8588-4d93-bf62-13d21fa85bc1','f4a487d3-da47-4b9f-b716-cbbe36e8857f','cc878f77-ac38-455d-8683-38275bf46111','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 08:02:21.316'),
('e323d945-81ab-41da-88b7-42adbefc5c0d','596e298b-b03c-4fdc-b374-e3320775950d','d00668f8-ce62-4238-ad9a-975675431268','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:16.421'),
('e6425fb1-ff23-4a17-98e6-6a7fcbc5ec58','1060346e-1e75-4e0b-a6a6-dc15d40a25e8','cbfdae26-2407-47f0-aa69-01afea730662','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 07:54:50.015'),
('e6b70c99-bb2a-4dd4-91b7-315c785c65b3','4126f67a-d157-4683-93af-c9eac2eb4f15','9cfa1e89-2207-47ee-9a03-f970e134f745','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:46:59.669'),
('eb31438c-528f-4e90-a576-774bae7fa2a9','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','6f9ab246-b791-410b-adce-687c5079b7bd','00000000-0000-4000-8003-000000000001',100,'ชำระค่าบริการงวดที่ 2 เรียบร้อยแล้ว','2026-05-26 09:17:54.129'),
('eddca19e-b15e-47ba-b93f-f7867eeb4e4c','59e90d7d-1346-4307-8665-620511f2c354','edd567e0-269c-44f7-a254-db80962b98f7','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-25 07:56:22.510'),
('f0759458-e49d-47c7-b9ae-af76d7f47ac6','83762e4f-b553-4ec7-ac18-340df8f05f26','6d206511-353f-40f2-b7dc-3f0b48149a0b','00000000-0000-4000-8003-000000000001',100,NULL,'2026-05-26 08:00:35.339'),
('f3c87c62-f2e2-48e1-85f9-d759b4672811','6629cf93-bd1c-4018-83bb-9b4b1b862430','10927824-c6bb-41eb-b71f-749acf3b2f87','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:22:46.387'),
('f53941c7-1150-4b97-a623-c2cf23d6bca4','e8ffb40d-d2ac-4d1f-a15d-d4e131337d86','d00668f8-ce62-4238-ad9a-975675431268','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:02:08.625'),
('f9ccafbc-7df3-434d-a944-bbd0ddc3ac41','6aa3d567-8a0e-4ed5-824d-871975ccf367','1753f9eb-ea9d-4a51-abcc-8e3be26285b2','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 03:59:04.495'),
('fc240590-4ae6-4813-999a-c8ffffb9e240','f97948ec-db54-4f9f-9d3f-9c4d6e899e2f','c9e357f8-681c-4d84-a810-f299b76b520c','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:27:42.236'),
('fc4ef7d3-2828-47f5-a41b-673971b14911','9215b5d7-9569-4946-b2ad-a8c1ce3ba8af','cc878f77-ac38-455d-8683-38275bf46111','00000000-0000-4000-8003-000000000001',NULL,NULL,'2026-05-26 08:04:06.958'),
('fc7decea-f2a2-494a-a8fe-9c43775e0a82','f9709235-33c1-451d-9022-a5433d0d8db5','e09af3b9-98db-4f51-86c0-275b1644b509','00000000-0000-4000-8003-000000000001',NULL,'555555555555555','2026-05-25 09:00:16.377');
/*!40000 ALTER TABLE `workprogressitemperiodmark` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressmarktype`
--

DROP TABLE IF EXISTS `workprogressmarktype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressmarktype` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `color` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isSystem` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workprogressmarktype_code_key` (`code`),
  KEY `workprogressmarktype_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressmarktype`
--

LOCK TABLES `workprogressmarktype` WRITE;
/*!40000 ALTER TABLE `workprogressmarktype` DISABLE KEYS */;
INSERT INTO `workprogressmarktype` VALUES
('00000000-0000-4000-8003-000000000001','PLANNED','วางแผน',NULL,NULL,1,1,1,'2026-05-25 09:28:03.979','2026-05-25 09:28:03.979'),
('00000000-0000-4000-8003-000000000002','IN_PROGRESS','กำลังทำ','#9592ff',NULL,2,1,1,'2026-05-25 09:28:03.979','2026-05-25 09:28:03.979'),
('00000000-0000-4000-8003-000000000003','COMPLETED','เสร็จแล้ว','#31fb4c',NULL,3,1,1,'2026-05-25 09:28:03.979','2026-05-25 09:28:03.979'),
('00000000-0000-4000-8003-000000000004','MISSED','พลาด',NULL,NULL,4,1,1,'2026-05-25 09:28:03.979','2026-05-25 09:28:03.979');
/*!40000 ALTER TABLE `workprogressmarktype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressperiod`
--

DROP TABLE IF EXISTS `workprogressperiod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressperiod` (
  `id` varchar(191) NOT NULL,
  `planId` varchar(191) NOT NULL,
  `seq` int(11) NOT NULL,
  `label` varchar(191) NOT NULL,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workprogressperiod_planId_seq_key` (`planId`,`seq`),
  KEY `workprogressperiod_planId_idx` (`planId`),
  CONSTRAINT `workprogressperiod_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `workprogressplan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressperiod`
--

LOCK TABLES `workprogressperiod` WRITE;
/*!40000 ALTER TABLE `workprogressperiod` DISABLE KEYS */;
INSERT INTO `workprogressperiod` VALUES
('07caf070-cce3-458b-a467-a6ea8530e7d0','3dcca793-f000-4a80-adbd-65037a83784f',6,'ก.ย. 2026','2026-08-31 17:00:00.000','2026-09-29 17:00:00.000'),
('08d00f81-e742-4550-bab7-c719df8574be','3dcca793-f000-4a80-adbd-65037a83784f',13,'เม.ย. 2027','2027-03-31 17:00:00.000','2027-04-29 17:00:00.000'),
('0dcea2f0-fe27-4372-b76b-1b97e25802be','9f731b50-2cb4-4692-80ed-8e3b311c0999',15,'เม.ย. 2027','2027-03-31 17:00:00.000','2027-04-29 17:00:00.000'),
('0f304b2c-4daa-4615-a539-817369fc544b','05226ec5-75c7-425b-9084-c0130c794f19',8,'ส.ค.','2026-07-31 17:00:00.000','2026-08-30 17:00:00.000'),
('10927824-c6bb-41eb-b71f-749acf3b2f87','9f731b50-2cb4-4692-80ed-8e3b311c0999',8,'ก.ย. 2026','2026-08-31 17:00:00.000','2026-09-29 17:00:00.000'),
('16b65206-57a1-401b-8b87-ec3318d993e2','3dcca793-f000-4a80-adbd-65037a83784f',14,'พ.ค. 2027','2027-04-30 17:00:00.000','2027-05-30 17:00:00.000'),
('16bd6215-98a8-4295-ad1b-76d3f1b28369','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',4,'เม.ย.','2026-03-31 17:00:00.000','2026-04-29 17:00:00.000'),
('1753f9eb-ea9d-4a51-abcc-8e3be26285b2','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',5,'พ.ค.','2026-04-30 17:00:00.000','2026-05-30 17:00:00.000'),
('29fcdc51-a5cb-4cda-bdbf-84fda9f55012','3dcca793-f000-4a80-adbd-65037a83784f',3,'มิ.ย. 2026','2026-05-31 17:00:00.000','2026-06-29 17:00:00.000'),
('30242d4a-057b-49ac-9149-2efca6faa293','3dcca793-f000-4a80-adbd-65037a83784f',10,'ม.ค. 2027','2026-12-31 17:00:00.000','2027-01-30 17:00:00.000'),
('34d8968e-faee-4f1b-94ad-c9d4f711c2d7','9f731b50-2cb4-4692-80ed-8e3b311c0999',16,'พ.ค. 2027','2027-04-30 17:00:00.000','2027-05-30 17:00:00.000'),
('359103ca-ee73-4234-a16f-d31694a40864','05226ec5-75c7-425b-9084-c0130c794f19',7,'ก.ค.','2026-06-30 17:00:00.000','2026-07-30 17:00:00.000'),
('386917a0-7ed9-4982-a611-cb445a6d810f','05226ec5-75c7-425b-9084-c0130c794f19',2,'ก.พ.','2026-01-31 17:00:00.000','2026-02-27 17:00:00.000'),
('3b2cc2ef-8d8d-4600-81ab-4eb41044abbb','62835ed8-01b0-4ffb-b365-a922948ea382',9,'ม.ค. 2027','2026-12-31 17:00:00.000','2027-01-30 17:00:00.000'),
('3b83ec29-88c4-4b9e-a7d3-459bd6e8b4d1','62835ed8-01b0-4ffb-b365-a922948ea382',6,'ต.ค. 2026','2026-09-30 17:00:00.000','2026-10-30 17:00:00.000'),
('4413a398-a3a2-42dd-b490-5fa256fb3a3a','05226ec5-75c7-425b-9084-c0130c794f19',12,'ธ.ค.','2026-11-30 17:00:00.000','2026-12-30 17:00:00.000'),
('4554e7d6-43b8-40bd-94ba-3df787ab67b1','9f731b50-2cb4-4692-80ed-8e3b311c0999',12,'ม.ค. 2027','2026-12-31 17:00:00.000','2027-01-30 17:00:00.000'),
('4bd799e5-1217-4e67-9194-dece439a139f','9f731b50-2cb4-4692-80ed-8e3b311c0999',9,'ต.ค. 2026','2026-09-30 17:00:00.000','2026-10-30 17:00:00.000'),
('4f458884-0365-47fa-8bef-3fc737818eb9','3dcca793-f000-4a80-adbd-65037a83784f',4,'ก.ค. 2026','2026-06-30 17:00:00.000','2026-07-30 17:00:00.000'),
('53dd5567-f3cd-4757-822f-a059c6284edf','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',8,'ส.ค.','2026-07-31 17:00:00.000','2026-08-30 17:00:00.000'),
('592e05a2-8b1d-4727-8634-cc8285b11d2b','62835ed8-01b0-4ffb-b365-a922948ea382',3,'ก.ค. 2026','2026-06-30 17:00:00.000','2026-07-30 17:00:00.000'),
('594cdf1f-1933-4b09-9e3b-ed805a72d140','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',9,'ก.ย.','2026-08-31 17:00:00.000','2026-09-29 17:00:00.000'),
('5a51fb94-63b5-4222-8bfb-1622194419c2','05226ec5-75c7-425b-9084-c0130c794f19',6,'มิ.ย.','2026-05-31 17:00:00.000','2026-06-29 17:00:00.000'),
('5eaa6540-ea33-4a3a-a019-fd52e1f6b3ec','05226ec5-75c7-425b-9084-c0130c794f19',4,'เม.ย.','2026-03-31 17:00:00.000','2026-04-29 17:00:00.000'),
('64d32d81-6a93-4964-8c00-9776dea9f009','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',10,'ต.ค.','2026-09-30 17:00:00.000','2026-10-30 17:00:00.000'),
('6cb2235e-8135-4a46-ab25-30380bad3b0a','62835ed8-01b0-4ffb-b365-a922948ea382',11,'มี.ค. 2027','2027-02-28 17:00:00.000','2027-03-30 17:00:00.000'),
('6d206511-353f-40f2-b7dc-3f0b48149a0b','9f731b50-2cb4-4692-80ed-8e3b311c0999',2,'มี.ค. 2026','2026-02-28 17:00:00.000','2026-03-30 17:00:00.000'),
('6daa4a06-bc83-4127-9867-c458929ea93a','9f731b50-2cb4-4692-80ed-8e3b311c0999',7,'ส.ค. 2026','2026-07-31 17:00:00.000','2026-08-30 17:00:00.000'),
('6f9ab246-b791-410b-adce-687c5079b7bd','3dcca793-f000-4a80-adbd-65037a83784f',2,'พ.ค. 2026','2026-04-30 17:00:00.000','2026-05-30 17:00:00.000'),
('79e2b074-4d6b-4e90-9750-8fe17675c092','05226ec5-75c7-425b-9084-c0130c794f19',9,'ก.ย.','2026-08-31 17:00:00.000','2026-09-29 17:00:00.000'),
('7c68dfca-99ce-46a2-b189-459364a01123','9f731b50-2cb4-4692-80ed-8e3b311c0999',11,'ธ.ค. 2026','2026-11-30 17:00:00.000','2026-12-30 17:00:00.000'),
('7c74cb42-6130-4fa8-9bde-fdbc5256b41f','62835ed8-01b0-4ffb-b365-a922948ea382',2,'มิ.ย. 2026','2026-05-31 17:00:00.000','2026-06-29 17:00:00.000'),
('7fbe2146-787a-4d83-ac21-03ef3ca29df0','05226ec5-75c7-425b-9084-c0130c794f19',3,'มี.ค.','2026-02-28 17:00:00.000','2026-03-30 17:00:00.000'),
('8206fa48-fe49-4544-996c-9f65cde759d1','05226ec5-75c7-425b-9084-c0130c794f19',5,'พ.ค.','2026-04-30 17:00:00.000','2026-05-30 17:00:00.000'),
('95f8f414-62e8-453d-8f08-cecbb699f3a8','62835ed8-01b0-4ffb-b365-a922948ea382',7,'พ.ย. 2026','2026-10-31 17:00:00.000','2026-11-29 17:00:00.000'),
('99c31b11-410c-4077-bf7a-cf9bff53610b','9f731b50-2cb4-4692-80ed-8e3b311c0999',14,'มี.ค. 2027','2027-02-28 17:00:00.000','2027-03-30 17:00:00.000'),
('9cf6df23-0aa2-4ce0-8c72-84c23513b959','9f731b50-2cb4-4692-80ed-8e3b311c0999',1,'ก.พ. 2026','2026-01-31 17:00:00.000','2026-02-27 17:00:00.000'),
('9cfa1e89-2207-47ee-9a03-f970e134f745','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',3,'มี.ค.','2026-02-28 17:00:00.000','2026-03-30 17:00:00.000'),
('a4bcbc88-0807-4ad1-b69e-a0601e6c68a6','3dcca793-f000-4a80-adbd-65037a83784f',8,'พ.ย. 2026','2026-10-31 17:00:00.000','2026-11-29 17:00:00.000'),
('a9dab332-64d0-4273-9f53-6d3266976416','9f731b50-2cb4-4692-80ed-8e3b311c0999',5,'มิ.ย. 2026','2026-05-31 17:00:00.000','2026-06-29 17:00:00.000'),
('ad1e0b8a-3209-4cfc-8267-9ac79bc84515','3dcca793-f000-4a80-adbd-65037a83784f',7,'ต.ค. 2026','2026-09-30 17:00:00.000','2026-10-30 17:00:00.000'),
('b6d11e89-ba3c-4a74-b548-08c933f4afc7','9f731b50-2cb4-4692-80ed-8e3b311c0999',10,'พ.ย. 2026','2026-10-31 17:00:00.000','2026-11-29 17:00:00.000'),
('b74ba46b-c8bf-405b-9faf-ea1269593736','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',2,'ก.พ.','2026-01-31 17:00:00.000','2026-02-27 17:00:00.000'),
('bed3fc28-d68a-491a-99c1-07ccae84e93f','62835ed8-01b0-4ffb-b365-a922948ea382',1,'พ.ค. 2026','2026-04-30 17:00:00.000','2026-05-30 17:00:00.000'),
('bf4ca420-e3e9-4007-bf81-c0b98bed83a0','62835ed8-01b0-4ffb-b365-a922948ea382',8,'ธ.ค. 2026','2026-11-30 17:00:00.000','2026-12-30 17:00:00.000'),
('c1145ae5-f413-4f10-8ee9-717140af3501','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',7,'ก.ค.','2026-06-30 17:00:00.000','2026-07-30 17:00:00.000'),
('c9e357f8-681c-4d84-a810-f299b76b520c','3dcca793-f000-4a80-adbd-65037a83784f',5,'ส.ค. 2026','2026-07-31 17:00:00.000','2026-08-30 17:00:00.000'),
('cb822ca8-2aa5-43a4-8537-1fa595e3cbd6','9f731b50-2cb4-4692-80ed-8e3b311c0999',13,'ก.พ. 2027','2027-01-31 17:00:00.000','2027-02-27 17:00:00.000'),
('cbfdae26-2407-47f0-aa69-01afea730662','3dcca793-f000-4a80-adbd-65037a83784f',1,'เม.ย. 2026','2026-03-31 17:00:00.000','2026-04-29 17:00:00.000'),
('cc878f77-ac38-455d-8683-38275bf46111','9f731b50-2cb4-4692-80ed-8e3b311c0999',3,'เม.ย. 2026','2026-03-31 17:00:00.000','2026-04-29 17:00:00.000'),
('cd635770-4df3-4d9a-8ade-2cb1d7a7aac4','9f731b50-2cb4-4692-80ed-8e3b311c0999',6,'ก.ค. 2026','2026-06-30 17:00:00.000','2026-07-30 17:00:00.000'),
('d00668f8-ce62-4238-ad9a-975675431268','9f731b50-2cb4-4692-80ed-8e3b311c0999',4,'พ.ค. 2026','2026-04-30 17:00:00.000','2026-05-30 17:00:00.000'),
('d163c793-0251-410c-bcb8-d014317218c1','62835ed8-01b0-4ffb-b365-a922948ea382',5,'ก.ย. 2026','2026-08-31 17:00:00.000','2026-09-29 17:00:00.000'),
('d3632b4f-5bcb-4cfa-a6d9-b35643b58505','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',6,'มิ.ย.','2026-05-31 17:00:00.000','2026-06-29 17:00:00.000'),
('d91deea2-5a63-48a9-9911-37b1a1383945','3dcca793-f000-4a80-adbd-65037a83784f',11,'ก.พ. 2027','2027-01-31 17:00:00.000','2027-02-27 17:00:00.000'),
('dc29a500-34d3-4c60-ad18-9c14e0a86937','62835ed8-01b0-4ffb-b365-a922948ea382',4,'ส.ค. 2026','2026-07-31 17:00:00.000','2026-08-30 17:00:00.000'),
('e035b07a-7236-4f65-a886-5c5a0434c71f','62835ed8-01b0-4ffb-b365-a922948ea382',10,'ก.พ. 2027','2027-01-31 17:00:00.000','2027-02-27 17:00:00.000'),
('e0802001-88c9-4f1a-85b2-7ade9812e190','05226ec5-75c7-425b-9084-c0130c794f19',10,'ต.ค.','2026-09-30 17:00:00.000','2026-10-30 17:00:00.000'),
('e09af3b9-98db-4f51-86c0-275b1644b509','05226ec5-75c7-425b-9084-c0130c794f19',1,'ม.ค.','2025-12-31 17:00:00.000','2026-01-30 17:00:00.000'),
('e1da01aa-6923-4299-ad36-1810289ce77b','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',11,'พ.ย.','2026-10-31 17:00:00.000','2026-11-29 17:00:00.000'),
('e2d3a4f4-2344-49dc-b976-20f590de6bcb','62835ed8-01b0-4ffb-b365-a922948ea382',12,'เม.ย. 2027','2027-03-31 17:00:00.000','2027-04-29 17:00:00.000'),
('e4a1e2ff-66f8-46dc-b338-e3bcdf146a59','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',1,'ม.ค.','2025-12-31 17:00:00.000','2026-01-30 17:00:00.000'),
('e9597c22-022c-4dea-9f6c-9fa7bce00e84','3dcca793-f000-4a80-adbd-65037a83784f',12,'มี.ค. 2027','2027-02-28 17:00:00.000','2027-03-30 17:00:00.000'),
('eb4e791d-e54d-4807-a3f8-bd5c629211a0','05226ec5-75c7-425b-9084-c0130c794f19',11,'พ.ย.','2026-10-31 17:00:00.000','2026-11-29 17:00:00.000'),
('edd567e0-269c-44f7-a254-db80962b98f7','d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb',12,'ธ.ค.','2026-11-30 17:00:00.000','2026-12-30 17:00:00.000'),
('f27a69a2-3590-44d6-86b0-8c9da0039ce8','62835ed8-01b0-4ffb-b365-a922948ea382',13,'พ.ค. 2027','2027-04-30 17:00:00.000','2027-05-30 17:00:00.000'),
('fea44a99-f59d-41bb-a810-791d3c71101e','3dcca793-f000-4a80-adbd-65037a83784f',9,'ธ.ค. 2026','2026-11-30 17:00:00.000','2026-12-30 17:00:00.000');
/*!40000 ALTER TABLE `workprogressperiod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressplan`
--

DROP TABLE IF EXISTS `workprogressplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressplan` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `periodType` enum('YEAR_12_MONTHS','YEAR_4_QUARTERS','HALF_2_PERIODS','CUSTOM') NOT NULL DEFAULT 'YEAR_12_MONTHS',
  `year` int(11) DEFAULT NULL,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `packageName` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `isArchived` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `customerId` varchar(191) NOT NULL,
  `createdById` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workprogressplan_customerId_idx` (`customerId`),
  KEY `workprogressplan_customerId_isArchived_idx` (`customerId`,`isArchived`),
  KEY `workprogressplan_createdById_fkey` (`createdById`),
  CONSTRAINT `workprogressplan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workprogressplan_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressplan`
--

LOCK TABLES `workprogressplan` WRITE;
/*!40000 ALTER TABLE `workprogressplan` DISABLE KEYS */;
INSERT INTO `workprogressplan` VALUES
('05226ec5-75c7-425b-9084-c0130c794f19','55555555555','YEAR_12_MONTHS',2026,'2025-12-31 17:00:00.000','2026-12-30 17:00:00.000',NULL,NULL,0,'2026-05-25 09:00:08.194','2026-05-25 09:00:08.194','68212a2c-e01b-48a3-877b-aebb07ea28d4','888f6fb4-c911-4e4a-8fda-bb172a6928a4'),
('3dcca793-f000-4a80-adbd-65037a83784f','amh-thailand','YEAR_12_MONTHS',2026,'2026-03-31 17:00:00.000','2027-05-30 17:00:00.000','Business Pro',NULL,0,'2026-05-26 07:51:45.594','2026-05-26 07:51:45.594','dc6c5975-1111-4d49-ad18-45a55542b997','888f6fb4-c911-4e4a-8fda-bb172a6928a4'),
('62835ed8-01b0-4ffb-b365-a922948ea382','SEO PNA','YEAR_12_MONTHS',2026,'2026-04-30 17:00:00.000','2027-05-30 17:00:00.000','พิเศษ',NULL,0,'2026-05-27 09:27:35.874','2026-05-27 09:55:03.640','c4fd4aaa-1c09-4355-bb5e-732309fc0e9e','888f6fb4-c911-4e4a-8fda-bb172a6928a4'),
('9f731b50-2cb4-4692-80ed-8e3b311c0999','bybetterk','YEAR_12_MONTHS',2026,'2026-01-31 17:00:00.000','2027-05-30 17:00:00.000','ชาเลนจ์ พิเศษ',NULL,0,'2026-05-26 07:58:29.185','2026-05-26 07:58:29.185','dacaddf6-870a-4dba-9950-4856a0e5be49','888f6fb4-c911-4e4a-8fda-bb172a6928a4'),
('d4f2f3d7-a292-4a8a-a3f9-82b4e49742cb','SEO chemtech','YEAR_12_MONTHS',2026,'2025-12-31 17:00:00.000','2026-12-30 17:00:00.000','Business Pro',NULL,0,'2026-05-25 07:40:00.522','2026-05-25 07:40:00.522','a5ec09b7-2066-4c94-853a-6a5bb8a37aaa','888f6fb4-c911-4e4a-8fda-bb172a6928a4');
/*!40000 ALTER TABLE `workprogressplan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogressstatus`
--

DROP TABLE IF EXISTS `workprogressstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogressstatus` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `color` varchar(191) DEFAULT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `isTerminal` tinyint(1) NOT NULL DEFAULT 0,
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isSystem` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workprogressstatus_code_key` (`code`),
  KEY `workprogressstatus_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogressstatus`
--

LOCK TABLES `workprogressstatus` WRITE;
/*!40000 ALTER TABLE `workprogressstatus` DISABLE KEYS */;
INSERT INTO `workprogressstatus` VALUES
('00000000-0000-4000-8002-000000000001','NOT_STARTED','ยังไม่เริ่ม',NULL,1,0,1,1,1,'2026-05-25 09:27:53.050','2026-05-25 09:27:53.050'),
('00000000-0000-4000-8002-000000000002','IN_PROGRESS','กำลังดำเนินการ','#9592ff',2,0,0,1,1,'2026-05-25 09:27:53.050','2026-05-25 09:27:53.050'),
('00000000-0000-4000-8002-000000000003','COMPLETED','เสร็จสิ้น','#31fb4c',3,1,0,1,1,'2026-05-25 09:27:53.050','2026-05-25 09:27:53.050'),
('00000000-0000-4000-8002-000000000004','ON_HOLD','ระงับชั่วคราว',NULL,4,0,0,1,1,'2026-05-25 09:27:53.050','2026-05-25 09:27:53.050'),
('00000000-0000-4000-8002-000000000005','CANCELLED','ยกเลิก',NULL,5,1,0,1,1,'2026-05-25 09:27:53.050','2026-05-25 09:27:53.050');
/*!40000 ALTER TABLE `workprogressstatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogresssubtask`
--

DROP TABLE IF EXISTS `workprogresssubtask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogresssubtask` (
  `id` varchar(191) NOT NULL,
  `itemId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `isDone` tinyint(1) NOT NULL DEFAULT 0,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `assignedToId` varchar(191) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workprogresssubtask_itemId_idx` (`itemId`),
  KEY `workprogresssubtask_assignedToId_idx` (`assignedToId`),
  CONSTRAINT `workprogresssubtask_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workprogresssubtask_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `workprogressitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogresssubtask`
--

LOCK TABLES `workprogresssubtask` WRITE;
/*!40000 ALTER TABLE `workprogresssubtask` DISABLE KEYS */;
INSERT INTO `workprogresssubtask` VALUES
('002355c7-a7f0-4a9d-a84b-b7847b0bf9c5','9a2f90d5-ddad-4149-9574-16b73af8da71','ตรวจสอบเว็บไซต์ลูกค้า',1,0,NULL,'2026-05-27 09:28:23.809','2026-05-27 09:27:35.901','2026-05-27 09:28:23.810'),
('07046dd2-03b3-42f4-9a46-f3ab4feb31c4','b699f02a-8221-4294-a0cc-ed5184dc0985','วิเคราะคีย์',1,0,NULL,'2026-05-26 08:01:18.714','2026-05-26 07:58:29.199','2026-05-26 08:01:18.715'),
('147936ca-a952-4ac9-8a55-909d891c6253','a63ec9be-9ceb-436b-80ac-f35edec17ed3','ติดตั้งโค้ตที่เกี่ยวข้อง',1,0,NULL,'2026-05-27 09:28:11.748','2026-05-27 09:27:35.897','2026-05-27 09:28:11.749'),
('16739289-335f-4fd3-9e5a-64c7301627b6','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','หลักฐานการชำระเงิน',1,3,NULL,'2026-05-26 08:52:12.992','2026-05-26 08:30:45.144','2026-05-26 08:52:12.993'),
('198527f6-7e72-46ab-b48b-c003a5f9f19f','596e298b-b03c-4fdc-b374-e3320775950d','ตรวจสอบผล 3 เดือนแรก',0,0,NULL,NULL,'2026-05-26 07:58:29.215','2026-05-26 07:58:29.215'),
('1fa563f5-77b0-4ab8-8dfc-2fa11e226449','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','เอกสาร PO',1,5,NULL,'2026-05-26 08:49:42.457','2026-05-26 08:49:14.908','2026-05-26 08:49:42.458'),
('21c874ee-a035-41bf-a9a2-cb8e90720505','6aa3d567-8a0e-4ed5-824d-871975ccf367','PO ลูกค้า',1,6,NULL,'2026-05-26 04:01:06.144','2026-05-25 09:15:15.092','2026-05-26 04:01:06.145'),
('23403498-744b-45df-8277-a50ccc8d21e0','6adcbda7-dc88-4641-9c3a-6a123b578c15','ตรวจสอบเว็บไซต์ลูกค้า',1,0,NULL,'2026-05-26 08:01:01.262','2026-05-26 07:58:29.206','2026-05-26 08:01:01.263'),
('2c844ea5-5713-4cee-9d93-76e811a45de6','8fa9e27a-6c41-4c9f-8ad1-6d8dff060004','ตรวจสอบเว็บไซต์ลูกค้า',1,0,NULL,'2026-05-26 08:07:07.712','2026-05-26 07:51:45.612','2026-05-26 08:07:07.713'),
('34a0a4f2-a374-4a60-81aa-9009b1f3596e','83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','เพิ่มบทความแบ็คลิงค์',0,3,NULL,NULL,'2026-05-27 10:02:30.744','2026-05-27 10:02:30.744'),
('3579cd4b-a43a-494b-9791-17e0ce1763b2','1a7251f9-dc62-405f-a656-13f60c652279','ทราฟฟิก',1,0,NULL,'2026-05-26 08:28:29.636','2026-05-26 08:28:28.202','2026-05-26 08:28:29.638'),
('39024731-3970-4266-adb1-f65eb7e1a220','08d542e9-75f8-426d-9887-f32b9b8059a7','เอกสารวางบิล',0,1,NULL,NULL,'2026-05-27 09:29:13.486','2026-05-27 09:29:13.486'),
('416dfd43-19d6-40a6-acf8-3c1a4992379a','f78b3a2e-b22b-4eb3-a094-a9fc56e0bb8a','ตรวจสอบผล 3 เดือนแรก',0,0,NULL,NULL,'2026-05-26 07:51:45.619','2026-05-26 07:51:45.619'),
('513cf9e9-4d3a-4a93-bc7c-ce3e35a7ea73','1a7251f9-dc62-405f-a656-13f60c652279','backlink',0,1,NULL,NULL,'2026-05-26 08:29:04.296','2026-05-26 08:29:04.296'),
('55f9deff-0769-4ab5-9ac5-a70455a5193b','83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','เพิ่ม แบ็คลิงค์',1,1,NULL,'2026-05-27 10:01:19.897','2026-05-27 10:01:18.408','2026-05-27 10:01:19.898'),
('5682238f-9e42-4b71-9b6d-8ec8f27592c3','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','ใบแจ้งหนี้ / วางบิล',1,4,NULL,'2026-05-26 08:52:14.097','2026-05-26 08:31:17.961','2026-05-26 08:52:14.098'),
('66019357-de28-4fcd-a222-5246e09018ec','08d542e9-75f8-426d-9887-f32b9b8059a7','ใบสนอราคา',1,0,NULL,'2026-05-27 09:28:47.690','2026-05-27 09:27:35.889','2026-05-27 09:28:47.691'),
('672161a5-50a8-4461-99ac-11a4d36c7208','6aa3d567-8a0e-4ed5-824d-871975ccf367','เอกสารหัก ณ ที่จ่าย',1,3,NULL,'2026-05-26 04:01:04.231','2026-05-25 08:43:27.063','2026-05-26 04:01:04.232'),
('679902b9-a42b-4c55-9c7d-400db5cfab12','900031ee-e810-464e-9738-0e2cb93d9801','รายงานลูกค้าทุกเดือน',1,0,NULL,'2026-05-26 08:24:32.253','2026-05-26 07:51:45.622','2026-05-26 08:24:32.254'),
('6d592762-0eeb-43c8-bef1-bc7567422944','ea5d24c4-2cc4-4d19-bde2-a7d245fe1cf8','ติดตั้งโค้ตที่เกี่ยวข้อง',1,0,NULL,'2026-05-26 08:07:02.773','2026-05-26 07:51:45.609','2026-05-26 08:07:02.774'),
('7c0f1dca-4fe9-4c5c-a37c-1e1ade59838f','46e10acb-11a4-4f10-bda8-7ea9f470168d','ตรวจสอบผล 3 เดือนแรก',0,0,NULL,NULL,'2026-05-27 09:27:35.912','2026-05-27 09:27:35.912'),
('7d157ec1-4428-48f7-adcb-36bcf12aff12','b5c7033d-d3fc-40b2-a64d-91ed986dddb5','วิเคราะคีย์',1,0,NULL,'2026-05-27 09:27:59.870','2026-05-27 09:27:35.893','2026-05-27 09:27:59.871'),
('85c4963f-af76-4f4c-9794-18e4df82b856','83762e4f-b553-4ec7-ac18-340df8f05f26','ติดตั้งโค้ตที่เกี่ยวข้อง',1,0,NULL,'2026-05-26 08:01:06.077','2026-05-26 07:58:29.203','2026-05-26 08:01:06.078'),
('8629f9d8-a291-41ef-b41a-ed531ef19be9','6aa3d567-8a0e-4ed5-824d-871975ccf367','หลักฐานการชำระเงิน',1,4,NULL,'2026-05-26 04:01:04.980','2026-05-25 08:47:52.370','2026-05-26 04:01:04.981'),
('9c536556-302f-4ac6-800e-3bcdf8f8a040','f4a487d3-da47-4b9f-b716-cbbe36e8857f','ทราฟฟิก และ แบ็คลิงค์',1,0,NULL,'2026-05-26 08:02:27.520','2026-05-26 07:58:29.212','2026-05-26 08:02:27.521'),
('a36de58b-2a61-4bbe-8f63-0ca7945c88b2','51ca57b4-b6d1-4b03-83ae-9df2b823cb4b','เข้าปรับแต่งเว็บไซต์ลูกค้า',1,0,NULL,'2026-05-27 09:28:46.380','2026-05-27 09:27:35.905','2026-05-27 09:28:46.381'),
('a644adaa-3719-42e7-a0e6-91463ee9032f','9215b5d7-9569-4946-b2ad-a8c1ce3ba8af','รายงานลูกค้าทุกเดือน',1,0,NULL,'2026-05-26 08:04:01.002','2026-05-26 07:58:29.218','2026-05-26 08:04:01.003'),
('a81b7652-ef05-45f3-90c9-1444771bce82','6aa3d567-8a0e-4ed5-824d-871975ccf367','ใบเสนอราคา',1,0,NULL,'2026-05-25 09:14:18.488','2026-05-25 08:38:49.454','2026-05-25 09:14:18.489'),
('af07180a-51d9-4133-9bab-ca967b3cfd9a','6aa3d567-8a0e-4ed5-824d-871975ccf367','เอกสารวางบิล',1,1,NULL,'2026-05-26 04:01:03.318','2026-05-25 08:39:15.413','2026-05-26 04:01:03.319'),
('b81f706e-edf2-47ac-9cde-aab106cb93b4','1060346e-1e75-4e0b-a6a6-dc15d40a25e8','เข้าปรับแต่งเว็บไซต์ลูกค้า',1,0,NULL,'2026-05-26 07:55:02.324','2026-05-26 07:51:45.614','2026-05-26 07:55:02.325'),
('ba3c50d9-d4f0-4765-b967-07f8daab63fa','6aa3d567-8a0e-4ed5-824d-871975ccf367','สัญญา NDA',1,5,NULL,'2026-05-27 04:06:45.143','2026-05-25 09:13:46.708','2026-05-27 04:06:45.144'),
('c5db108d-3374-41a6-8a1d-21018680b058','91420496-3589-4123-b9ad-46bfc8f06f91','ใบสนอราคา',1,0,NULL,'2026-05-26 08:01:23.281','2026-05-26 07:58:29.195','2026-05-26 08:01:23.282'),
('c8486b58-0ac3-4796-aa11-35abaae13f79','f2676ee0-c2f5-45a0-bb0b-f73277430312','รายงานลูกค้าทุกเดือน',0,0,NULL,NULL,'2026-05-27 09:27:35.916','2026-05-27 09:27:35.916'),
('d42e8276-ed32-43f7-941d-23d1a1620781','6aa3d567-8a0e-4ed5-824d-871975ccf367','ใบเสร็จ/ใบกำกับภาษี',1,2,NULL,'2026-05-27 03:50:46.086','2026-05-25 08:43:16.352','2026-05-27 03:50:46.088'),
('d62b136b-c522-4154-a682-72607c2760b9','4126f67a-d157-4683-93af-c9eac2eb4f15','คีย์ที่ดำเนินการผ่านอนุมัติ',1,0,NULL,'2026-05-25 07:46:53.364','2026-05-25 07:46:52.026','2026-05-25 07:46:53.365'),
('da5cdb84-3d75-44ce-8331-8f6a68ef04be','08d542e9-75f8-426d-9887-f32b9b8059a7','ใบเสร็จรับเงิน / ใบกำกับภาษี',0,2,NULL,NULL,'2026-05-27 09:29:41.539','2026-05-27 09:29:41.539'),
('dba85342-1157-4522-972c-64fb1d071541','e8ffb40d-d2ac-4d1f-a15d-d4e131337d86','เข้าปรับแต่งเว็บไซต์ลูกค้า',1,0,NULL,'2026-05-26 08:02:00.231','2026-05-26 07:58:29.209','2026-05-26 08:02:00.232'),
('eec0f3d6-718e-4005-bee7-ea2f61f56a8a','6785a560-1536-4639-bfbb-be8344fcbd87','วิเคราะคีย์',1,0,NULL,'2026-05-26 07:56:15.986','2026-05-26 07:51:45.607','2026-05-26 07:56:15.987'),
('f06b0853-b2de-4fba-b368-ed213706d815','83bf7a4e-55f4-4fc4-aa0d-a607937ebaa1','เพิ่มทราฟฟิก',0,2,NULL,NULL,'2026-05-27 10:01:32.391','2026-05-27 10:01:32.391'),
('fab15d40-7fcd-41f3-ab87-349552ae3d5b','2a3fd8e6-88c2-4c37-b2ed-2e003dfc8f0a','ใบสนอราคา',1,0,NULL,'2026-05-26 08:49:43.943','2026-05-26 07:51:45.603','2026-05-26 08:49:43.944');
/*!40000 ALTER TABLE `workprogresssubtask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogresstemplate`
--

DROP TABLE IF EXISTS `workprogresstemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogresstemplate` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `periodType` enum('YEAR_12_MONTHS','YEAR_4_QUARTERS','HALF_2_PERIODS','CUSTOM') NOT NULL DEFAULT 'YEAR_12_MONTHS',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isSystem` tinyint(1) NOT NULL DEFAULT 0,
  `createdById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `durationMonths` int(11) NOT NULL DEFAULT 12,
  PRIMARY KEY (`id`),
  KEY `workprogresstemplate_isActive_idx` (`isActive`),
  KEY `workprogresstemplate_createdById_fkey` (`createdById`),
  CONSTRAINT `workprogresstemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogresstemplate`
--

LOCK TABLES `workprogresstemplate` WRITE;
/*!40000 ALTER TABLE `workprogresstemplate` DISABLE KEYS */;
INSERT INTO `workprogresstemplate` VALUES
('00000000-0000-4000-8000-000000000001','SEO Standard 12 Months','แม่แบบงาน SEO มาตรฐาน 12 เดือน — ครอบคลุม Keyword, On-Page, Technical, Off-Page, Monitoring และ Report','YEAR_12_MONTHS',1,1,NULL,'2026-05-25 09:28:14.242','2026-05-25 09:28:14.242',12),
('c5817fb8-5262-4ebc-a8be-53314b96b3c2','test',NULL,'YEAR_12_MONTHS',1,0,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-25 06:32:06.044','2026-05-25 06:32:06.044',12),
('ddceea2f-474f-44bf-9323-ca1756fc86bb','SEO SET 2026','SEO SET 2026 ทั่วไป','YEAR_12_MONTHS',1,0,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-26 07:37:42.897','2026-05-26 07:37:42.897',12),
('e000725c-3650-470f-8e49-f0b75b449062','test',NULL,'YEAR_12_MONTHS',1,0,'888f6fb4-c911-4e4a-8fda-bb172a6928a4','2026-05-25 13:11:36.064','2026-05-25 13:11:36.064',18);
/*!40000 ALTER TABLE `workprogresstemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogresstemplateitem`
--

DROP TABLE IF EXISTS `workprogresstemplateitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogresstemplateitem` (
  `id` varchar(191) NOT NULL,
  `templateId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `activity` text NOT NULL,
  `description` text DEFAULT NULL,
  `duration` varchar(191) DEFAULT NULL,
  `weight` int(11) NOT NULL DEFAULT 1,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `defaultPeriods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`defaultPeriods`)),
  PRIMARY KEY (`id`),
  KEY `workprogresstemplateitem_templateId_idx` (`templateId`),
  KEY `workprogresstemplateitem_categoryId_idx` (`categoryId`),
  CONSTRAINT `workprogresstemplateitem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `workprogresscategory` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `workprogresstemplateitem_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `workprogresstemplate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogresstemplateitem`
--

LOCK TABLES `workprogresstemplateitem` WRITE;
/*!40000 ALTER TABLE `workprogresstemplateitem` DISABLE KEYS */;
INSERT INTO `workprogresstemplateitem` VALUES
('00000000-0000-4000-8004-000000000001','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000001','วิเคราะห์คีย์เวิร์ดหลัก เลือกคีย์',NULL,NULL,1,0,NULL),
('00000000-0000-4000-8004-000000000002','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000002','ติดตั้ง SEO และ config',NULL,NULL,1,1,NULL),
('00000000-0000-4000-8004-000000000003','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000001','ขยายสู่คีย์เวิร์ดเฉพาะกลุ่ม',NULL,NULL,1,2,NULL),
('00000000-0000-4000-8004-000000000004','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000001','เจาะจง Intent กลุ่มซื้อ',NULL,NULL,1,3,NULL),
('00000000-0000-4000-8004-000000000005','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000001','อัปเดตตามเทรนด์',NULL,NULL,1,4,NULL),
('00000000-0000-4000-8004-000000000006','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000003','ปรับโครงสร้างเนื้อหา',NULL,NULL,1,5,NULL),
('00000000-0000-4000-8004-000000000007','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000003','ทำคอนเทนต์ E-E-A-T',NULL,NULL,1,6,NULL),
('00000000-0000-4000-8004-000000000008','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000003','เพิ่ม Rich Snippets Structured Data',NULL,NULL,1,7,NULL),
('00000000-0000-4000-8004-000000000009','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000003','ปรับปรุงบทความเดิม หรือสร้างบทความเพิ่ม',NULL,NULL,1,8,NULL),
('00000000-0000-4000-8004-000000000010','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000004','แก้ Error (403, 404) หากมีปัญหาเยอะเกินไป',NULL,NULL,1,9,NULL),
('00000000-0000-4000-8004-000000000011','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000004','ปรับความเร็ว (Speed)',NULL,NULL,1,10,NULL),
('00000000-0000-4000-8004-000000000012','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000004','ตรวจสอบ Mobile Friendly',NULL,NULL,1,11,NULL),
('00000000-0000-4000-8004-000000000013','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000004','ตรวจสอบความปลอดภัย',NULL,NULL,1,12,NULL),
('00000000-0000-4000-8004-000000000014','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000005','ลงทะเบียน Directory index',NULL,NULL,1,13,NULL),
('00000000-0000-4000-8004-000000000015','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000005','เริ่มทำ Digital PR หากมี อาจมีค่าใช้จ่ายเพิ่ม',NULL,NULL,1,14,NULL),
('00000000-0000-4000-8004-000000000016','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000005','สร้าง Content Partnership',NULL,NULL,1,15,NULL),
('00000000-0000-4000-8004-000000000017','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000005','กระจาย Backlink คุณภาพ',NULL,NULL,1,16,NULL),
('00000000-0000-4000-8004-000000000018','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000005','ส่งทราฟฟิกคุณภาพ',NULL,NULL,1,17,NULL),
('00000000-0000-4000-8004-000000000019','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000006','ตั้งค่า GSC / Analytics วิเคราะห์',NULL,NULL,1,18,NULL),
('00000000-0000-4000-8004-000000000020','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000006','ตรวจสอบอันดับ (Rank)',NULL,NULL,1,19,NULL),
('00000000-0000-4000-8004-000000000021','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000006','Crawl Website',NULL,NULL,1,20,NULL),
('00000000-0000-4000-8004-000000000022','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000006','วิเคราะห์ Conversion',NULL,NULL,1,21,NULL),
('00000000-0000-4000-8004-000000000023','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8001-000000000007','เข้าสู่ระบบ seoprime เข้าดูได้ ตลอด 24 ชม',NULL,NULL,1,22,NULL),
('2134ae62-b7d1-4b39-97a7-d43a862e768b','ddceea2f-474f-44bf-9323-ca1756fc86bb','00000000-0000-4000-8001-000000000002','ติดตั้ง GSC TAG Website','ติดตั้ง GSC TAG Website','1 week',1,2,NULL),
('367b65b0-64aa-4724-b86f-316064fb7c48','e000725c-3650-470f-8e49-f0b75b449062','00000000-0000-4000-8001-000000000001','วิเคระห์เว็บไซต์',NULL,'1 เดือน',1,0,'{\"1\":{\"markTypeId\":\"00000000-0000-4000-8003-000000000001\"}}'),
('5b46f4e4-382b-4f48-a6b2-0d40268fbbc5','ddceea2f-474f-44bf-9323-ca1756fc86bb','00000000-0000-4000-8001-000000000001','วิเคราะคีย์ วางแผนคีย์','วิเคราะคีย์ วางแผนคีย์','1 week',1,1,NULL),
('5f1aaa58-75fa-49f6-bf0f-32d338d95bf2','ddceea2f-474f-44bf-9323-ca1756fc86bb','00000000-0000-4000-8001-000000000003','เข้าปรับแต่งเว็บไซต์ลูกค้า','เข้าปรับแต่งเว็บไซต์ลูกค้า','1 เดือน',1,4,NULL),
('861a9b02-7af0-4356-aee6-88b4e4b3d176','ddceea2f-474f-44bf-9323-ca1756fc86bb','00000000-0000-4000-8001-000000000006','ตรวจสอบผล 3 เดือนแรก','ตรวจสอบผล 3 เดือนแรก','1 week',1,6,NULL),
('96a6640a-2b08-4045-b5c1-62768cf961ba','ddceea2f-474f-44bf-9323-ca1756fc86bb','00000000-0000-4000-8001-000000000005','ปรับ OFFPAGE จากภายนอก','ปรับ OFFPAGE จากภายนอก\nทราฟฟิก และ แบ็คลิงค์','3 เดือน',1,5,NULL),
('abdaf9a1-cb94-454a-9ed2-9a36d5f85026','ddceea2f-474f-44bf-9323-ca1756fc86bb','00000000-0000-4000-8001-000000000007','รายงานลูกค้าทุกเดือน','รายงานลูกค้าทุกเดือน สามารถเข้าสู่ระบบ ดูรายละเอียดได้ทุกเดือน อัพเดทช่วงวันที่ 25-30 ของเดือนนั้นๆ','1 week',1,7,NULL),
('e75dc664-e8c5-4dbd-af14-cbdd653e8431','ddceea2f-474f-44bf-9323-ca1756fc86bb','00000000-0000-4000-8001-000000000004','ตรวจสอบเว็บไซต์ลูกค้า','ตรวจสอบเว็บไซต์ลูกค้า ความเร็ว และปัญหา เพื่อให้เหมาะสมกับการทำ SEO','1 week',1,3,NULL),
('fd990c51-595a-46b0-8526-517f5a838c09','ddceea2f-474f-44bf-9323-ca1756fc86bb','dac60f09-fcbe-4591-b2f1-7a2716b11200','ใบเสนอราคา วางบิล สัญญา','ใบเสนอราคา วางบิล สัญญา','1 week',1,0,NULL);
/*!40000 ALTER TABLE `workprogresstemplateitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workprogresstemplatesubtask`
--

DROP TABLE IF EXISTS `workprogresstemplatesubtask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workprogresstemplatesubtask` (
  `id` varchar(191) NOT NULL,
  `templateItemId` varchar(191) NOT NULL,
  `title` text NOT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workprogresstemplatesubtask_templateItemId_idx` (`templateItemId`),
  CONSTRAINT `workprogresstemplatesubtask_templateItemId_fkey` FOREIGN KEY (`templateItemId`) REFERENCES `workprogresstemplateitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workprogresstemplatesubtask`
--

LOCK TABLES `workprogresstemplatesubtask` WRITE;
/*!40000 ALTER TABLE `workprogresstemplatesubtask` DISABLE KEYS */;
INSERT INTO `workprogresstemplatesubtask` VALUES
('0cbaf93f-54f0-414d-a9b2-e5177ddf8c3a','5b46f4e4-382b-4f48-a6b2-0d40268fbbc5','วิเคราะคีย์',0,'2026-05-26 07:40:47.307','2026-05-26 07:40:47.307'),
('11428d1f-1d68-4799-90c0-59ce728ca7e6','861a9b02-7af0-4356-aee6-88b4e4b3d176','ตรวจสอบผล 3 เดือนแรก',0,'2026-05-26 07:46:19.981','2026-05-26 07:46:19.981'),
('443c6a01-cad8-40d5-b3fe-2dd9d60857a1','abdaf9a1-cb94-454a-9ed2-9a36d5f85026','รายงานลูกค้าทุกเดือน',0,'2026-05-26 07:47:26.431','2026-05-26 07:47:26.431'),
('63910092-7ca2-4b97-a86b-d49a7daba45b','96a6640a-2b08-4045-b5c1-62768cf961ba','ทราฟฟิก และ แบ็คลิงค์',0,'2026-05-26 07:45:35.784','2026-05-26 07:45:35.784'),
('6a974401-da58-4203-9a84-c105a86ef1e1','5f1aaa58-75fa-49f6-bf0f-32d338d95bf2','เข้าปรับแต่งเว็บไซต์ลูกค้า',0,'2026-05-26 07:44:30.219','2026-05-26 07:44:30.219'),
('82953915-4eb0-4d03-8b28-c9504b8ff83e','fd990c51-595a-46b0-8526-517f5a838c09','เอกสารสัญาญา (หากมี)',1,'2026-05-26 07:39:55.004','2026-05-26 07:39:55.004'),
('a7782cda-11a8-4768-a36f-8b05d368d906','fd990c51-595a-46b0-8526-517f5a838c09','ใบวางบิล (หากมี)',2,'2026-05-26 07:39:55.004','2026-05-26 07:39:55.004'),
('e7213822-a59c-4a2d-b76c-f8daae33417a','fd990c51-595a-46b0-8526-517f5a838c09','ใบสนอราคา',0,'2026-05-26 07:39:55.004','2026-05-26 07:39:55.004'),
('f85fc969-3120-4829-b93a-bbd772d7d8b9','2134ae62-b7d1-4b39-97a7-d43a862e768b','ติดตั้งโค้ตที่เกี่ยวข้อง',0,'2026-05-26 07:42:00.444','2026-05-26 07:42:00.444'),
('fc051205-e1f9-4b75-a078-72505830df18','e75dc664-e8c5-4dbd-af14-cbdd653e8431','ตรวจสอบเว็บไซต์ลูกค้า',0,'2026-05-26 07:43:55.663','2026-05-26 07:43:55.663');
/*!40000 ALTER TABLE `workprogresstemplatesubtask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'seo_nohack'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28  9:07:08
