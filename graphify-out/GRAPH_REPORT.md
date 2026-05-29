# Graph Report - src  (2026-05-29)

## Corpus Check
- Large corpus: 644 files · ~126,637 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2821 nodes · 8592 edges · 102 communities (94 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Work-Progress Use Cases|Work-Progress Use Cases]]
- [[_COMMUNITY_File Upload & Storage|File Upload & Storage]]
- [[_COMMUNITY_Work-Progress Schemas|Work-Progress Schemas]]
- [[_COMMUNITY_Billing & Report Tables|Billing & Report Tables]]
- [[_COMMUNITY_Report Filters & History|Report Filters & History]]
- [[_COMMUNITY_User Management Backend|User Management Backend]]
- [[_COMMUNITY_Work-Progress Domain Model|Work-Progress Domain Model]]
- [[_COMMUNITY_UI Menus & Notifications|UI Menus & Notifications]]
- [[_COMMUNITY_Report Dots & Context|Report Dots & Context]]
- [[_COMMUNITY_Customer API Routes|Customer API Routes]]
- [[_COMMUNITY_Work-Progress Forms & Pages|Work-Progress Forms & Pages]]
- [[_COMMUNITY_UI Primitives & Date Picker|UI Primitives & Date Picker]]
- [[_COMMUNITY_Work-Progress API Routes|Work-Progress API Routes]]
- [[_COMMUNITY_Report Charts|Report Charts]]
- [[_COMMUNITY_User & Promotion Dialogs|User & Promotion Dialogs]]
- [[_COMMUNITY_Work-Progress Masters UI|Work-Progress Masters UI]]
- [[_COMMUNITY_Admin Hub Overview|Admin Hub Overview]]
- [[_COMMUNITY_Billing Documents Core|Billing Documents Core]]
- [[_COMMUNITY_Proof Review & Contract Files|Proof Review & Contract Files]]
- [[_COMMUNITY_Payment Plan & Upload UI|Payment Plan & Upload UI]]
- [[_COMMUNITY_Recommendations Feature|Recommendations Feature]]
- [[_COMMUNITY_AI Overview Feature|AI Overview Feature]]
- [[_COMMUNITY_Admin Dashboard Pages|Admin Dashboard Pages]]
- [[_COMMUNITY_Keywords Feature|Keywords Feature]]
- [[_COMMUNITY_Customer Access Control|Customer Access Control]]
- [[_COMMUNITY_Payments Use Cases|Payments Use Cases]]
- [[_COMMUNITY_Work-Progress Item Actions|Work-Progress Item Actions]]
- [[_COMMUNITY_AI Overview API Routes|AI Overview API Routes]]
- [[_COMMUNITY_Billing Customer Info|Billing Customer Info]]
- [[_COMMUNITY_Metrics Feature|Metrics Feature]]
- [[_COMMUNITY_Work-Progress Templates|Work-Progress Templates]]
- [[_COMMUNITY_Customer Sub-Resource Routes|Customer Sub-Resource Routes]]
- [[_COMMUNITY_Billing Document Records|Billing Document Records]]
- [[_COMMUNITY_Notification Types & Prefs|Notification Types & Prefs]]
- [[_COMMUNITY_Settings Tabs & Dashboards|Settings Tabs & Dashboards]]
- [[_COMMUNITY_Metrics Modal State|Metrics Modal State]]
- [[_COMMUNITY_Payment Plan Repository|Payment Plan Repository]]
- [[_COMMUNITY_Document PDF Templates|Document PDF Templates]]
- [[_COMMUNITY_User Management UI|User Management UI]]
- [[_COMMUNITY_Public Home Page|Public Home Page]]
- [[_COMMUNITY_User Hooks & Store|User Hooks & Store]]
- [[_COMMUNITY_Billing Document Generation|Billing Document Generation]]
- [[_COMMUNITY_Report Data Hooks|Report Data Hooks]]
- [[_COMMUNITY_Layout Headers & Mobile Menu|Layout Headers & Mobile Menu]]
- [[_COMMUNITY_Report Overview & Sparklines|Report Overview & Sparklines]]
- [[_COMMUNITY_Work-Progress API + Handler|Work-Progress API + Handler]]
- [[_COMMUNITY_Payment Plan Schemas|Payment Plan Schemas]]
- [[_COMMUNITY_Customer Resource Routes|Customer Resource Routes]]
- [[_COMMUNITY_Customer Calendar|Customer Calendar]]
- [[_COMMUNITY_Company Settings Feature|Company Settings Feature]]
- [[_COMMUNITY_Work-Progress Activity Log|Work-Progress Activity Log]]
- [[_COMMUNITY_Report Page & Tabs|Report Page & Tabs]]
- [[_COMMUNITY_History Context & Hooks|History Context & Hooks]]
- [[_COMMUNITY_Customer Pages & Auth|Customer Pages & Auth]]
- [[_COMMUNITY_Customer Hub UI|Customer Hub UI]]
- [[_COMMUNITY_Work-Progress Pages|Work-Progress Pages]]
- [[_COMMUNITY_Gauge & Progress Charts|Gauge & Progress Charts]]
- [[_COMMUNITY_Work-Progress Plan Hooks|Work-Progress Plan Hooks]]
- [[_COMMUNITY_Customer Search & Pagination|Customer Search & Pagination]]
- [[_COMMUNITY_Customer History Report|Customer History Report]]
- [[_COMMUNITY_Notification Use Cases|Notification Use Cases]]
- [[_COMMUNITY_Work-Progress Subtasks|Work-Progress Subtasks]]
- [[_COMMUNITY_Notification Socket|Notification Socket]]
- [[_COMMUNITY_Customer Hub Summary|Customer Hub Summary]]
- [[_COMMUNITY_Admin Hub Summary|Admin Hub Summary]]
- [[_COMMUNITY_Calendar Event Mapping|Calendar Event Mapping]]
- [[_COMMUNITY_Notification Repository|Notification Repository]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_SEO Dashboard Layout|SEO Dashboard Layout]]
- [[_COMMUNITY_Payment Proof Domain|Payment Proof Domain]]
- [[_COMMUNITY_Notification Preferences|Notification Preferences]]
- [[_COMMUNITY_Work-Progress Attachments|Work-Progress Attachments]]
- [[_COMMUNITY_Prisma Client & Profile Repo|Prisma Client & Profile Repo]]
- [[_COMMUNITY_Subtask Actions Hooks|Subtask Actions Hooks]]
- [[_COMMUNITY_Payment Proof Upload|Payment Proof Upload]]
- [[_COMMUNITY_Auth & Session|Auth & Session]]
- [[_COMMUNITY_Period Selector Toggle|Period Selector Toggle]]
- [[_COMMUNITY_Keyword Repository|Keyword Repository]]
- [[_COMMUNITY_Company Settings UI|Company Settings UI]]
- [[_COMMUNITY_Attachment Gallery|Attachment Gallery]]
- [[_COMMUNITY_Billing Cycle Generation|Billing Cycle Generation]]
- [[_COMMUNITY_Payment Proof API|Payment Proof API]]
- [[_COMMUNITY_Document List UI|Document List UI]]
- [[_COMMUNITY_Toast Components|Toast Components]]
- [[_COMMUNITY_Work-Progress Plan API|Work-Progress Plan API]]
- [[_COMMUNITY_Payment Plan API|Payment Plan API]]
- [[_COMMUNITY_Contract Files API|Contract Files API]]
- [[_COMMUNITY_Document List API|Document List API]]
- [[_COMMUNITY_Metrics API|Metrics API]]
- [[_COMMUNITY_Document Local Storage|Document Local Storage]]
- [[_COMMUNITY_Item Detail Types|Item Detail Types]]
- [[_COMMUNITY_Tab Panel|Tab Panel]]
- [[_COMMUNITY_Common API Types|Common API Types]]
- [[_COMMUNITY_User API PUT|User API PUT]]
- [[_COMMUNITY_User API PATCH|User API PATCH]]
- [[_COMMUNITY_User API PUT 2|User API PUT 2]]
- [[_COMMUNITY_User API PATCH 2|User API PATCH 2]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 212 edges
2. `Button()` - 85 edges
3. `withApiHandler()` - 85 edges
4. `Role` - 76 edges
5. `ok()` - 65 edges
6. `BadRequestError` - 61 edges
7. `NotFoundError` - 58 edges
8. `customerAccessGuard()` - 55 edges
9. `Badge()` - 45 edges
10. `Card()` - 44 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `AdminPlanDetailPage()` --calls--> `requireAdmin()`  [EXTRACTED]
  app/admin/customers/[userId]/work-progress/[planId]/page.tsx → lib/auth-utils.ts
- `PromotionCard()` --calls--> `cn()`  [EXTRACTED]
  app/customer/PromotionGrid.tsx → lib/utils.ts
- `CustomerPlanDetailPage()` --calls--> `requireCustomer()`  [EXTRACTED]
  app/customer/[userId]/work-progress/[planId]/page.tsx → lib/auth-utils.ts
- `SeoPlanDetailPage()` --calls--> `requireStaff()`  [EXTRACTED]
  app/seo/customers/[userId]/work-progress/[planId]/page.tsx → lib/auth-utils.ts

## Communities (102 total, 8 thin omitted)

### Community 0 - "Work-Progress Use Cases"
Cohesion: 0.04
Nodes (67): addLinkAttachmentUseCase(), MasterKind, addItemUseCase(), assignItemUseCase(), bulkDeleteItemsUseCase(), bulkUpdateItemStatusUseCase(), deleteItemUseCase(), reorderItemsUseCase() (+59 more)

### Community 1 - "File Upload & Storage"
Cohesion: 0.04
Nodes (61): deleteAttachmentUseCase(), uploadAttachmentUseCase(), ensureUploadDir(), LocalAiOverviewImageStorage, safeUnlink(), UPLOAD_CATEGORY, UPLOAD_DIR, validateAll() (+53 more)

### Community 2 - "Work-Progress Schemas"
Cohesion: 0.04
Nodes (68): ApiData, PlanCtx, MasterRowDialogProps, createCategoryUseCase(), updateCategoryUseCase(), createMarkTypeUseCase(), updateMarkTypeUseCase(), createStatusUseCase() (+60 more)

### Community 3 - "Billing & Report Tables"
Cohesion: 0.07
Nodes (49): BillingCycleTable(), BillingCycleTableProps, STATUS_CONFIG, Props, MetricChangeIndicator(), MetricChangeIndicatorProps, Trend, trendConfig (+41 more)

### Community 4 - "Report Filters & History"
Cohesion: 0.04
Nodes (66): PeriodSelectorProps, ReportFiltersValue, PeriodOption, AuthorityAxis, AuthorityRadarPoint, BRACKET_LABELS, bracketForPos(), BracketTransitionsResult (+58 more)

### Community 5 - "User Management Backend"
Cohesion: 0.05
Nodes (40): DELETE, GET, PUT, CustomerProfile, User, idParamsSchema, BcryptPasswordHasher, adminUserSelect (+32 more)

### Community 6 - "Work-Progress Domain Model"
Cohesion: 0.06
Nodes (36): WorkProgressItem, WorkProgressItemPeriodMark, WorkProgressPeriod, WorkProgressPlan, WorkProgressPlanDetail, PrismaWorkProgressRepository, BulkActionToolbarProps, createPlanUseCase() (+28 more)

### Community 7 - "UI Menus & Notifications"
Cohesion: 0.06
Nodes (56): Props, NotificationCenterProps, NotificationItem(), SnapshotView(), useAssignItem(), AssignItemPopover(), AssignItemPopoverProps, UserMenu() (+48 more)

### Community 8 - "Report Dots & Context"
Cohesion: 0.05
Nodes (43): AnomalyDot(), AnomalyDotProps, ClippedDot(), ClippedDotProps, SnapshotEntry, useHistoryContext(), ReportFiltersContext, useReportFilters() (+35 more)

### Community 9 - "Customer API Routes"
Cohesion: 0.04
Nodes (49): GET, paramsSchema, GET, paramsSchema, paramsSchema, POST, GET, paramsSchema (+41 more)

### Community 10 - "Work-Progress Forms & Pages"
Cohesion: 0.07
Nodes (51): FieldError(), FieldErrors, parseFieldErrors(), useAddItem(), useBulkDeleteItems(), useBulkSetPeriodAcrossItems(), useBulkUpdateItemStatus(), useInvalidatePlan() (+43 more)

### Community 11 - "UI Primitives & Date Picker"
Cohesion: 0.10
Nodes (35): useDeactivateMaster(), useMarkTypes(), useClearPeriodMark(), useSetPeriodMark(), ColorPickerInput(), ColorPickerInputProps, empty, FormState (+27 more)

### Community 12 - "Work-Progress API Routes"
Cohesion: 0.05
Nodes (35): GET, GET, GET, POST, POST, DELETE, GET, PATCH (+27 more)

### Community 13 - "Report Charts"
Cohesion: 0.06
Nodes (43): ChartEmptyState(), ChartEmptyStateProps, buildChartConfig(), ChartConfigItem, KEYWORD_COLORS, computeKdSuccessRate(), computeTrafficContribution(), groupKeywordsByKd() (+35 more)

### Community 14 - "User & Promotion Dialogs"
Cohesion: 0.06
Nodes (37): AllDocumentsTable(), NotificationPreferencesDialogProps, Accent, accentClass, PromotionCard(), PromotionItem, PROMOTIONS, PromotionImageDialog() (+29 more)

### Community 15 - "Work-Progress Masters UI"
Cohesion: 0.06
Nodes (32): WorkProgressCategory, WorkProgressMarkType, WorkProgressStatus, WorkProgressPeriodMarkWithType, ApiData, kindPath, kindQueryKey, useCreateCategory() (+24 more)

### Community 16 - "Admin Hub Overview"
Cohesion: 0.09
Nodes (34): AdminHubClient(), CustomerNotificationsPanel(), CustomerOverviewSection(), CustomerOverviewSectionProps, CustomerQuickNavProps, CustomerSummaryCard(), CustomerSummaryCardProps, formatNumber() (+26 more)

### Community 17 - "Billing Documents Core"
Cohesion: 0.07
Nodes (39): commonDeps, deleteDocument, generateStandaloneDocument, getDocument, listAllDocuments, renderer, repo, searchCustomers() (+31 more)

### Community 18 - "Proof Review & Contract Files"
Cohesion: 0.08
Nodes (32): ProofReviewList(), ProofReviewListProps, STATUS_CONFIG, MyContractFilesProps, MyPaymentHistory(), MyPaymentHistoryProps, STATUS_CONFIG, useApproveRejectProof() (+24 more)

### Community 19 - "Payment Plan & Upload UI"
Cohesion: 0.09
Nodes (31): ContractFileUpload(), ContractFileUploadProps, Props, PaymentPlanForm(), ConfirmAction, PaymentPlanList(), PaymentPlanListProps, STATUS_BADGE (+23 more)

### Community 20 - "Recommendations Feature"
Cohesion: 0.10
Nodes (23): KeywordRecommend, CreatePayload, PrismaRecommendationRepository, RecommendationRepository, GET, paramsSchema, POST, addRecommendation (+15 more)

### Community 21 - "AI Overview Feature"
Cohesion: 0.12
Nodes (24): deleteAiOverview, repo, storage, updateAiOverview, DELETE, PUT, AiOverview, AiOverviewImage (+16 more)

### Community 22 - "Admin Dashboard Pages"
Cohesion: 0.10
Nodes (28): AdminDocumentManager(), AdminDashboard(), PaymentDashboard(), AdminDocumentsPage(), metadata, metadata, PageProps, metadata (+20 more)

### Community 23 - "Keywords Feature"
Cohesion: 0.10
Nodes (26): paramsSchema, PATCH, KeywordHistoryEntry, DELETE, paramsSchema, PUT, addKeyword, bulkSetKeywordHistoryVisibility (+18 more)

### Community 24 - "Customer Access Control"
Cohesion: 0.11
Nodes (16): customerRepository, resolveCustomerAccess, sessionGateway, CustomerAccessContext, SessionUser, Customer, customerAccessGuard(), NextAuthSessionGateway (+8 more)

### Community 25 - "Payments Use Cases"
Cohesion: 0.11
Nodes (22): deleteContractFileUseCase(), listContractFilesUseCase(), uploadContractFileUseCase(), listBillingCyclesUseCase(), updateBillingCycleUseCase(), LocalContractFileStorage, contractStorage, deleteContractFile (+14 more)

### Community 26 - "Work-Progress Item Actions"
Cohesion: 0.22
Nodes (10): BadRequestError, ForbiddenError, NotFoundError, assertAssigneeAllowed(), AssigneeInfo, AssigneeLookup, WorkProgressActivityRepository, WorkProgressRepository (+2 more)

### Community 27 - "AI Overview API Routes"
Cohesion: 0.05
Nodes (30): createAiOverview, listAiOverviews, GET, paramsSchema, POST, POST, POST, paramsSchema (+22 more)

### Community 28 - "Billing Customer Info"
Cohesion: 0.10
Nodes (32): customerInfoFromSnapshot(), CustomerInfoValue, DbCustomerSnapshot, emptyCustomerInfo, hasCustomerInfoDiff(), toCustomerInfoInput(), CustomerInfoFields(), Props (+24 more)

### Community 29 - "Metrics Feature"
Cohesion: 0.12
Nodes (19): paramsSchema, PATCH, MetricsHistoryEntry, OverallMetrics, PrismaMetricsRepository, bulkSetMetricsHistoryVisibility, repo, setMetricsHistoryVisibility (+11 more)

### Community 30 - "Work-Progress Templates"
Cohesion: 0.13
Nodes (15): CategoryCode, MarkCode, PeriodTypeCode, StatusCode, WorkProgressTemplate, WorkProgressTemplateDetail, WorkProgressTemplateItem, WorkProgressTemplateSubtask (+7 more)

### Community 31 - "Customer Sub-Resource Routes"
Cohesion: 0.06
Nodes (26): paramsSchema, POST, DELETE, DELETE, paramsSchema, PATCH, DELETE, paramsSchema (+18 more)

### Community 32 - "Billing Document Records"
Cohesion: 0.12
Nodes (16): Props, AdminBillingDocument, BillingDocument, BillingDocumentWithCycle, DocumentLineItem, customerForDocumentSelect, PrismaBillingDocumentRepository, toBillingDocument() (+8 more)

### Community 33 - "Notification Types & Prefs"
Cohesion: 0.10
Nodes (28): NOTIFICATION_TYPE_GROUPS, NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPES, NotificationType, deleteNotification, emitter, getPreferences, getUnreadCount (+20 more)

### Community 34 - "Settings Tabs & Dashboards"
Cohesion: 0.12
Nodes (25): PaymentDashboardProps, isTabValue(), TAB_VALUES, TabValue, WorkProgressSettingsTabsInner(), CustomerPaymentPageProps, listKey(), useDeleteTemplate() (+17 more)

### Community 35 - "Metrics Modal State"
Cohesion: 0.09
Nodes (26): initialState, metricsSlice, MetricsState, AiOverviewSectionProps, KeywordReportSectionProps, MetricsModalProps, RecommendKeywordSectionProps, AiOverviewCardProps (+18 more)

### Community 36 - "Payment Plan Repository"
Cohesion: 0.12
Nodes (10): PaymentPlanFormProps, BillingCycle, ContractFile, PaymentPlan, PaymentPlanWithCycles, decimalToNumber(), PrismaPaymentRepository, BillingCycleSeed (+2 more)

### Community 37 - "Document PDF Templates"
Cohesion: 0.23
Nodes (23): CompanyData, CustomerData, escapeHtml(), FONTS_DIR, formatCurrency(), formatDate(), getFontBold(), getFontRegular() (+15 more)

### Community 38 - "User Management UI"
Cohesion: 0.11
Nodes (20): UserManagement(), UserManagementSeoDev(), UserModal(), ActionTooltipButton(), UserTable(), UserTableProps, useToggleKeywordHistoryVisibility(), useToggleMetricsHistoryVisibility() (+12 more)

### Community 39 - "Public Home Page"
Cohesion: 0.10
Nodes (16): contactInfo, faqs, navItems, packages, services, stats, FAQSection(), Footer() (+8 more)

### Community 40 - "User Hooks & Store"
Cohesion: 0.16
Nodes (19): UserModalProps, ApiData, useAddUser(), useDeleteUser(), useRestoreUser(), useUpdatePassword(), useUpdateUser(), useAppDispatch() (+11 more)

### Community 41 - "Billing Document Generation"
Cohesion: 0.14
Nodes (16): BillingDocumentType, DOCUMENT_TYPE_PREFIXES, PuppeteerPdfRenderer, getNextDocumentNumber(), TransactionClient, BillingDocumentRepository, DocumentStorage, PdfRenderer (+8 more)

### Community 42 - "Report Data Hooks"
Cohesion: 0.20
Nodes (22): ApiData, useAddAiOverview(), useDeleteAiOverview(), useGetAiOverviews(), useUpdateAiOverview(), useGetCustomerReport(), ApiData, KeywordFormData (+14 more)

### Community 43 - "Layout Headers & Mobile Menu"
Cohesion: 0.16
Nodes (18): NotificationBell(), ItemDetailSheet(), DashboardHeader(), HistoryButton(), MobileMenuContent(), MobileMenuContentProps, ThemeToggle(), Header() (+10 more)

### Community 44 - "Report Overview & Sparklines"
Cohesion: 0.11
Nodes (20): MiniSparkline(), MiniSparklineProps, computeCoverageStats(), computeSparklineTopN(), KpiSnapshot, buildDeltaInfo(), DeltaBadge(), DeltaInfo (+12 more)

### Community 45 - "Work-Progress API + Handler"
Cohesion: 0.14
Nodes (16): POST, PATCH, POST, PATCH, POST, PATCH, AccessMode, parseJsonBody() (+8 more)

### Community 46 - "Payment Plan Schemas"
Cohesion: 0.14
Nodes (21): createPaymentPlan, listPaymentPlans, GET, paramsSchema, POST, CreatePaymentPlanInput, createPaymentPlanSchema, ListBillingCyclesQuery (+13 more)

### Community 47 - "Customer Resource Routes"
Cohesion: 0.09
Nodes (18): DELETE, paramsSchema, PATCH, paramsSchema, POST, paramsSchema, PUT, createNotification (+10 more)

### Community 48 - "Customer Calendar"
Cohesion: 0.13
Nodes (17): calendarTypes, CalendarLegend(), LEGEND_ITEMS, CustomerCalendar(), CustomerCalendarProps, monthView, thTH, useCalendarEvents() (+9 more)

### Community 49 - "Company Settings Feature"
Cohesion: 0.19
Nodes (12): getCompanySettings, logoStorage, repo, uploadLogo, upsertCompanySettings, CompanySettings, PrismaCompanySettingsRepository, CompanySettingsInput (+4 more)

### Community 50 - "Work-Progress Activity Log"
Cohesion: 0.16
Nodes (14): ACTIVITY_ACTIONS, ACTIVITY_ENTITIES, WorkProgressActivity, WorkProgressActivityAction, WorkProgressActivityDiff, WorkProgressActivityEntity, ApiData, UseDashboardSummaryOptions (+6 more)

### Community 51 - "Report Page & Tabs"
Cohesion: 0.13
Nodes (18): ReportFiltersProvider(), CustomerReportData, RecommendKeywordTable(), isTabValue(), ReportPage(), ReportPageProps, ReportTabs(), TAB_VALUES (+10 more)

### Community 52 - "History Context & Hooks"
Cohesion: 0.15
Nodes (16): HistoryContext, HistoryContextValue, HistoryProviderProps, ApiData, CombinedHistoryData, CurrentKeyword, ApiData, VisibilityPayload (+8 more)

### Community 53 - "Customer Pages & Auth"
Cohesion: 0.15
Nodes (17): metadata, PageProps, metadata, PageProps, CustomerPaymentPage(), CustomerDashboard(), getCustomerReport, getSession() (+9 more)

### Community 54 - "Customer Hub UI"
Cohesion: 0.12
Nodes (14): CustomerCalendar, CustomerHubClient(), CustomerHubClientProps, CustomerHubHero(), CustomerHubHeroProps, CustomerQuickNav(), CustomerStatsRow(), stats (+6 more)

### Community 55 - "Work-Progress Pages"
Cohesion: 0.13
Nodes (16): metadata, PageProps, metadata, PageProps, metadata, PageProps, useDeleteItem(), useReorderItems() (+8 more)

### Community 56 - "Gauge & Progress Charts"
Cohesion: 0.16
Nodes (12): CustomLinearProgress(), CustomLinearProgressProps, GaugeChart(), GaugeChartProps, HistoryProvider(), useGetCombinedHistory(), formatDuration(), getAgeColor() (+4 more)

### Community 57 - "Work-Progress Plan Hooks"
Cohesion: 0.16
Nodes (13): ApiData, plansKey(), useDeletePlan(), UsePlansOptions, useUpdatePlan(), useWorkProgressPlans(), EditPlanDialog(), EmptyPlansState() (+5 more)

### Community 58 - "Customer Search & Pagination"
Cohesion: 0.17
Nodes (12): CustomerSearchCombobox(), queryKey(), useAllDocuments(), useCustomerSearch(), ApiPaginated, ApiSuccess, okPaginated(), buildPageInfo() (+4 more)

### Community 59 - "Customer History Report"
Cohesion: 0.21
Nodes (12): GET, paramsSchema, getCustomerHistoryReport, profileRepo, CustomerHistoryReport, CustomerReportSnapshot, KeywordReport, getKeywordHistoryByCustomer (+4 more)

### Community 60 - "Notification Use Cases"
Cohesion: 0.17
Nodes (9): NotificationRepository, CreateNotificationInput, createNotificationUseCase(), deleteNotificationUseCase(), getUnreadCountUseCase(), ListNotificationsInput, listNotificationsUseCase(), markAllAsReadUseCase() (+1 more)

### Community 61 - "Work-Progress Subtasks"
Cohesion: 0.24
Nodes (5): WorkProgressSubtask, PrismaWorkProgressSubtaskRepository, SubtaskListProps, AddSubtaskData, UpdateSubtaskData

### Community 62 - "Notification Socket"
Cohesion: 0.24
Nodes (8): NotificationItemProps, NotificationSocketInit(), Notification, KEYS, useNotificationSocket(), SocketIoNotificationEmitter, NotificationEmitter, getSocketServer()

### Community 63 - "Customer Hub Summary"
Cohesion: 0.29
Nodes (7): CustomerStatsRowProps, getCustomerHubSummary, repo, CustomerHubSummary, PrismaCustomerHubRepository, CustomerHubRepository, getCustomerHubSummaryUseCase()

### Community 64 - "Admin Hub Summary"
Cohesion: 0.30
Nodes (6): getAdminHubSummary, repo, AdminHubSummary, PrismaAdminHubRepository, AdminHubRepository, getAdminHubSummaryUseCase()

### Community 65 - "Calendar Event Mapping"
Cohesion: 0.19
Nodes (7): billingCyclesToEvents(), CalendarItemLookup, STATUS_TO_CALENDAR_ID, workProgressPlanToEvents(), ApiData, BillingCycleWithPlan, ApiData

### Community 66 - "Notification Repository"
Cohesion: 0.20
Nodes (6): actorSelect, PrismaNotificationRepository, toEntity(), CreateNotificationData, ListNotificationsQuery, ListNotificationsResult

### Community 67 - "Root Layout & Fonts"
Cohesion: 0.16
Nodes (11): geistSans, inter, kanit, metadata, RootLayout(), viewport, ThemedToastContainer(), Providers() (+3 more)

### Community 68 - "SEO Dashboard Layout"
Cohesion: 0.19
Nodes (10): metadata, PageProps, requireStaff(), SeoDashboard(), CardColor, cardColorClass, DashboardCard, DashboardPageLayout() (+2 more)

### Community 69 - "Payment Proof Domain"
Cohesion: 0.22
Nodes (6): BillingCycleStatus, BillingCycleWithProofs, PaymentProof, PaymentProofWithCustomer, ApiData, PaymentStatus

### Community 70 - "Notification Preferences"
Cohesion: 0.29
Nodes (7): NotificationPreference, PrismaNotificationPreferenceRepository, toEntity(), NotificationPreferenceRepository, UpsertPreferenceData, UpdatePreferencesInput, updatePreferencesUseCase()

### Community 71 - "Work-Progress Attachments"
Cohesion: 0.36
Nodes (5): AttachmentKind, WorkProgressAttachment, PrismaWorkProgressAttachmentRepository, toDomain(), CreateAttachmentData

### Community 72 - "Prisma Client & Profile Repo"
Cohesion: 0.30
Nodes (6): PrismaCustomerProfileRepository, CustomerProfile, CustomerProfileRepository, globalForPrisma, prisma, prismaBase

### Community 73 - "Subtask Actions Hooks"
Cohesion: 0.40
Nodes (9): SubtaskCtx, useAddSubtask(), useDeleteSubtask(), useInvalidate(), useReorderSubtasks(), useToggleSubtask(), useUpdateSubtask(), planDetailKey() (+1 more)

### Community 74 - "Payment Proof Upload"
Cohesion: 0.27
Nodes (6): LocalPaymentImageStorage, UPLOAD_CATEGORY, UPLOAD_DIR, PaymentImageStorage, SavedPaymentImage, uploadPaymentProofUseCase()

### Community 75 - "Auth & Session"
Cohesion: 0.36
Nodes (6): authOptions, DUMMY_BCRYPT_HASH, getCurrentSession(), requireRole(), requireSession(), handler

### Community 76 - "Period Selector Toggle"
Cohesion: 0.31
Nodes (6): PERIOD_OPTIONS, ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 78 - "Company Settings UI"
Cohesion: 0.31
Nodes (7): CompanySettingsForm(), QUERY_KEY, useGetCompanySettings(), useUploadLogo(), useUpsertCompanySettings(), CompanySettingsFormInput, companySettingsSchema

### Community 79 - "Attachment Gallery"
Cohesion: 0.47
Nodes (7): AttachCtx, useAddLinkAttachment(), useDeleteAttachment(), useInvalidate(), useUploadAttachment(), AttachmentGallery(), AttachmentGalleryProps

### Community 80 - "Billing Cycle Generation"
Cohesion: 0.33
Nodes (6): PaymentPlanStatus, PaymentPlanType, createPaymentPlanUseCase(), clampDay(), generateBillingCycles(), GenerateParams

### Community 81 - "Payment Proof API"
Cohesion: 0.25
Nodes (7): POST, listPaymentProofs, uploadPaymentProof, GET, paramsSchema, POST, GET

### Community 82 - "Document List UI"
Cohesion: 0.36
Nodes (7): DocumentList(), formatCurrency(), ImportDocumentDialog(), queryKey(), useAssignDocumentCycle(), useDeleteDocument(), useListDocuments()

### Community 83 - "Toast Components"
Cohesion: 0.36
Nodes (5): PromiseToastMessages, showPromiseToast(), ErrorToast(), PendingToast(), SuccessToast()

### Community 84 - "Work-Progress Plan API"
Cohesion: 0.25
Nodes (7): GET, paramsSchema, PATCH, DELETE, deletePlan, getPlanDetail, updatePlan

### Community 85 - "Payment Plan API"
Cohesion: 0.33
Nodes (5): GET, paramsSchema, PATCH, getPaymentPlan, updatePaymentPlan

### Community 86 - "Contract Files API"
Cohesion: 0.33
Nodes (5): GET, paramsSchema, POST, listContractFiles, uploadContractFile

### Community 87 - "Document List API"
Cohesion: 0.40
Nodes (4): GET, listDocuments, paramsSchema, querySchema

### Community 88 - "Metrics API"
Cohesion: 0.40
Nodes (4): saveMetrics, GET, paramsSchema, POST

### Community 91 - "Item Detail Types"
Cohesion: 0.67
Nodes (3): WorkProgressItemWithMarks, ItemDetailSheetProps, ItemEditDialogProps

## Knowledge Gaps
- **577 isolated node(s):** `userRole`, `config`, `inter`, `kanit`, `geistSans` (+572 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Menus & Notifications` to `Billing & Report Tables`, `Report Filters & History`, `Report Dots & Context`, `Work-Progress Forms & Pages`, `UI Primitives & Date Picker`, `Report Charts`, `User & Promotion Dialogs`, `Work-Progress Masters UI`, `Admin Hub Overview`, `Proof Review & Contract Files`, `Payment Plan & Upload UI`, `Billing Customer Info`, `Settings Tabs & Dashboards`, `User Management UI`, `Public Home Page`, `Layout Headers & Mobile Menu`, `Report Overview & Sparklines`, `Customer Calendar`, `Root Layout & Fonts`, `SEO Dashboard Layout`, `Period Selector Toggle`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `Role` connect `Work-Progress API Routes` to `Billing & Report Tables`, `User Management Backend`, `Work-Progress Domain Model`, `UI Primitives & Date Picker`, `Customer Access Control`, `Payments Use Cases`, `Work-Progress Item Actions`, `AI Overview API Routes`, `Customer Sub-Resource Routes`, `Payment Plan Repository`, `User Management UI`, `User Hooks & Store`, `Layout Headers & Mobile Menu`, `Work-Progress API + Handler`, `Report Page & Tabs`, `Customer Pages & Auth`, `SEO Dashboard Layout`, `Auth & Session`, `Payment Proof API`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `Button()` connect `UI Primitives & Date Picker` to `Billing & Report Tables`, `UI Menus & Notifications`, `Report Dots & Context`, `Work-Progress Forms & Pages`, `User & Promotion Dialogs`, `Work-Progress Masters UI`, `Admin Hub Overview`, `Proof Review & Contract Files`, `Payment Plan & Upload UI`, `Admin Dashboard Pages`, `Billing Customer Info`, `Settings Tabs & Dashboards`, `User Management UI`, `Public Home Page`, `Layout Headers & Mobile Menu`, `Customer Pages & Auth`, `Gauge & Progress Charts`, `Work-Progress Plan Hooks`, `Subtask Actions Hooks`, `Attachment Gallery`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `userRole`, `config`, `inter` to the rest of the system?**
  _577 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Work-Progress Use Cases` be split into smaller, more focused modules?**
  _Cohesion score 0.035527690700104496 - nodes in this community are weakly interconnected._
- **Should `File Upload & Storage` be split into smaller, more focused modules?**
  _Cohesion score 0.044257703081232495 - nodes in this community are weakly interconnected._
- **Should `Work-Progress Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.04396266184884071 - nodes in this community are weakly interconnected._