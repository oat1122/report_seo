# Graph Report - src + prisma  (2026-05-29)

## Corpus Check
- Large corpus: 636 files · ~123,854 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2776 nodes · 8430 edges · 106 communities (99 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Documents & Work-Progress UI|Documents & Work-Progress UI]]
- [[_COMMUNITY_Billing & Payment Tables|Billing & Payment Tables]]
- [[_COMMUNITY_Users & Auth Persistence|Users & Auth Persistence]]
- [[_COMMUNITY_Shared UI & Customer Search|Shared UI & Customer Search]]
- [[_COMMUNITY_Work-Progress Schemas & Master UC|Work-Progress Schemas & Master UC]]
- [[_COMMUNITY_Payments & Calendar UI|Payments & Calendar UI]]
- [[_COMMUNITY_Customer API Routes|Customer API Routes]]
- [[_COMMUNITY_Work-Progress Template Domain|Work-Progress Template Domain]]
- [[_COMMUNITY_Work-Progress Plan Repository|Work-Progress Plan Repository]]
- [[_COMMUNITY_WP Template Routes & RoleGuard|WP Template Routes & RoleGuard]]
- [[_COMMUNITY_Work-Progress Master Data|Work-Progress Master Data]]
- [[_COMMUNITY_Work-Progress Item Hooks|Work-Progress Item Hooks]]
- [[_COMMUNITY_Customer Report Metrics Lib|Customer Report Metrics Lib]]
- [[_COMMUNITY_Customer Report Charts|Customer Report Charts]]
- [[_COMMUNITY_Work-Progress Use Cases|Work-Progress Use Cases]]
- [[_COMMUNITY_Work-Progress Subtasks|Work-Progress Subtasks]]
- [[_COMMUNITY_Customer Report Anomaly Charts|Customer Report Anomaly Charts]]
- [[_COMMUNITY_User Management UI|User Management UI]]
- [[_COMMUNITY_Attachments & File Upload|Attachments & File Upload]]
- [[_COMMUNITY_Metrics Persistence|Metrics Persistence]]
- [[_COMMUNITY_Metrics Types & Hooks|Metrics Types & Hooks]]
- [[_COMMUNITY_Customer Access Context|Customer Access Context]]
- [[_COMMUNITY_Billing Documents Public API|Billing Documents Public API]]
- [[_COMMUNITY_Customer Keyword API Routes|Customer Keyword API Routes]]
- [[_COMMUNITY_Notifications|Notifications]]
- [[_COMMUNITY_Admin Pages|Admin Pages]]
- [[_COMMUNITY_Keyword Recommendations|Keyword Recommendations]]
- [[_COMMUNITY_HTTP Errors & Master Kind|HTTP Errors & Master Kind]]
- [[_COMMUNITY_Work-Progress Plan Grid|Work-Progress Plan Grid]]
- [[_COMMUNITY_AI Overview|AI Overview]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 210 edges
2. `withApiHandler()` - 83 edges
3. `Button()` - 82 edges
4. `Role` - 75 edges
5. `ok()` - 64 edges
6. `BadRequestError` - 60 edges
7. `NotFoundError` - 57 edges
8. `customerAccessGuard()` - 54 edges
9. `Badge()` - 44 edges
10. `Card()` - 44 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `AdminPlanDetailPage()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/admin/customers/[userId]/work-progress/[planId]/page.tsx → src/lib/auth-utils.ts
- `TemplateBuilderPage()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/admin/settings/work-progress/templates/[id]/page.tsx → src/lib/auth-utils.ts
- `PromotionCard()` --calls--> `cn()`  [EXTRACTED]
  src/app/customer/PromotionGrid.tsx → src/lib/utils.ts
- `CustomerPlanDetailPage()` --calls--> `requireCustomer()`  [EXTRACTED]
  src/app/customer/[userId]/work-progress/[planId]/page.tsx → src/lib/auth-utils.ts

## Communities (106 total, 7 thin omitted)

### Community 0 - "Documents & Work-Progress UI"
Cohesion: 0.07
Nodes (67): createItemKey(), EditableItem, CreateDocumentDialog(), DialogProps, Props, UploadDocumentDialog(), buildInitialItems(), EditDocumentDialog() (+59 more)

### Community 1 - "Billing & Payment Tables"
Cohesion: 0.06
Nodes (54): BillingCycleTable(), BillingCycleTableProps, STATUS_CONFIG, DocumentItemsEditor(), formatAmount(), Props, SnapshotViewProps, TrafficProgressBar() (+46 more)

### Community 2 - "Users & Auth Persistence"
Cohesion: 0.05
Nodes (42): CustomerProfile, User, idParamsSchema, BcryptPasswordHasher, adminUserSelect, PrismaUserRepository, publicUserSelect, PasswordHasher (+34 more)

### Community 3 - "Shared UI & Customer Search"
Cohesion: 0.05
Nodes (64): CustomerSearchCombobox(), Props, SnapshotView(), useCustomerSearch(), useAssignItem(), AssignItemPopover(), AssignItemPopoverProps, cn() (+56 more)

### Community 4 - "Work-Progress Schemas & Master UC"
Cohesion: 0.05
Nodes (60): ApiData, PlanCtx, bulkDeleteItemsUseCase(), MasterRowDialogProps, createCategoryUseCase(), updateCategoryUseCase(), createMarkTypeUseCase(), updateMarkTypeUseCase() (+52 more)

### Community 5 - "Payments & Calendar UI"
Cohesion: 0.07
Nodes (40): ProofReviewList(), ProofReviewListProps, STATUS_CONFIG, CustomerCalendar(), CustomerCalendarProps, monthView, thTH, useCalendarEvents() (+32 more)

### Community 6 - "Customer API Routes"
Cohesion: 0.04
Nodes (46): bodySchema, paramsSchema, POST, paramsSchema, POST, getCustomerForDocument(), paramsSchema, POST (+38 more)

### Community 7 - "Work-Progress Template Domain"
Cohesion: 0.07
Nodes (35): CategoryCode, MarkCode, PeriodTypeCode, StatusCode, WorkProgressTemplate, WorkProgressTemplateDetail, WorkProgressTemplateItem, WorkProgressTemplateSubtask (+27 more)

### Community 8 - "Work-Progress Plan Repository"
Cohesion: 0.07
Nodes (24): WorkProgressItem, WorkProgressItemPeriodMark, WorkProgressPeriod, WorkProgressPlan, WorkProgressPlanDetail, PrismaWorkProgressRepository, BulkActionToolbarProps, CreatePlanDialogProps (+16 more)

### Community 9 - "WP Template Routes & RoleGuard"
Cohesion: 0.05
Nodes (32): GET, POST, DELETE, paramsSchema, POST, GET, GET, POST (+24 more)

### Community 10 - "Work-Progress Master Data"
Cohesion: 0.07
Nodes (34): WorkProgressCategory, WorkProgressMarkType, WorkProgressStatus, ApiData, kindPath, kindQueryKey, useCreateCategory(), useCreateMarkType() (+26 more)

### Community 11 - "Work-Progress Item Hooks"
Cohesion: 0.06
Nodes (40): useAddItem(), useBulkDeleteItems(), useBulkSetPeriodAcrossItems(), useBulkUpdateItemStatus(), useInvalidatePlan(), useUpdateItem(), useMarkTypes(), useStatuses() (+32 more)

### Community 12 - "Customer Report Metrics Lib"
Cohesion: 0.05
Nodes (46): AuthorityAxis, AuthorityRadarPoint, BRACKET_LABELS, bracketForPos(), BracketTransitionsResult, buildSparkline(), calculateMetricChange(), calculatePercentageChange() (+38 more)

### Community 13 - "Customer Report Charts"
Cohesion: 0.06
Nodes (41): buildChartConfig(), ChartConfigItem, computeKdSuccessRate(), computeTrafficForecast(), groupKeywordsByKd(), KdLevelString, VelocityQuadrant, RecommendKeywordTable() (+33 more)

### Community 14 - "Work-Progress Use Cases"
Cohesion: 0.04
Nodes (45): addItemUseCase(), bulkUpdateItemStatusUseCase(), updateItemUseCase(), bulkSetPeriodAcrossItemsUseCase(), setPeriodMarkUseCase(), deactivateMasterRowUseCase(), listCategoriesUseCase(), listMarkTypesUseCase() (+37 more)

### Community 15 - "Work-Progress Subtasks"
Cohesion: 0.09
Nodes (24): WorkProgressSubtask, PrismaWorkProgressSubtaskRepository, assignItemUseCase(), deleteItemUseCase(), reorderItemsUseCase(), SubtaskListProps, ForbiddenError, clearPeriodMarkUseCase() (+16 more)

### Community 16 - "Customer Report Anomaly Charts"
Cohesion: 0.06
Nodes (26): AnomalyDot(), AnomalyDotProps, ChartEmptyState(), ChartEmptyStateProps, ClippedDot(), ClippedDotProps, SnapshotEntry, MetricSeriesConfig (+18 more)

### Community 17 - "User Management UI"
Cohesion: 0.10
Nodes (30): UserManagement(), UserManagementSeoDev(), UserModal(), UserModalProps, UserTable(), UserTableProps, useToggleKeywordHistoryVisibility(), useToggleMetricsHistoryVisibility() (+22 more)

### Community 18 - "Attachments & File Upload"
Cohesion: 0.08
Nodes (27): addLinkAttachmentUseCase(), deleteAttachmentUseCase(), uploadAttachmentUseCase(), AttachmentKind, WorkProgressAttachment, UPLOAD_CATEGORY, UPLOAD_DIR, LocalWorkProgressAttachmentStorage (+19 more)

### Community 19 - "Metrics Persistence"
Cohesion: 0.10
Nodes (23): MetricsHistoryEntry, OverallMetrics, PrismaMetricsRepository, bulkSetMetricsHistoryVisibility, repo, saveMetrics, setMetricsHistoryVisibility, GET (+15 more)

### Community 20 - "Metrics Types & Hooks"
Cohesion: 0.07
Nodes (32): ApiData, CombinedHistoryData, ApiData, KeywordFormData, VisibilityPayload, ApiData, VisibilityPayload, ApiError (+24 more)

### Community 21 - "Customer Access Context"
Cohesion: 0.10
Nodes (17): customerRepository, resolveCustomerAccess, sessionGateway, CustomerAccessContext, SessionUser, Customer, AccessMode, customerAccessGuard() (+9 more)

### Community 22 - "Billing Documents Public API"
Cohesion: 0.07
Nodes (34): commonDeps, deleteDocument, generateStandaloneDocument, getDocument, listAllDocuments, renderer, repo, searchCustomers() (+26 more)

### Community 23 - "Customer Keyword API Routes"
Cohesion: 0.05
Nodes (31): paramsSchema, POST, GET, paramsSchema, POST, POST, created(), paramsSchema (+23 more)

### Community 24 - "Notifications"
Cohesion: 0.08
Nodes (32): NOTIFICATION_TYPE_GROUPS, NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPES, deleteNotification, emitter, getPreferences, getUnreadCount, listNotifications (+24 more)

### Community 25 - "Admin Pages"
Cohesion: 0.10
Nodes (26): AdminDocumentManager(), AdminDashboard(), PaymentDashboard(), CompanySettingsPage(), metadata, WorkProgressSettingsTabs(), CreateDocumentPage(), metadata (+18 more)

### Community 26 - "Keyword Recommendations"
Cohesion: 0.11
Nodes (22): KeywordRecommend, CreatePayload, PrismaRecommendationRepository, RecommendationRepository, GET, paramsSchema, POST, addRecommendation (+14 more)

### Community 27 - "HTTP Errors & Master Kind"
Cohesion: 0.17
Nodes (11): MasterKind, BadRequestError, ConflictError, HttpError, NotFoundError, UnauthorizedError, UnprocessableEntityError, WorkProgressMasterRepository (+3 more)

### Community 28 - "Work-Progress Plan Grid"
Cohesion: 0.08
Nodes (29): useDeleteItem(), useReorderItems(), useWorkProgressPlan(), PlanGrid(), PERIOD_LABEL, PlanHeaderBar(), PlanHeaderBarProps, AdminPlanDetailPage() (+21 more)

### Community 29 - "AI Overview"
Cohesion: 0.15
Nodes (19): repo, storage, AiOverview, AiOverviewImage, serializeAiOverview(), SerializedAiOverview, SerializedAiOverviewImage, PrismaAiOverviewRepository (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (18): DocumentList(), Props, AdminBillingDocument, BillingDocument, BillingDocumentWithCycle, BillingDocumentType, DOCUMENT_TYPE_PREFIXES, queryKey() (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.10
Nodes (21): CustomerCalendar, CustomerHubClient(), CustomerHubClientProps, CustomerHubHero(), CustomerHubHeroProps, CustomerQuickNav(), CustomerStatsRow(), CustomerStatsRowProps (+13 more)

### Community 32 - "Community 32"
Cohesion: 0.10
Nodes (27): useHistoryContext(), useReportFilters(), CustomerReportData, Bracket, computeDomainPhase(), SankeyNode, KeywordReportTable(), KeywordTrendChart() (+19 more)

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (23): PeriodSelectorProps, ReportFiltersContext, ReportFiltersProvider(), ReportFiltersValue, CHART_COLORS, DOMAIN_METRICS_SERIES, getKeywordColor(), KEYWORD_COLORS (+15 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (20): deleteContractFileUseCase(), listContractFilesUseCase(), uploadContractFileUseCase(), listBillingCyclesUseCase(), updateBillingCycleUseCase(), contractStorage, deleteContractFile, imageStorage (+12 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (21): getCompanySettings, logoStorage, repo, uploadLogo, upsertCompanySettings, GET, PUT, CompanySettingsForm() (+13 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (23): PaymentDashboardProps, isTabValue(), TAB_VALUES, TabValue, WorkProgressSettingsTabsInner(), CustomerPaymentPageProps, MasterTablesShell(), HistoryKeywordsTab() (+15 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (10): PaymentPlanFormProps, BillingCycle, ContractFile, PaymentPlan, PaymentPlanWithCycles, decimalToNumber(), PrismaPaymentRepository, BillingCycleSeed (+2 more)

### Community 38 - "Community 38"
Cohesion: 0.23
Nodes (23): CompanyData, CustomerData, escapeHtml(), FONTS_DIR, formatCurrency(), formatDate(), getFontBold(), getFontRegular() (+15 more)

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (18): DELETE, paramsSchema, PUT, deleteKeyword, getKeywordHistoryByCustomer, repo, updateKeyword, KeywordRepository (+10 more)

### Community 40 - "Community 40"
Cohesion: 0.11
Nodes (26): createPaymentPlan, getPaymentPlan, listPaymentPlans, updatePaymentPlan, GET, paramsSchema, POST, CreatePaymentPlanInput (+18 more)

### Community 41 - "Community 41"
Cohesion: 0.07
Nodes (23): DELETE, paramsSchema, noContent(), handler, idParamsSchema, passwordBodySchema, DELETE, paramsSchema (+15 more)

### Community 42 - "Community 42"
Cohesion: 0.13
Nodes (17): getAdminHubSummary, repo, AdminHubClient(), CustomerOverviewSection(), CustomerOverviewSectionProps, CustomerSummaryCard(), CustomerSummaryCardProps, formatNumber() (+9 more)

### Community 43 - "Community 43"
Cohesion: 0.10
Nodes (20): CustomLinearProgress(), CustomLinearProgressProps, GaugeChart(), GaugeChartProps, MetricChangeIndicator(), MetricChangeIndicatorProps, Trend, trendConfig (+12 more)

### Community 44 - "Community 44"
Cohesion: 0.13
Nodes (19): ContractFileUploadProps, PaymentPlanForm(), ConfirmAction, PaymentPlanListProps, STATUS_BADGE, TYPE_LABEL, useCreatePaymentPlan(), useUpdatePaymentPlan() (+11 more)

### Community 45 - "Community 45"
Cohesion: 0.07
Nodes (22): paramsSchema, POST, bulkSetKeywordHistoryVisibility, setKeywordHistoryVisibility, paramsSchema, PUT, createNotification, approveRejectProof (+14 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (18): ensureUploadDir(), LocalAiOverviewImageStorage, safeUnlink(), UPLOAD_CATEGORY, UPLOAD_DIR, validateAll(), LocalDocumentStorage, buildPublicUrl() (+10 more)

### Community 47 - "Community 47"
Cohesion: 0.11
Nodes (20): MiniSparkline(), MiniSparklineProps, computeCoverageStats(), computeSparklineTopN(), KpiSnapshot, buildDeltaInfo(), DeltaBadge(), DeltaInfo (+12 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (15): parseJsonBody(), parseParams(), parseQuery(), ApiHandlerOptions, HandlerContext, InferSchema, RouteContext, masterIdParamSchema (+7 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (9): actorSelect, PrismaNotificationRepository, toEntity(), CreateNotificationData, ListNotificationsQuery, ListNotificationsResult, NotificationRepository, getUnreadCountUseCase() (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.14
Nodes (18): CustomerPaymentPage(), CustomerDashboard(), metadata, getCustomerReport, getSession(), hasRole(), requireAuth(), requireCustomer() (+10 more)

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (19): ApiData, useAddAiOverview(), useDeleteAiOverview(), useGetAiOverviews(), useUpdateAiOverview(), useGetCustomerReport(), useAddKeyword(), useDeleteKeyword() (+11 more)

### Community 52 - "Community 52"
Cohesion: 0.17
Nodes (14): getCustomerHistoryReport, profileRepo, CustomerHistoryReport, CustomerReportSnapshot, PrismaCustomerProfileRepository, getKeywords, getMetrics, getMetricsHistory (+6 more)

### Community 53 - "Community 53"
Cohesion: 0.14
Nodes (16): HistoryContext, HistoryContextValue, HistoryProvider(), HistoryProviderProps, CurrentKeyword, useGetCombinedHistory(), HistoryButton(), HistoryButtonProps (+8 more)

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (11): PuppeteerPdfRenderer, BillingDocumentRepository, DocumentStorage, PdfRenderer, deleteDocumentUseCase(), generateStandaloneDocumentUseCase(), StandaloneInput, DocumentGenerationDeps (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.23
Nodes (12): ACTIVITY_ACTIONS, ACTIVITY_ENTITIES, WorkProgressActivity, WorkProgressActivityAction, WorkProgressActivityDiff, WorkProgressActivityEntity, PrismaWorkProgressActivityRepository, ActivityListQuery (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (14): ItemDetailSheet(), DashboardHeader(), UserMenu(), Header(), Sheet(), SheetClose(), SheetContent(), SheetDescription() (+6 more)

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (16): buildAllowedSets(), DEFAULT_KINDS, FILE_EXT, FILE_MIME, FileValidationResult, IMAGE_EXT, IMAGE_MIME, sanitizeFilename() (+8 more)

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (15): CustomerNotificationsPanel(), HubNotificationsPanel(), NotificationBell(), NotificationCenter(), NotificationCenterProps, NotificationPreferencesDialog(), ApiData, ApiPaginated (+7 more)

### Community 59 - "Community 59"
Cohesion: 0.15
Nodes (8): BillingCycleStatus, BillingCycleWithPlan, BillingCycleWithProofs, PaymentProof, PaymentProofWithCustomer, ApiData, ApiData, PaymentStatus

### Community 60 - "Community 60"
Cohesion: 0.18
Nodes (4): KeywordHistoryEntry, KeywordReport, PrismaKeywordRepository, KdLevel

### Community 61 - "Community 61"
Cohesion: 0.28
Nodes (8): NotificationPreference, NotificationType, PrismaNotificationPreferenceRepository, toEntity(), NotificationPreferenceRepository, UpsertPreferenceData, PreferenceWithLabel, UpdatePreferencesInput

### Community 62 - "Community 62"
Cohesion: 0.14
Nodes (11): KeywordReportSection(), AiOverviewSection, MetricFieldConfig, MetricSectionConfig, metricSections, MetricsFieldKey, MetricsStep, stepLabels (+3 more)

### Community 63 - "Community 63"
Cohesion: 0.19
Nodes (12): createPlanUseCase(), resolvePeriods(), updatePlanUseCase(), countMonthsInRange(), CustomPeriodInput, generateMonthRangePeriods(), generatePeriods(), generateTemplateMonthSlots() (+4 more)

### Community 64 - "Community 64"
Cohesion: 0.23
Nodes (8): NotificationItem(), NotificationItemProps, Notification, SocketIoNotificationEmitter, NotificationEmitter, getSocketServer(), CreateNotificationInput, createNotificationUseCase()

### Community 65 - "Community 65"
Cohesion: 0.18
Nodes (7): NotificationSocketInit(), KEYS, useNotificationSocket(), metadata, PageProps, TemplateBuilderPage(), DashboardLayoutProps

### Community 66 - "Community 66"
Cohesion: 0.16
Nodes (11): geistSans, inter, kanit, metadata, RootLayout(), viewport, ThemedToastContainer(), Providers() (+3 more)

### Community 67 - "Community 67"
Cohesion: 0.19
Nodes (10): requireStaff(), SeoDashboard(), CardColor, cardColorClass, DashboardCard, DashboardPageLayout(), DashboardPageLayoutProps, metadata (+2 more)

### Community 68 - "Community 68"
Cohesion: 0.32
Nodes (10): SubtaskCtx, useAddSubtask(), useDeleteSubtask(), useInvalidate(), useReorderSubtasks(), useToggleSubtask(), useUpdateSubtask(), ApiData (+2 more)

### Community 69 - "Community 69"
Cohesion: 0.21
Nodes (8): billingCyclesToEvents(), CalendarItemLookup, STATUS_TO_CALENDAR_ID, workProgressPlanToEvents(), ApiData, WorkProgressItemWithMarks, ItemDetailSheetProps, ItemEditDialogProps

### Community 70 - "Community 70"
Cohesion: 0.27
Nodes (6): LocalPaymentImageStorage, UPLOAD_CATEGORY, UPLOAD_DIR, PaymentImageStorage, SavedPaymentImage, uploadPaymentProofUseCase()

### Community 71 - "Community 71"
Cohesion: 0.36
Nodes (6): authOptions, DUMMY_BCRYPT_HASH, getCurrentSession(), requireRole(), requireSession(), handler

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (5): contactInfo, FAQSection(), Footer(), HeroSection(), PackagesSection()

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (7): ApiPaginated, okPaginated(), buildPageInfo(), PageInfo, PageMeta, PageQuery, paginationQuerySchema

### Community 74 - "Community 74"
Cohesion: 0.22
Nodes (7): Accent, accentClass, PromotionCard(), PromotionItem, PROMOTIONS, PromotionImageDialog(), PromotionImageDialogProps

### Community 75 - "Community 75"
Cohesion: 0.22
Nodes (8): listPaymentProofs, uploadPaymentProof, GET, paramsSchema, POST, POST, GET, listUserIdsByRole()

### Community 76 - "Community 76"
Cohesion: 0.24
Nodes (5): faqs, navItems, packages, services, stats

### Community 77 - "Community 77"
Cohesion: 0.31
Nodes (7): ApiData, plansKey(), useArchivePlan(), useDeletePlan(), UsePlansOptions, useWorkProgressPlans(), PlanList()

### Community 78 - "Community 78"
Cohesion: 0.33
Nodes (5): LocalLogoStorage, UPLOAD_CATEGORY, UPLOAD_DIR, LogoStorage, SavedLogo

### Community 79 - "Community 79"
Cohesion: 0.28
Nodes (7): AllDocumentsTable(), queryKey(), useAllDocuments(), useDeleteDocumentAdmin(), ApiSuccess, GenerateStandaloneDocumentInput, ListAllDocumentsQuery

### Community 80 - "Community 80"
Cohesion: 0.31
Nodes (6): calendarTypes, CalendarLegend(), LEGEND_ITEMS, AppColors, colors, colorsDark

### Community 81 - "Community 81"
Cohesion: 0.33
Nodes (6): PaymentPlanStatus, PaymentPlanType, createPaymentPlanUseCase(), clampDay(), generateBillingCycles(), GenerateParams

### Community 82 - "Community 82"
Cohesion: 0.32
Nodes (7): bucketForPosition(), computePositionDistribution(), PositionDistributionResult, BucketConfig, BUCKETS, PositionDistribution(), PositionDistributionProps

### Community 83 - "Community 83"
Cohesion: 0.25
Nodes (7): DELETE, GET, paramsSchema, PATCH, deletePlan, getPlanDetail, updatePlan

### Community 84 - "Community 84"
Cohesion: 0.57
Nodes (6): AttachCtx, useAddLinkAttachment(), useDeleteAttachment(), useInvalidate(), useUploadAttachment(), AttachmentGallery()

### Community 85 - "Community 85"
Cohesion: 0.36
Nodes (5): PromiseToastMessages, showPromiseToast(), ErrorToast(), PendingToast(), SuccessToast()

### Community 86 - "Community 86"
Cohesion: 0.29
Nodes (5): deleteAiOverview, updateAiOverview, paramsSchema, DELETE, PUT

### Community 87 - "Community 87"
Cohesion: 0.38
Nodes (5): PaymentPlanList(), ApiData, useCancelPaymentPlan(), useListPaymentPlans(), useReactivatePaymentPlan()

### Community 88 - "Community 88"
Cohesion: 0.33
Nodes (4): LocalContractFileStorage, UPLOAD_CATEGORY, UPLOAD_DIR, SavedContractFile

### Community 89 - "Community 89"
Cohesion: 0.38
Nodes (6): ContractFileUpload(), MyContractFiles(), ApiData, useDeleteContractFile(), useListContractFiles(), useUploadContractFile()

### Community 90 - "Community 90"
Cohesion: 0.33
Nodes (5): createAiOverview, listAiOverviews, GET, paramsSchema, POST

### Community 91 - "Community 91"
Cohesion: 0.33
Nodes (3): WorkProgressPeriodMarkWithType, MarkCtx, PeriodCellProps

### Community 92 - "Community 92"
Cohesion: 0.60
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 93 - "Community 93"
Cohesion: 0.40
Nodes (4): listDocuments, paramsSchema, querySchema, GET

### Community 94 - "Community 94"
Cohesion: 0.50
Nodes (3): MobileMenuContent(), MobileMenuContentProps, ThemeToggle()

## Knowledge Gaps
- **570 isolated node(s):** `userRole`, `config`, `inter`, `kanit`, `geistSans` (+565 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Shared UI & Customer Search` to `Documents & Work-Progress UI`, `Billing & Payment Tables`, `Payments & Calendar UI`, `Work-Progress Master Data`, `Work-Progress Item Hooks`, `Customer Report Charts`, `Customer Report Anomaly Charts`, `Community 32`, `Community 33`, `Community 36`, `Community 43`, `Community 44`, `Community 47`, `Community 56`, `Community 58`, `Community 62`, `Community 64`, `Community 66`, `Community 67`, `Community 74`, `Community 82`, `Community 92`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `Role` connect `WP Template Routes & RoleGuard` to `Documents & Work-Progress UI`, `Billing & Payment Tables`, `Users & Auth Persistence`, `Shared UI & Customer Search`, `User Management UI`, `Customer Access Context`, `Customer Keyword API Routes`, `HTTP Errors & Master Kind`, `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 41`, `Community 48`, `Community 50`, `Community 53`, `Community 56`, `Community 63`, `Community 67`, `Community 71`, `Community 75`, `Community 94`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `Button()` connect `Payments & Calendar UI` to `Documents & Work-Progress UI`, `Billing & Payment Tables`, `Shared UI & Customer Search`, `Work-Progress Master Data`, `Work-Progress Item Hooks`, `Customer Report Anomaly Charts`, `User Management UI`, `Admin Pages`, `Work-Progress Plan Grid`, `Community 42`, `Community 43`, `Community 44`, `Community 50`, `Community 53`, `Community 56`, `Community 58`, `Community 62`, `Community 64`, `Community 68`, `Community 72`, `Community 74`, `Community 84`, `Community 94`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `userRole`, `config`, `inter` to the rest of the system?**
  _570 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Documents & Work-Progress UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0746896696823059 - nodes in this community are weakly interconnected._
- **Should `Billing & Payment Tables` be split into smaller, more focused modules?**
  _Cohesion score 0.0640218878248974 - nodes in this community are weakly interconnected._
- **Should `Users & Auth Persistence` be split into smaller, more focused modules?**
  _Cohesion score 0.051582278481012656 - nodes in this community are weakly interconnected._