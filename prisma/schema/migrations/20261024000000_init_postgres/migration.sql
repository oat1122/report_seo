-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SEO_DEV', 'CUSTOMER', 'BLOG_WRITER');

-- CreateEnum
CREATE TYPE "KDLevel" AS ENUM ('HARD', 'MEDIUM', 'EASY');

-- CreateEnum
CREATE TYPE "NextStepPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentPlanType" AS ENUM ('MONTHLY', 'INSTALLMENT');

-- CreateEnum
CREATE TYPE "PaymentPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingCycleStatus" AS ENUM ('PENDING', 'REVIEWING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkProgressPeriodType" AS ENUM ('YEAR_12_MONTHS', 'YEAR_4_QUARTERS', 'HALF_2_PERIODS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DocumentTemplateScope" AS ENUM ('GENERAL', 'PLAN');

-- CreateEnum
CREATE TYPE "BlogStageCode" AS ENUM ('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC', 'SUBMIT_ARTICLE', 'CLIENT_FEEDBACK_ARTICLE', 'SUBMIT_FINAL');

-- CreateEnum
CREATE TYPE "BlogArticleStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'WAITING_CLIENT', 'CHANGES_REQUESTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "BlogFileKind" AS ENUM ('COVER_IMAGE', 'ARTICLE_DOC');

-- CreateEnum
CREATE TYPE "BlogFeedbackDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "BlogKeywordSource" AS ENUM ('REPORT', 'RECOMMEND', 'MANUAL');

-- CreateEnum
CREATE TYPE "BillingDocumentType" AS ENUM ('BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE');

-- CreateTable
CREATE TABLE "aioverview" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "aioverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aioverviewimage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiOverviewId" TEXT NOT NULL,

    CONSTRAINT "aioverviewimage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companysettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companysettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billingdocument" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "type" "BillingDocumentType" NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "items" JSONB,
    "includeVat" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "customerName" TEXT,
    "billingCycleId" TEXT,

    CONSTRAINT "billingdocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentsequence" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "lastSeq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "documentsequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogarticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "keyFocus" TEXT,
    "targetYear" INTEGER NOT NULL,
    "targetMonth" INTEGER NOT NULL,
    "status" "BlogArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "publishedUrl" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "blogarticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogarticlekeyword" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "source" "BlogKeywordSource" NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "blogarticlekeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogarticlestage" (
    "id" TEXT NOT NULL,
    "stageCode" "BlogStageCode" NOT NULL,
    "seq" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "note" TEXT,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "blogarticlestage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogarticlesubmission" (
    "id" TEXT NOT NULL,
    "stageCode" "BlogStageCode" NOT NULL,
    "round" INTEGER NOT NULL,
    "message" TEXT,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "blogarticlesubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogarticlefile" (
    "id" TEXT NOT NULL,
    "kind" "BlogFileKind" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "submissionId" TEXT,
    "uploadedById" TEXT,

    CONSTRAINT "blogarticlefile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogarticlefeedback" (
    "id" TEXT NOT NULL,
    "stageCode" "BlogStageCode" NOT NULL,
    "decision" "BlogFeedbackDecision" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "blogarticlefeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seoDevId" TEXT,
    "blogWriterId" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "articlesPerMonth" INTEGER NOT NULL DEFAULT 0,
    "blogRequiresApproval" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overallmetrics" (
    "id" TEXT NOT NULL,
    "domainRating" INTEGER NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "ageInYears" INTEGER NOT NULL,
    "ageInMonths" INTEGER NOT NULL DEFAULT 0,
    "spamScore" DOUBLE PRECISION NOT NULL,
    "organicTraffic" DOUBLE PRECISION NOT NULL,
    "organicKeywords" DOUBLE PRECISION NOT NULL,
    "backlinks" INTEGER NOT NULL,
    "refDomains" INTEGER NOT NULL,
    "dateRecorded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "overallmetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overallmetricshistory" (
    "id" TEXT NOT NULL,
    "domainRating" INTEGER NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "ageInYears" INTEGER NOT NULL,
    "ageInMonths" INTEGER NOT NULL DEFAULT 0,
    "spamScore" DOUBLE PRECISION NOT NULL,
    "organicTraffic" DOUBLE PRECISION NOT NULL,
    "organicKeywords" DOUBLE PRECISION NOT NULL,
    "backlinks" INTEGER NOT NULL,
    "refDomains" INTEGER NOT NULL,
    "dateRecorded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "overallmetricshistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywordreport" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "position" INTEGER,
    "traffic" INTEGER NOT NULL,
    "kd" "KDLevel" NOT NULL,
    "isTopReport" BOOLEAN NOT NULL DEFAULT false,
    "dateRecorded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "keywordreport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywordreportimage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keywordReportId" TEXT NOT NULL,

    CONSTRAINT "keywordreportimage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywordreporthistory" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "position" INTEGER,
    "traffic" INTEGER NOT NULL,
    "kd" "KDLevel" NOT NULL,
    "isTopReport" BOOLEAN NOT NULL,
    "dateRecorded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "keywordreporthistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywordrecommend" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "kd" "KDLevel",
    "isTopReport" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "keywordrecommend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customernextstep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "NextStepPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "customernextstep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customernextstepimage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextStepId" TEXT NOT NULL,

    CONSTRAINT "customernextstepimage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paymentproof" (
    "id" TEXT NOT NULL,
    "uploadUrl" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "customerId" TEXT NOT NULL,
    "billingCycleId" TEXT,

    CONSTRAINT "paymentproof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paymentplan" (
    "id" TEXT NOT NULL,
    "type" "PaymentPlanType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "billingDay" INTEGER,
    "totalInstallments" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "PaymentPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "paymentplan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billingcycle" (
    "id" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "BillingCycleStatus" NOT NULL DEFAULT 'PENDING',
    "paidDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "billingcycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractfile" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "contractfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtoken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "workprogresscategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workprogresscategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressstatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workprogressstatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressmarktype" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workprogressmarktype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressplan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "periodType" "WorkProgressPeriodType" NOT NULL DEFAULT 'YEAR_12_MONTHS',
    "year" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "packageName" TEXT,
    "note" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "workprogressplan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressperiod" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "workprogressperiod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressitem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "description" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "duration" TEXT,
    "note" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceFreq" TEXT,
    "recurrenceInterval" INTEGER NOT NULL DEFAULT 1,
    "recurrenceDayOfMonth" INTEGER,
    "assignedToId" TEXT,

    CONSTRAINT "workprogressitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressitemperiodmark" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "markTypeId" TEXT NOT NULL,
    "progressPercent" INTEGER,
    "note" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workprogressitemperiodmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogresstemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "periodType" "WorkProgressPeriodType" NOT NULL DEFAULT 'YEAR_12_MONTHS',
    "durationMonths" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workprogresstemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogresstemplateitem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "defaultPeriods" JSONB,

    CONSTRAINT "workprogresstemplateitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogresstemplatesubtask" (
    "id" TEXT NOT NULL,
    "templateItemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workprogresstemplatesubtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogresssubtask" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workprogresssubtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressattachment" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "caption" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workprogressattachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workprogressactivity" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workprogressactivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aioverview_customerId_idx" ON "aioverview"("customerId");

-- CreateIndex
CREATE INDEX "aioverviewimage_aiOverviewId_idx" ON "aioverviewimage"("aiOverviewId");

-- CreateIndex
CREATE UNIQUE INDEX "billingdocument_documentNumber_key" ON "billingdocument"("documentNumber");

-- CreateIndex
CREATE INDEX "billingdocument_customerId_idx" ON "billingdocument"("customerId");

-- CreateIndex
CREATE INDEX "billingdocument_billingCycleId_idx" ON "billingdocument"("billingCycleId");

-- CreateIndex
CREATE INDEX "billingdocument_type_generatedAt_idx" ON "billingdocument"("type", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "documentsequence_prefix_year_key" ON "documentsequence"("prefix", "year");

-- CreateIndex
CREATE INDEX "blogarticle_customerId_idx" ON "blogarticle"("customerId");

-- CreateIndex
CREATE INDEX "blogarticle_customerId_targetYear_targetMonth_idx" ON "blogarticle"("customerId", "targetYear", "targetMonth");

-- CreateIndex
CREATE INDEX "blogarticlekeyword_articleId_idx" ON "blogarticlekeyword"("articleId");

-- CreateIndex
CREATE INDEX "blogarticlekeyword_keyword_idx" ON "blogarticlekeyword"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "blogarticlekeyword_articleId_keyword_key" ON "blogarticlekeyword"("articleId", "keyword");

-- CreateIndex
CREATE INDEX "blogarticlestage_articleId_idx" ON "blogarticlestage"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "blogarticlestage_articleId_stageCode_key" ON "blogarticlestage"("articleId", "stageCode");

-- CreateIndex
CREATE INDEX "blogarticlesubmission_articleId_idx" ON "blogarticlesubmission"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "blogarticlesubmission_articleId_stageCode_round_key" ON "blogarticlesubmission"("articleId", "stageCode", "round");

-- CreateIndex
CREATE INDEX "blogarticlefile_articleId_kind_idx" ON "blogarticlefile"("articleId", "kind");

-- CreateIndex
CREATE INDEX "blogarticlefeedback_articleId_idx" ON "blogarticlefeedback"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_domain_key" ON "customer"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "customer_userId_key" ON "customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "overallmetrics_customerId_key" ON "overallmetrics"("customerId");

-- CreateIndex
CREATE INDEX "overallmetricshistory_customerId_idx" ON "overallmetricshistory"("customerId");

-- CreateIndex
CREATE INDEX "overallmetricshistory_dateRecorded_idx" ON "overallmetricshistory"("dateRecorded");

-- CreateIndex
CREATE INDEX "keywordreportimage_keywordReportId_idx" ON "keywordreportimage"("keywordReportId");

-- CreateIndex
CREATE INDEX "keywordreporthistory_reportId_idx" ON "keywordreporthistory"("reportId");

-- CreateIndex
CREATE INDEX "keywordreporthistory_dateRecorded_idx" ON "keywordreporthistory"("dateRecorded");

-- CreateIndex
CREATE INDEX "keywordrecommend_customerId_idx" ON "keywordrecommend"("customerId");

-- CreateIndex
CREATE INDEX "customernextstep_customerId_idx" ON "customernextstep"("customerId");

-- CreateIndex
CREATE INDEX "customernextstepimage_nextStepId_idx" ON "customernextstepimage"("nextStepId");

-- CreateIndex
CREATE INDEX "notification_userId_isRead_createdAt_idx" ON "notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "notification_actorId_idx" ON "notification"("actorId");

-- CreateIndex
CREATE INDEX "notification_preference_userId_idx" ON "notification_preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preference_userId_type_key" ON "notification_preference"("userId", "type");

-- CreateIndex
CREATE INDEX "paymentproof_billingCycleId_idx" ON "paymentproof"("billingCycleId");

-- CreateIndex
CREATE INDEX "paymentplan_customerId_idx" ON "paymentplan"("customerId");

-- CreateIndex
CREATE INDEX "paymentplan_customerId_status_idx" ON "paymentplan"("customerId", "status");

-- CreateIndex
CREATE INDEX "billingcycle_planId_idx" ON "billingcycle"("planId");

-- CreateIndex
CREATE INDEX "billingcycle_dueDate_idx" ON "billingcycle"("dueDate");

-- CreateIndex
CREATE INDEX "contractfile_customerId_idx" ON "contractfile"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_providerAccountId_key" ON "account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_sessionToken_key" ON "session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtoken_token_key" ON "verificationtoken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtoken_identifier_token_key" ON "verificationtoken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "workprogresscategory_code_key" ON "workprogresscategory"("code");

-- CreateIndex
CREATE INDEX "workprogresscategory_isActive_idx" ON "workprogresscategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workprogressstatus_code_key" ON "workprogressstatus"("code");

-- CreateIndex
CREATE INDEX "workprogressstatus_isActive_idx" ON "workprogressstatus"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workprogressmarktype_code_key" ON "workprogressmarktype"("code");

-- CreateIndex
CREATE INDEX "workprogressmarktype_isActive_idx" ON "workprogressmarktype"("isActive");

-- CreateIndex
CREATE INDEX "workprogressplan_customerId_idx" ON "workprogressplan"("customerId");

-- CreateIndex
CREATE INDEX "workprogressplan_customerId_isArchived_idx" ON "workprogressplan"("customerId", "isArchived");

-- CreateIndex
CREATE INDEX "workprogressperiod_planId_idx" ON "workprogressperiod"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "workprogressperiod_planId_seq_key" ON "workprogressperiod"("planId", "seq");

-- CreateIndex
CREATE INDEX "workprogressitem_planId_idx" ON "workprogressitem"("planId");

-- CreateIndex
CREATE INDEX "workprogressitem_categoryId_idx" ON "workprogressitem"("categoryId");

-- CreateIndex
CREATE INDEX "workprogressitem_statusId_idx" ON "workprogressitem"("statusId");

-- CreateIndex
CREATE INDEX "workprogressitem_assignedToId_idx" ON "workprogressitem"("assignedToId");

-- CreateIndex
CREATE INDEX "workprogressitemperiodmark_itemId_idx" ON "workprogressitemperiodmark"("itemId");

-- CreateIndex
CREATE INDEX "workprogressitemperiodmark_periodId_idx" ON "workprogressitemperiodmark"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "workprogressitemperiodmark_itemId_periodId_key" ON "workprogressitemperiodmark"("itemId", "periodId");

-- CreateIndex
CREATE INDEX "workprogresstemplate_isActive_idx" ON "workprogresstemplate"("isActive");

-- CreateIndex
CREATE INDEX "workprogresstemplateitem_templateId_idx" ON "workprogresstemplateitem"("templateId");

-- CreateIndex
CREATE INDEX "workprogresstemplateitem_categoryId_idx" ON "workprogresstemplateitem"("categoryId");

-- CreateIndex
CREATE INDEX "workprogresstemplatesubtask_templateItemId_idx" ON "workprogresstemplatesubtask"("templateItemId");

-- CreateIndex
CREATE INDEX "workprogresssubtask_itemId_idx" ON "workprogresssubtask"("itemId");

-- CreateIndex
CREATE INDEX "workprogresssubtask_assignedToId_idx" ON "workprogresssubtask"("assignedToId");

-- CreateIndex
CREATE INDEX "workprogressattachment_itemId_idx" ON "workprogressattachment"("itemId");

-- CreateIndex
CREATE INDEX "workprogressactivity_planId_idx" ON "workprogressactivity"("planId");

-- CreateIndex
CREATE INDEX "workprogressactivity_planId_createdAt_idx" ON "workprogressactivity"("planId", "createdAt");

-- AddForeignKey
ALTER TABLE "aioverview" ADD CONSTRAINT "aioverview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aioverviewimage" ADD CONSTRAINT "aioverviewimage_aiOverviewId_fkey" FOREIGN KEY ("aiOverviewId") REFERENCES "aioverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billingdocument" ADD CONSTRAINT "billingdocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billingdocument" ADD CONSTRAINT "billingdocument_billingCycleId_fkey" FOREIGN KEY ("billingCycleId") REFERENCES "billingcycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticle" ADD CONSTRAINT "blogarticle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticle" ADD CONSTRAINT "blogarticle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlekeyword" ADD CONSTRAINT "blogarticlekeyword_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "blogarticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlestage" ADD CONSTRAINT "blogarticlestage_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "blogarticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlesubmission" ADD CONSTRAINT "blogarticlesubmission_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "blogarticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlesubmission" ADD CONSTRAINT "blogarticlesubmission_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlefile" ADD CONSTRAINT "blogarticlefile_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "blogarticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlefile" ADD CONSTRAINT "blogarticlefile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "blogarticlesubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlefile" ADD CONSTRAINT "blogarticlefile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlefeedback" ADD CONSTRAINT "blogarticlefeedback_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "blogarticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogarticlefeedback" ADD CONSTRAINT "blogarticlefeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_seoDevId_fkey" FOREIGN KEY ("seoDevId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_blogWriterId_fkey" FOREIGN KEY ("blogWriterId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overallmetrics" ADD CONSTRAINT "overallmetrics_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overallmetricshistory" ADD CONSTRAINT "overallmetricshistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keywordreport" ADD CONSTRAINT "keywordreport_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keywordreportimage" ADD CONSTRAINT "keywordreportimage_keywordReportId_fkey" FOREIGN KEY ("keywordReportId") REFERENCES "keywordreport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keywordreporthistory" ADD CONSTRAINT "keywordreporthistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "keywordreport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keywordrecommend" ADD CONSTRAINT "keywordrecommend_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customernextstep" ADD CONSTRAINT "customernextstep_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customernextstepimage" ADD CONSTRAINT "customernextstepimage_nextStepId_fkey" FOREIGN KEY ("nextStepId") REFERENCES "customernextstep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentproof" ADD CONSTRAINT "paymentproof_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentproof" ADD CONSTRAINT "paymentproof_billingCycleId_fkey" FOREIGN KEY ("billingCycleId") REFERENCES "billingcycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentplan" ADD CONSTRAINT "paymentplan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billingcycle" ADD CONSTRAINT "billingcycle_planId_fkey" FOREIGN KEY ("planId") REFERENCES "paymentplan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractfile" ADD CONSTRAINT "contractfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressplan" ADD CONSTRAINT "workprogressplan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressplan" ADD CONSTRAINT "workprogressplan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressperiod" ADD CONSTRAINT "workprogressperiod_planId_fkey" FOREIGN KEY ("planId") REFERENCES "workprogressplan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressitem" ADD CONSTRAINT "workprogressitem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "workprogressplan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressitem" ADD CONSTRAINT "workprogressitem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "workprogresscategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressitem" ADD CONSTRAINT "workprogressitem_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "workprogressstatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressitem" ADD CONSTRAINT "workprogressitem_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressitemperiodmark" ADD CONSTRAINT "workprogressitemperiodmark_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "workprogressitem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressitemperiodmark" ADD CONSTRAINT "workprogressitemperiodmark_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "workprogressperiod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressitemperiodmark" ADD CONSTRAINT "workprogressitemperiodmark_markTypeId_fkey" FOREIGN KEY ("markTypeId") REFERENCES "workprogressmarktype"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogresstemplate" ADD CONSTRAINT "workprogresstemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogresstemplateitem" ADD CONSTRAINT "workprogresstemplateitem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "workprogresstemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogresstemplateitem" ADD CONSTRAINT "workprogresstemplateitem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "workprogresscategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogresstemplatesubtask" ADD CONSTRAINT "workprogresstemplatesubtask_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES "workprogresstemplateitem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogresssubtask" ADD CONSTRAINT "workprogresssubtask_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "workprogressitem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogresssubtask" ADD CONSTRAINT "workprogresssubtask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressattachment" ADD CONSTRAINT "workprogressattachment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "workprogressitem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressattachment" ADD CONSTRAINT "workprogressattachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressactivity" ADD CONSTRAINT "workprogressactivity_planId_fkey" FOREIGN KEY ("planId") REFERENCES "workprogressplan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workprogressactivity" ADD CONSTRAINT "workprogressactivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

