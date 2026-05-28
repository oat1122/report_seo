# Feature: Work Progress — Final Plan (v4 · Phased + Rules/Skills aligned)

> สถานะ: Final Draft (ยังไม่ implement)
> ผู้ออกแบบ: Claude (Opus 4.7)
> วันที่: 2026-05-22
> Source: [`SEO_Work_Progress_2026_12Months - Sheet1.csv`](../../SEO_Work_Progress_2026_12Months%20-%20Sheet1.csv)
>
> Version history: **v1** fixed enum → **v2** flexible + master tables → **v3** phased delivery → **v4 (this)** aligned ครบทั้ง 9 rules + 8 skills

---

## 0. Compliance Compass (อ่านก่อนเริ่มทุก Phase)

### 0.1 Rules ที่ใช้ (ทั้งหมด)

| #   | Rule                                                               | จุดสำคัญใน plan นี้                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | [Security](../../.claude/rules/01-security.md)                     | ทุก customer route ผ่าน `customerAccessGuard` · master/template route ผ่าน `requireRole(["ADMIN"])` · Zod validate ทุก boundary · `validateUploadFile` สำหรับ attachment · error shape `{ error: "..." }` · ไม่ trust `userId` จาก client |
| 02  | [Structure](../../.claude/rules/02-structure.md)                   | 1 feature = 1 slice ใต้ `features/work-progress/` · use case file `verb-noun.ts` · component `PascalCase.tsx` · hook `useXxx.ts` · API 1 resource = 1 folder                                                                              |
| 03  | [Clean Code](../../.claude/rules/03-clean-code.md)                 | TS strict no-`any` · type via `z.infer` > `Prisma.*GetPayload` > hand-rolled · ห้ามคอมเมนต์ WHAT · ใช้ Error class จาก `@/lib/errors`                                                                                                     |
| 04  | [Performance](../../.claude/rules/04-performance.md)               | Server Component default · `"use client"` ที่ leaf · React Query `staleTime` 60s · virtualize plan grid ที่ > 100 rows · debounce inline edit                                                                                             |
| 05  | [Load Speed](../../.claude/rules/05-load-speed.md)                 | named import เสมอ · `lazy()` chart + xlsx export · pagination activity log · ตรวจ bundlephobia ก่อน add lib                                                                                                                               |
| 06  | [UI Library](../../.claude/rules/06-ui-library.md)                 | shadcn + react-charts เท่านั้น · ห้าม MUI ใหม่ · ใช้ `lucide-react` named import · ใช้ `cn()` helper                                                                                                                                      |
| 07  | [Reusability](../../.claude/rules/07-reusability.md)               | Rule of Three · ค้นของเดิมก่อน extract · ใช้ `withApiHandler` / `customerAccessGuard` / `ok`/`created`/`noContent` · ใช้ Zod schema ของ feature ไม่ duplicate                                                                             |
| 08  | [Colors](../../.claude/rules/08-colors.md)                         | สีจาก `src/theme/theme.ts` เท่านั้น · master `color` field → CSS variable inline ไม่ Tailwind hardcode                                                                                                                                    |
| 09  | [Clean Architecture](../../.claude/rules/09-clean-architecture.md) | 4 layer ครบทุก phase · `domain/` pure TS (ห้าม import Prisma แม้ enum) · `application/` ผ่าน port · route handler บางเฉียบ                                                                                                                |

### 0.2 Skills — Invocation schedule

ก่อนเริ่มแต่ละ phase ให้ invoke skill ที่ตรง trigger (ตาม [CLAUDE.md § Skills](../../CLAUDE.md))

| Phase                 | Skills ที่ต้อง invoke                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Foundation        | `clean-architecture-nextjs` · `api-foundation` (route + Zod + withApiHandler) · `clean-reusable-code` (extract use case, port)        |
| 2 — Template System   | `clean-architecture-nextjs` · `api-foundation` · `clean-reusable-code`                                                                |
| 3 — Rich Items        | `api-foundation` · `clean-reusable-code`                                                                                              |
| 4 — Audit & Insights  | `data-analysis` (weighted aggregate, time-series summary) · `clean-reusable-code`                                                     |
| 5 — UI Admin/SEO      | `dashboard-uxui-design` (information arch, persona view) · `shadcn-ui` · `report-charts` (KPI + period chart) · `clean-reusable-code` |
| 6 — Customer + Polish | `dashboard-uxui-design` · `shadcn-ui` · `report-charts` · `data-analysis` (export, bulk preview)                                      |

เสริม (ตลอด lifecycle):

- เจอ bug → `debug-mantra`
- หลัง fix → `post-mortem`
- ก่อน close PR → `code-review`, `scrutinize`, `verify`
- ก่อน implement → `clean-architecture-nextjs` (ทุก phase ที่แตะ slice)

---

## 1. Scope & Personas

แปลง Excel "SEO_Work_Progress_2026_12Months" → feature ที่ ADMIN/SEO_DEV จัดการได้ทุกมิติเอง โดย schema เปิดให้ customize ได้ผ่าน master tables

### สิทธิ์ (ตาม [rule 01](../../.claude/rules/01-security.md))

| Role     | View Plan              | Manage Plan/Item/Mark  | Manage Master/Template |
| -------- | ---------------------- | ---------------------- | ---------------------- |
| ADMIN    | ✅                     | ✅                     | ✅                     |
| SEO_DEV  | ✅ (assigned customer) | ✅ (assigned customer) | ❌ (read-only)         |
| CUSTOMER | ✅ (ของตัวเอง)         | ❌                     | ❌                     |

Guards (reuse — ตาม [rule 07](../../.claude/rules/07-reusability.md)):

- Customer-scoped: `customerAccessGuard({ byUserId }, "read" | "manage")` จาก [`@/infrastructure/http`](../../src/infrastructure/http/index.ts)
- Master/Template: `requireRole(["ADMIN"])` จาก [`@/lib/api-auth`](../../src/lib/api-auth.ts) (อ้างอิงตาม [CLAUDE.md](../../CLAUDE.md))
- Page (Server Component): `requireAdmin` / `requireStaff` / `requireCustomer` จาก [`@/lib/auth-utils`](../../src/lib/auth-utils.ts)

---

## 2. Folder Layout (ตาม [rule 02](../../.claude/rules/02-structure.md) + [09](../../.claude/rules/09-clean-architecture.md))

```
src/features/work-progress/
├── domain/                              # pure TS — ห้าม import React/Next/Prisma/axios/MUI/shadcn
│   ├── WorkProgressPlan.ts
│   ├── WorkProgressItem.ts
│   ├── WorkProgressMaster.ts
│   ├── WorkProgressTemplate.ts          # Phase 2
│   ├── WorkProgressActivity.ts          # Phase 4
│   ├── types.ts                         # PeriodTypeCode, MarkCode, StatusCode (string union)
│   └── policies/
│       ├── progress-calculator.ts       # weighted overall % — pure function
│       └── period-generator.ts          # gen Period[] ตาม periodType
├── application/
│   ├── ports/                           # interface (สัญญา)
│   │   ├── WorkProgressRepository.ts
│   │   ├── WorkProgressMasterRepository.ts
│   │   ├── WorkProgressTemplateRepository.ts        # Phase 2
│   │   ├── WorkProgressActivityRepository.ts        # Phase 4
│   │   └── AttachmentStorage.ts                     # Phase 3
│   └── use-cases/                       # verb-noun.ts — 1 ไฟล์ = 1 action
│       ├── plan/      ├── item/         ├── mark/        ├── master/
│       ├── subtask/   ├── attachment/   ├── meta/        # Phase 3
│       ├── template/  ├── audit/        └── summary/     # Phase 2 / 4
├── infrastructure/                      # implements port 1:1
│   ├── PrismaWorkProgressRepository.ts
│   ├── PrismaWorkProgressMasterRepository.ts
│   ├── PrismaWorkProgressTemplateRepository.ts        # Phase 2
│   ├── PrismaWorkProgressActivityRepository.ts        # Phase 4
│   └── LocalAttachmentStorage.ts                      # Phase 3
├── schemas/                             # Zod input/output
│   ├── plan.ts
│   ├── item.ts
│   ├── mark.ts
│   ├── master.ts
│   ├── template.ts                      # Phase 2
│   ├── subtask.ts                       # Phase 3
│   ├── attachment.ts                    # Phase 3
│   ├── meta.ts                          # Phase 3
│   └── index.ts
├── presentation/                        # Phase 5–6
│   ├── components/                      # PascalCase.tsx
│   └── hooks/                           # useXxx.ts
└── index.ts                             # PUBLIC API — re-export use case + schema + DTO type เท่านั้น
```

API routes (ตาม [rule 02](../../.claude/rules/02-structure.md) — 1 resource = 1 folder):

```
src/app/api/
├── customers/[customerId]/work-progress/...        # customer-scoped (Phase 1–4)
└── work-progress/                                  # master + template (Phase 1–2)
    ├── categories/         ├── statuses/
    ├── mark-types/         └── templates/          # Phase 2
```

Pages (Phase 5–6):

```
src/app/
├── admin/customers/[userId]/work-progress/...
├── admin/settings/work-progress/...                # master + template builder
├── seo/customers/[userId]/work-progress/...
└── customer/work-progress/...                      # read-only
```

---

## 3. Compliance Notes (จุดที่ต้องระวังเป็นพิเศษ)

### Domain ห้าม import Prisma (rule 09 — strict)

`WorkProgressPeriodType` ใน Prisma เป็น enum runtime — ใน `domain/` mirror เป็น string union:

```ts
// domain/types.ts (pure TS)
export type PeriodTypeCode = 'YEAR_12_MONTHS' | 'YEAR_4_QUARTERS' | 'HALF_2_PERIODS' | 'CUSTOM'

// Master tables ใช้ string code อยู่แล้ว (DB row) — ไม่ต้อง mirror
export type StatusCode = string
export type CategoryCode = string
export type MarkCode = string
```

ใน `application/` schema / `infrastructure/` adapter — import `WorkProgressPeriodType` จาก `@prisma/client` ได้

### Pure helper ห้าม import React/Next/Prisma (rule 02)

`domain/policies/progress-calculator.ts` รับ array ของ `WorkProgressItem` interface (pure) → คืน number. ไม่อ้างถึง framework

### Type source priority (rule 03)

ลำดับ: `z.infer<typeof schema>` > `Prisma.WorkProgressItemGetPayload<...>` (เฉพาะ infrastructure) > hand-rolled domain interface

### Color จาก master table (rule 08)

Master `color` field เก็บเป็น hex (`#rrggbb`). UI render ผ่าน `style={{ "--badge-color": color }}` + class `bg-[var(--badge-color)]` — ไม่ใช้ Tailwind hardcode (`bg-red-500`). ถ้า color เป็น null → fallback `bg-secondary` จาก theme

### Error response (rule 01)

ทุก route handler ใช้ `withApiHandler` จาก [`@/infrastructure/http`](../../src/infrastructure/http/withApiHandler.ts) — มัน catch `HttpError` + Zod error → response `{ error: "..." }` ให้อัตโนมัติ. ห้ามเขียน `try/catch` ad-hoc ใน route

---

# ✅ Phase 1 — Foundation (MVP)

**Goal**: API พื้นฐานทำงานแทน Excel ได้ — สร้าง plan + ใส่ item + tick cell รายเดือน
**Pre-flight skills**: `clean-architecture-nextjs`, `api-foundation`, `clean-reusable-code`

## 1.1 Prisma — Migration `add_work_progress_core`

```prisma
enum WorkProgressPeriodType {
  YEAR_12_MONTHS
  YEAR_4_QUARTERS
  HALF_2_PERIODS
  CUSTOM
}

// ───── Master tables (replace enum from day 1) ─────
model WorkProgressCategory {
  id          String   @id @default(uuid())
  code        String   @unique           // "KEYWORD_INTENT"
  name        String                     // "Keyword & Intent"
  description String?  @db.Text
  color       String?                    // hex; nullable → fallback theme
  icon        String?                    // lucide-react icon name
  orderIndex  Int      @default(0)
  isActive    Boolean  @default(true)
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items WorkProgressItem[]

  @@index([isActive])
  @@map("workprogresscategory")
}

model WorkProgressStatus {
  id         String   @id @default(uuid())
  code       String   @unique
  name       String
  color      String?
  orderIndex Int      @default(0)
  isTerminal Boolean  @default(false)
  isDefault  Boolean  @default(false)    // enforce 1-only ใน use case (DB ไม่มี partial unique)
  isActive   Boolean  @default(true)
  isSystem   Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  items WorkProgressItem[]

  @@index([isActive])
  @@map("workprogressstatus")
}

model WorkProgressMarkType {
  id         String   @id @default(uuid())
  code       String   @unique
  name       String
  color      String?
  icon       String?
  orderIndex Int      @default(0)
  isActive   Boolean  @default(true)
  isSystem   Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  periodMarks WorkProgressItemPeriodMark[]

  @@index([isActive])
  @@map("workprogressmarktype")
}

// ───── Plan + Period + Item + PeriodMark ─────
model WorkProgressPlan {
  id           String   @id @default(uuid())
  title        String
  periodType   WorkProgressPeriodType @default(YEAR_12_MONTHS)
  year         Int?
  startDate    DateTime?
  endDate      DateTime?
  packageName  String?
  note         String?  @db.Text
  isArchived   Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  periods      WorkProgressPeriod[]
  items        WorkProgressItem[]

  @@index([customerId])
  @@index([customerId, isArchived])
  @@map("workprogressplan")
}

model WorkProgressPeriod {
  id         String   @id @default(uuid())
  planId     String
  plan       WorkProgressPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  seq        Int                       // 1..N
  label      String                    // "ม.ค." / "Q1" / "Sprint 1"
  startDate  DateTime?
  endDate    DateTime?

  marks      WorkProgressItemPeriodMark[]

  @@unique([planId, seq])
  @@index([planId])
  @@map("workprogressperiod")
}

model WorkProgressItem {
  id              String   @id @default(uuid())
  planId          String
  plan            WorkProgressPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  categoryId      String
  category        WorkProgressCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  statusId        String
  status          WorkProgressStatus   @relation(fields: [statusId], references: [id], onDelete: Restrict)

  activity        String   @db.Text
  description     String?  @db.Text
  progressPercent Int      @default(0)
  duration        String?
  note            String?  @db.Text
  orderIndex      Int      @default(0)
  weight          Int      @default(1)
  startDate       DateTime?
  dueDate         DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  periodMarks     WorkProgressItemPeriodMark[]

  @@index([planId])
  @@index([categoryId])
  @@index([statusId])
  @@map("workprogressitem")
}

model WorkProgressItemPeriodMark {
  id              String   @id @default(uuid())
  itemId          String
  item            WorkProgressItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  periodId        String
  period          WorkProgressPeriod @relation(fields: [periodId], references: [id], onDelete: Cascade)
  markTypeId      String
  markType        WorkProgressMarkType @relation(fields: [markTypeId], references: [id], onDelete: Restrict)
  progressPercent Int?
  note            String?  @db.Text
  updatedAt       DateTime @updatedAt

  @@unique([itemId, periodId])
  @@index([itemId])
  @@index([periodId])
  @@map("workprogressitemperiodmark")
}
```

Backref ใน `Customer`:

```prisma
model Customer { workProgressPlans WorkProgressPlan[] }
```

> ทุก model มี `@@map("lowercase")` (rule prisma/CLAUDE.md §4) · ใช้ `String @id @default(uuid())` · `@@index` บน FK + columns ที่ใช้ filter · `@db.Text` กับ long text

### Seed (`prisma/seed.ts` — upsert)

- 7 categories `isSystem=true` (จาก CSV)
- 5 statuses: `NOT_STARTED` (isDefault) / `IN_PROGRESS` / `COMPLETED` (isTerminal) / `ON_HOLD` / `CANCELLED` (isTerminal)
- 4 mark types: `PLANNED` / `IN_PROGRESS` / `COMPLETED` / `MISSED`

## 1.2 Use Cases (Phase 1)

```
application/use-cases/
├── plan/
│   ├── createPlan.ts        # gen periods ใน transaction; ใช้ default status
│   ├── listPlans.ts         # filter isArchived
│   ├── getPlanDetail.ts     # include periods + items + marks (no N+1)
│   ├── updatePlan.ts
│   ├── archivePlan.ts
│   └── deletePlan.ts
├── item/
│   ├── addItem.ts
│   ├── updateItem.ts        # status terminal → auto set completedAt
│   ├── deleteItem.ts
│   └── reorderItems.ts
├── mark/
│   ├── setPeriodMark.ts     # upsert + validate periodId ∈ planId, itemId ∈ planId
│   ├── clearPeriodMark.ts
│   └── bulkSetPeriodMarks.ts
├── master/
│   ├── listCategories.ts    # filter isActive ที่ฝั่ง customer-facing
│   ├── listStatuses.ts
│   ├── listMarkTypes.ts
│   ├── upsertCategory.ts    # ADMIN
│   ├── upsertStatus.ts      # auto unset isDefault ตัวอื่นใน $transaction
│   ├── upsertMarkType.ts
│   └── deactivateMasterRow.ts  # block ถ้ามี FK ใช้อยู่ (Restrict)
└── summary/
    └── getPlanSummary.ts    # weighted overall + by category + by period (aggregate ใน DB)
```

### Domain policy ตัวอย่าง (pure)

```ts
// domain/policies/progress-calculator.ts
import type { WorkProgressItem } from '../WorkProgressItem'

export function calcOverallPercent(items: readonly WorkProgressItem[]): number {
  if (items.length === 0) return 0
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
  if (totalWeight === 0) return 0
  const weighted = items.reduce((sum, i) => sum + i.progressPercent * i.weight, 0)
  return Math.round(weighted / totalWeight)
}
```

```ts
// domain/policies/period-generator.ts
import type { PeriodTypeCode } from '../types'

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const

export interface PeriodSeed {
  seq: number
  label: string
  startDate?: Date
  endDate?: Date
}

export function generatePeriods(type: PeriodTypeCode, year?: number): PeriodSeed[] {
  switch (type) {
    case 'YEAR_12_MONTHS':
      return THAI_MONTHS.map((label, i) => ({
        seq: i + 1,
        label,
        startDate: year ? new Date(year, i, 1) : undefined,
        endDate: year ? new Date(year, i + 1, 0) : undefined,
      }))
    case 'YEAR_4_QUARTERS':
      return [1, 2, 3, 4].map((q) => ({ seq: q, label: `Q${q}` }))
    case 'HALF_2_PERIODS':
      return [1, 2].map((h) => ({ seq: h, label: `H${h}` }))
    case 'CUSTOM':
      return []
  }
}
```

## 1.3 API Routes (Phase 1)

**Pattern (มาตรฐาน, ใช้ทุก route — rule 07):**

```ts
// app/api/customers/[customerId]/work-progress/route.ts
import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok, created } from '@/infrastructure/http'
import { listPlans, createPlan, createPlanSchema } from '@/features/work-progress'

const paramsSchema = z.object({ customerId: z.uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')
  return ok(await listPlans(ctx.customer.id))
})

export const POST = withApiHandler(
  { params: paramsSchema, body: createPlanSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return created(await createPlan(ctx.customer.id, session.user.id, body))
  },
)
```

### Customer-scoped routes (14 endpoints)

| Method               | Path                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| GET / POST           | `/api/customers/[customerId]/work-progress`                                          |
| GET / PATCH / DELETE | `/api/customers/[customerId]/work-progress/[planId]`                                 |
| POST                 | `/api/customers/[customerId]/work-progress/[planId]/archive`                         |
| GET                  | `/api/customers/[customerId]/work-progress/[planId]/summary`                         |
| POST                 | `/api/customers/[customerId]/work-progress/[planId]/items`                           |
| PATCH / DELETE       | `/api/customers/[customerId]/work-progress/[planId]/items/[itemId]`                  |
| POST                 | `/api/customers/[customerId]/work-progress/[planId]/items/reorder`                   |
| PUT                  | `/api/customers/[customerId]/work-progress/[planId]/items/[itemId]/marks`            |
| DELETE               | `/api/customers/[customerId]/work-progress/[planId]/items/[itemId]/marks/[periodId]` |
| POST                 | `/api/customers/[customerId]/work-progress/[planId]/items/[itemId]/marks/bulk`       |

### Master routes (10 endpoints — ADMIN write, all-role read)

| Method                      | Path                                 |
| --------------------------- | ------------------------------------ |
| GET / POST                  | `/api/work-progress/categories`      |
| PATCH / POST :id/deactivate | `/api/work-progress/categories/[id]` |
| GET / POST                  | `/api/work-progress/statuses`        |
| PATCH                       | `/api/work-progress/statuses/[id]`   |
| GET / POST                  | `/api/work-progress/mark-types`      |
| PATCH                       | `/api/work-progress/mark-types/[id]` |

## 1.4 Zod schemas — ตัวอย่างหลัก

```ts
// schemas/plan.ts
import { z } from 'zod'
import { WorkProgressPeriodType } from '@prisma/client'

export const customPeriodSchema = z.object({
  label: z.string().min(1).max(50),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const createPlanSchema = z
  .object({
    title: z.string().min(1).max(200),
    periodType: z.nativeEnum(WorkProgressPeriodType).default('YEAR_12_MONTHS'),
    year: z.number().int().min(2020).max(2099).optional(),
    customPeriods: z.array(customPeriodSchema).optional(),
    packageName: z.string().max(200).optional().nullable(),
    note: z.string().max(5000).optional().nullable(),
  })
  .refine((d) => d.periodType !== 'CUSTOM' || (d.customPeriods?.length ?? 0) > 0, {
    message: 'CUSTOM ต้องระบุ customPeriods อย่างน้อย 1',
  })

export type CreatePlanInput = z.infer<typeof createPlanSchema>
```

```ts
// schemas/master.ts (snippet)
export const upsertCategorySchema = z.object({
  code: z
    .string()
    .regex(/^[A-Z0-9_]+$/)
    .min(2)
    .max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
  icon: z.string().max(50).optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})
```

## 1.5 Acceptance — Phase 1

- [ ] Prisma schema 7 ตาราง + 1 enum + 1 backref · `npm run build` ผ่าน
- [ ] Seed: 7 + 5 + 4 system rows ปรากฏใน DB
- [ ] `POST /work-progress` (12-month) → plan + 12 periods ใน 1 transaction
- [ ] `POST /items` ใส่ default status อัตโนมัติเมื่อ client ไม่ส่ง `statusId`
- [ ] `PUT /marks` validate ว่า `period.planId === item.planId` (กัน cross-plan mark)
- [ ] `getPlanSummary` คืน weighted % (verify ด้วย hand-calc 3 items × weight ต่างกัน)
- [ ] ทุก route ใช้ `withApiHandler` — ไม่มี try/catch ad-hoc
- [ ] Domain ไม่มี import `@prisma/client` (grep verify)
- [ ] Smoke test Postman ทุก endpoint

## 1.6 Tasks — Phase 1

1. แก้ไฟล์ใน `prisma/schema/` (เช่น `work-progress.prisma`, `customer.prisma`) + `Customer` backref → แจ้ง user รัน `npx prisma migrate dev --name add_work_progress_core` + `npx prisma generate`
2. แก้ `prisma/seed.ts` (upsert pattern) → แจ้ง user รัน `npm run seed`
3. สร้าง folder slice ครบ 4 layer + `schemas/` + `index.ts`
4. เขียน domain entities + policies (pure)
5. เขียน Zod schemas (`plan.ts`, `item.ts`, `mark.ts`, `master.ts`, `index.ts`)
6. เขียน ports + use cases (~17 ตัว)
7. เขียน Prisma adapters 2 ตัว
8. เขียน `index.ts` public API
9. สร้าง route handlers (14 + 10 = 24 endpoints)
10. Smoke test + `npm run build`

---

# ✅ Phase 2 — Template System

**Goal**: ADMIN สร้าง/ใช้ template สร้าง plan ใหม่ใน 1 click + "save plan as template"
**Pre-flight skills**: `clean-architecture-nextjs`, `api-foundation`, `clean-reusable-code`

## 2.1 Prisma — Migration `add_work_progress_template`

```prisma
model WorkProgressTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?  @db.Text
  periodType  WorkProgressPeriodType @default(YEAR_12_MONTHS)
  isActive    Boolean  @default(true)
  isSystem    Boolean  @default(false)
  createdById String?
  createdBy   User?    @relation("WorkProgressTemplateCreator", fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items       WorkProgressTemplateItem[]

  @@index([isActive])
  @@map("workprogresstemplate")
}

model WorkProgressTemplateItem {
  id             String   @id @default(uuid())
  templateId     String
  template       WorkProgressTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  categoryId     String
  category       WorkProgressCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  activity       String   @db.Text
  description    String?  @db.Text
  duration       String?
  weight         Int      @default(1)
  orderIndex     Int      @default(0)
  defaultPeriods Json?

  @@index([templateId])
  @@map("workprogresstemplateitem")
}
```

เพิ่ม optional ใน `WorkProgressPlan`:

```prisma
createdById String?
createdBy   User? @relation("WorkProgressPlanCreator", fields: [createdById], references: [id])
```

Backref `User`:

```prisma
workProgressTemplatesCreated WorkProgressTemplate[] @relation("WorkProgressTemplateCreator")
workProgressPlansCreated     WorkProgressPlan[]     @relation("WorkProgressPlanCreator")
```

### Seed

1 system template "SEO Standard 12 Months" + 23 items (จาก CSV) — `isSystem=true`

## 2.2 Use Cases — extend

```
plan/createPlanFromTemplate.ts        # extend createPlan รับ templateId
plan/clonePlanFromExisting.ts         # copy items shape, reset progress/marks
template/
├── listTemplates.ts                  # filter isActive
├── getTemplate.ts                    # detail + items
├── upsertTemplate.ts                 # ADMIN
├── deleteTemplate.ts                 # block ถ้า isSystem=true → ConflictError
├── reorderTemplateItems.ts
└── savePlanAsTemplate.ts             # copy current plan → template (ADMIN)
```

### ขยาย `createPlanSchema`

```ts
templateId: z.string().uuid().optional(),
cloneFromPlanId: z.string().uuid().optional(),
// + .refine ห้าม co-existing
```

## 2.3 API Routes — เพิ่ม 7 endpoints

| Method               | Path                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| GET / POST           | `/api/work-progress/templates`                                        |
| GET / PATCH / DELETE | `/api/work-progress/templates/[id]`                                   |
| POST                 | `/api/work-progress/templates/[id]/items/reorder`                     |
| POST                 | `/api/customers/[customerId]/work-progress/[planId]/save-as-template` |

## 2.4 Acceptance — Phase 2

- [ ] Migration 2 tables + 1 field
- [ ] Seed: system template ใช้ได้ทันที
- [ ] `POST /work-progress { templateId }` สร้าง plan + items ครบ ใน 1 transaction
- [ ] `DELETE template/[id]` block `isSystem=true` → 409 ConflictError
- [ ] `save-as-template` ทำได้เฉพาะ ADMIN + plan ที่มี items > 0

## 2.5 Tasks — Phase 2

1. Schema + seed + migration `add_work_progress_template`
2. เพิ่ม port `WorkProgressTemplateRepository` + adapter
3. ขยาย `createPlan` รับ templateId / cloneFromPlanId
4. เพิ่ม 7 template use cases
5. เพิ่ม 7 routes
6. Smoke test

---

# ✅ Phase 3 — Rich Items (Subtask + Attachment + Meta + Assignment)

**Goal**: 1 item เก็บ checklist + หลักฐาน + custom field + ผู้รับผิดชอบ
**Pre-flight skills**: `api-foundation`, `clean-reusable-code`

## 3.1 Prisma — Migration `add_work_progress_rich_items`

```prisma
model WorkProgressSubtask {
  id           String   @id @default(uuid())
  itemId       String
  item         WorkProgressItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  title        String
  isDone       Boolean  @default(false)
  orderIndex   Int      @default(0)
  assignedToId String?
  assignedTo   User?    @relation("WorkProgressSubtaskAssignee", fields: [assignedToId], references: [id])
  completedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([itemId])
  @@map("workprogresssubtask")
}

model WorkProgressAttachment {
  id           String   @id @default(uuid())
  itemId       String?
  item         WorkProgressItem? @relation(fields: [itemId], references: [id], onDelete: Cascade)
  kind         String                    // "IMAGE" | "LINK" | "FILE"
  url          String   @db.Text
  filename     String?
  mimeType     String?
  sizeBytes    Int?
  caption      String?  @db.Text
  uploadedById String?
  uploadedBy   User?    @relation("WorkProgressAttachmentUploader", fields: [uploadedById], references: [id])
  createdAt    DateTime @default(now())

  @@index([itemId])
  @@map("workprogressattachment")
}

model WorkProgressItemMeta {
  id        String   @id @default(uuid())
  itemId    String
  item      WorkProgressItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  key       String
  value     String   @db.Text
  valueType String   @default("string")   // "string" | "number" | "date" | "json"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([itemId, key])
  @@index([itemId])
  @@map("workprogressitemmeta")
}
```

เพิ่มฟิลด์ใน `WorkProgressItem`:

```prisma
assignedToId String?
assignedTo   User?  @relation("WorkProgressItemAssignee", fields: [assignedToId], references: [id])
subtasks     WorkProgressSubtask[]
attachments  WorkProgressAttachment[]
meta         WorkProgressItemMeta[]

@@index([assignedToId])
```

Backref `User`:

```prisma
workProgressItemsAssigned    WorkProgressItem[]    @relation("WorkProgressItemAssignee")
workProgressSubtasksAssigned WorkProgressSubtask[] @relation("WorkProgressSubtaskAssignee")
workProgressAttachments      WorkProgressAttachment[] @relation("WorkProgressAttachmentUploader")
```

## 3.2 File Upload (rule 01 — chokepoint เดียว)

- Adapter `LocalAttachmentStorage` wrap [`validateUploadFile`](../../src/lib/file-upload.ts) — magic-byte check + 5MB cap + sanitize filename
- Path: `public/uploads/work-progress/[itemId]/<timestamp>-<sanitized>.<ext>`
- Allowed: IMAGE (png/jpg/webp/gif) · FILE (pdf/doc/docx/xls/xlsx) · LINK (URL string ไม่ผ่าน upload)
- ห้าม trust client MIME — `validateUploadFile` เช็ค magic byte อยู่แล้ว

## 3.3 Use Cases — เพิ่ม 11 ตัว

```
item/assignItem.ts
subtask/{addSubtask, updateSubtask, toggleSubtask, reorderSubtasks, deleteSubtask}.ts
attachment/{addAttachment, addLinkAttachment, deleteAttachment}.ts
meta/{upsertMeta, bulkUpsertMeta, deleteMeta}.ts
```

`getPlanDetail` ขยายให้ include subtask/attachment/meta (1 query ผ่าน Prisma `include` — กัน N+1)

## 3.4 API Routes — เพิ่ม 11 endpoints

| Method                | Path                                        |
| --------------------- | ------------------------------------------- |
| POST                  | `.../items/[itemId]/assign`                 |
| POST / PATCH / DELETE | `.../items/[itemId]/subtasks[/[subtaskId]]` |
| POST                  | `.../items/[itemId]/subtasks/reorder`       |
| POST (multipart)      | `.../items/[itemId]/attachments`            |
| POST                  | `.../items/[itemId]/attachments/link`       |
| DELETE                | `.../items/[itemId]/attachments/[attId]`    |
| PUT                   | `.../items/[itemId]/meta`                   |
| POST                  | `.../items/[itemId]/meta/bulk`              |
| DELETE                | `.../items/[itemId]/meta/[key]`             |

## 3.5 Acceptance — Phase 3

- [ ] Upload IMAGE → URL accessible · ไฟล์ผิด magic-byte → 400
- [ ] Upload size > 5MB → 400 พร้อม error ไทย
- [ ] meta key ซ้ำ → upsert (ไม่สร้าง row ใหม่)
- [ ] ลบ item → cascade subtask + attachment + meta หมด
- [ ] Files ใต้ `public/uploads/work-progress/` มี timestamp prefix

## 3.6 Tasks — Phase 3

1. Schema + migration `add_work_progress_rich_items`
2. ขยาย ports + adapters
3. เพิ่ม 11 use cases
4. `LocalAttachmentStorage` wrap `validateUploadFile`
5. เพิ่ม 11 routes (1 multipart)
6. Smoke test upload + delete + meta

---

# ✅ Phase 4 — Audit & Insights

**Goal**: ActivityLog + dashboard summary endpoint
**Pre-flight skills**: `data-analysis`, `clean-reusable-code`

## 4.1 Prisma — Migration `add_work_progress_activity`

```prisma
model WorkProgressActivity {
  id        String   @id @default(uuid())
  planId    String
  plan      WorkProgressPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  actorId   String?
  actor     User?    @relation("WorkProgressActor", fields: [actorId], references: [id])
  action    String                    // "PLAN_CREATED" | "ITEM_UPDATED" | "MARK_SET" | ...
  entity    String                    // "PLAN" | "ITEM" | "SUBTASK" | "MARK" | "ATTACHMENT" | "META"
  entityId  String?
  diff      Json?                     // { before, after } เฉพาะ field ที่เปลี่ยน
  createdAt DateTime @default(now())

  @@index([planId])
  @@index([planId, createdAt])
  @@map("workprogressactivity")
}
```

Backref:

```prisma
User { workProgressActivities WorkProgressActivity[] @relation("WorkProgressActor") }
WorkProgressPlan { activities WorkProgressActivity[] }
```

## 4.2 Logging Strategy

- **ไม่ใช้ Prisma middleware** — middleware เดิม ([`src/lib/prisma.ts`](../../src/lib/prisma.ts)) มีไว้สำหรับ history ของ `OverallMetrics` / `KeywordReport` เท่านั้น
- เพิ่ม `activityRepo.log(...)` ที่ปลาย use case ทุก mutate ใน Phase 1–3 (~34 จุด)
- Action const ใน `domain/WorkProgressActivity.ts` (string union) เพื่อกัน typo

## 4.3 Use Cases เพิ่ม

```
audit/getActivityLog.ts          # paginated (limit + cursor), filter entity/action
audit/getRecentChanges.ts        # 20 ล่าสุดสำหรับ dashboard
summary/getDashboardSummary.ts   # KPI + recent + upcoming dueDate
summary/getCategoryBreakdown.ts  # by category × period pivot
```

## 4.4 API Routes — เพิ่ม 3

| Method | Path                                                                    |
| ------ | ----------------------------------------------------------------------- |
| GET    | `/api/customers/[customerId]/work-progress/[planId]/activity`           |
| GET    | `/api/customers/[customerId]/work-progress/dashboard-summary`           |
| GET    | `/api/customers/[customerId]/work-progress/[planId]/category-breakdown` |

## 4.5 Acceptance — Phase 4

- [ ] ทุก mutate ใน Phase 1–3 ถูก patch ให้ log
- [ ] `GET /activity?limit=50&cursor=...` paginated
- [ ] `dashboard-summary` ≤ 500ms ที่ plan 100 items
- [ ] `category-breakdown` ใช้ `groupBy` ใน Prisma (ไม่ aggregate ใน JS — rule 04)

## 4.6 Tasks — Phase 4

1. Schema + migration `add_work_progress_activity`
2. Port + adapter
3. Patch use cases เก่า (~34 จุด) — เรียก `activityRepo.log()` ที่ปลาย
4. 4 use cases ใหม่
5. 3 routes ใหม่
6. Smoke test pagination + summary

---

# ✅ Phase 5 — UI for ADMIN / SEO_DEV

**Goal**: ตาราง 12-month แทน Excel ได้บน UI + master settings page
**Pre-flight skills**: `dashboard-uxui-design`, `shadcn-ui`, `report-charts`, `clean-reusable-code`

## 5.1 Pages (rule 04 — Server Component default)

| Path                                               | Role     | Server/Client mix                                          |
| -------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `/admin/customers/[userId]/work-progress`          | ADMIN    | Server: list · Client: create dialog                       |
| `/admin/customers/[userId]/work-progress/[planId]` | ADMIN    | Server: page shell · Client: PlanGrid                      |
| `/seo/customers/[userId]/work-progress/*`          | SEO_DEV  | เหมือนกัน + guard `requireStaff`                           |
| `/customer/work-progress/[planId]`                 | CUSTOMER | Server: page · Client: read-only grid (ไม่มี popover edit) |
| `/admin/settings/work-progress`                    | ADMIN    | Server shell · Client: tabs CRUD                           |
| `/admin/settings/work-progress/templates/[id]`     | ADMIN    | Client: drag-drop template builder                         |

## 5.2 Components (rule 06 — shadcn + react-charts + lucide-react named import)

```
features/work-progress/presentation/
├── components/                          # PascalCase.tsx
│   ├── PlanList.tsx
│   ├── PlanGrid.tsx                     # virtualize ถ้า > 100 rows (rule 04)
│   ├── PlanGridHeader.tsx
│   ├── PlanGridRow.tsx                  # memo + stable key
│   ├── PeriodCell.tsx                   # Popover เลือก mark + % + note
│   ├── ItemRowExpanded.tsx              # subtask + attachment + meta
│   ├── SubtaskList.tsx
│   ├── AttachmentGallery.tsx
│   ├── AttachmentDropzone.tsx
│   ├── ItemMetaEditor.tsx
│   ├── CreatePlanDialog.tsx             # tabs: template / clone / empty
│   ├── ActivityFeed.tsx
│   ├── ProgressSummaryCards.tsx
│   ├── PeriodProgressChart.tsx          # react-charts stacked bar (lazy load — rule 05)
│   ├── CategoryBreakdownChart.tsx
│   └── master/
│       ├── CategoryManager.tsx
│       ├── StatusManager.tsx
│       ├── MarkTypeManager.tsx
│       └── TemplateBuilder.tsx
└── hooks/                               # useXxx.ts
    ├── useWorkProgressPlans.ts          # staleTime: 60_000
    ├── useWorkProgressPlan.ts
    ├── useCreatePlan.ts                 # invalidate ['workProgress', customerId]
    ├── useUpdateItem.ts                 # debounce 300ms — rule 04
    ├── useSetPeriodMark.ts              # optimistic update + rollback
    ├── useBulkSetPeriodMarks.ts
    ├── useReorderItems.ts
    ├── useSubtaskActions.ts
    ├── useAttachmentUpload.ts
    ├── useItemMeta.ts
    ├── useTemplates.ts
    ├── useMasterTables.ts               # share cache ระหว่างหน้า
    ├── useActivityLog.ts                # infinite query (cursor)
    └── useDashboardSummary.ts
```

### Color binding (rule 08)

```tsx
// แทนที่ bg-red-500 ใน badge
<span
  className="rounded px-2 py-1 text-xs"
  style={category.color ? { backgroundColor: category.color, color: '#fff' } : undefined}
>
  {category.name}
</span>
// ถ้าไม่มี color จาก master → fallback class `bg-secondary text-secondary-foreground`
```

### Bundle / Load (rule 05)

- `react-charts` + `xlsx` (Phase 6) → `dynamic(() => import('...'), { ssr: false })`
- `lucide-react` → named import เฉพาะ icon ที่ใช้
- ห้าม `import _ from 'lodash'` ทั้งก้อน → ใช้ `lodash-es` named หรือเขียนเอง

## 5.3 UX Decisions ([rule 06](../../.claude/rules/06-ui-library.md) — composition > configuration)

- Sticky 6 columns แรก (หมวด/กิจกรรม/สถานะ/%/ระยะ/หมายเหตุ) · period columns scroll แนวนอน
- Click cell → Popover mark selector + % input + note · 1-click toggle COMPLETED
- Inline edit ผ่าน focus-out · debounce 300ms
- Drag handle ซ้ายสุดสำหรับ reorder (rule 04 — stable key คือ item.id)
- Optimistic update ทุก mark + status — rollback ถ้า API fail (axios interceptor toast เอง — rule 02)
- Empty state: "ยังไม่มีแผนงาน — สร้างใหม่ / เลือก template" (reuse `EmptyState` ถ้ามีใน `components/`)

## 5.4 Acceptance — Phase 5

- [ ] ตาราง 50 items × 12 periods render < 1s
- [ ] Cell click → save → grid update < 500ms (optimistic)
- [ ] Master tab: ADMIN เพิ่ม category → invalidate query → row ใน plan grid ใช้ได้ทันที
- [ ] ไม่มี `@mui/*` import ใหม่ (grep verify — rule 06)
- [ ] ไม่มี hex/Tailwind default palette hardcode (`bg-red-500`, `text-[#...]`) — rule 08
- [ ] Keyboard nav บน plan grid (Tab/Enter/Esc) ทำงานครบ
- [ ] Lighthouse Performance ≥ 80 บน plan page (mid-range device)

## 5.5 Tasks — Phase 5

1. ติดตั้ง shadcn components ที่ขาด (`npx shadcn@latest add table popover dialog tabs sheet badge accordion ...`)
2. เขียน hooks (query key prefix `['workProgress', customerId, ...]`)
3. เขียน components ตามลำดับ: master → template builder → plan list → plan grid → expanded row → dashboard cards
4. เขียน pages 5 หน้า
5. ทดสอบ browser ทุก role · keyboard nav · a11y พื้นฐาน
6. `verify` skill — เปิด dev server, login 3 role, ใช้ feature golden + edge case

---

# Phase 6 — Customer UI + Polish

**Goal**: Customer view + Export Excel + Bulk + Import
**Pre-flight skills**: `dashboard-uxui-design`, `shadcn-ui`, `report-charts`, `data-analysis`

## 6.1 Customer pages

| Path                               | Content                                              |
| ---------------------------------- | ---------------------------------------------------- |
| `/customer/dashboard` (มีอยู่)     | เพิ่ม widget Work Progress (overall % + by category) |
| `/customer/work-progress`          | List plans (hide archived)                           |
| `/customer/work-progress/[planId]` | PlanGrid read-only mode                              |

## 6.2 Polish features

- **Export xlsx**: `POST .../export` → ตรวจ `xlsx` bundle size (bundlephobia) ก่อน install · lazy load · server-side gen
- **Bulk operations**:
  - bulk update status ของหลาย items (1 transaction)
  - bulk set mark สำหรับ period N ของหลาย items
  - import from CSV/XLSX → preview Zod-validated → confirm
- **Activity feed UI**: 20 ล่าสุดในหน้า plan
- **Dark mode**: ตรวจ contrast master color ทั้ง 2 mode

## 6.3 Acceptance — Phase 6

- [ ] Customer view ไม่มีปุ่ม edit (grep verify component prop `readOnly`)
- [ ] Export xlsx เปิดใน Excel/LibreOffice ได้
- [ ] Bulk mark 12 cells ใน 1 request — atomic
- [ ] Import preview เห็นทุก row ก่อน confirm · row ที่ error highlight แดง
- [ ] Plan 100 items × 5 attachments — page load < 2s

## 6.4 Tasks — Phase 6

1. Customer-scope components (reuse `PlanGrid readOnly`)
2. Export use case + adapter (`xlsx` lib lazy-loaded)
3. Bulk use cases + routes
4. Import: parse CSV/XLSX → Zod → diff preview → confirm
5. Widget ใน `/customer/dashboard`
6. End-to-end test ทุก role · `verify` skill

---

## 7. Compliance Matrix (รวมทุก Phase)

| Rule                  | Phase ที่กระทบ | จุด enforce                                                                                                  |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| 01 Security           | ทุก phase      | `customerAccessGuard` / `requireRole` / Zod / `validateUploadFile` / no client `userId` trust                |
| 02 Structure          | 1, 5, 6        | feature slice naming · 1 resource/folder · App Router segment · alias `@/*`                                  |
| 03 Clean Code         | ทุก phase      | TS strict · `z.infer` priority · Error class · no `any` · no WHAT comment                                    |
| 04 Performance        | 1, 4, 5, 6     | Prisma `groupBy` · React Query staleTime · Server Component default · virtualize > 100 rows · debounce 300ms |
| 05 Load Speed         | 5, 6           | named import · lazy chart/xlsx · pagination activity · bundlephobia check                                    |
| 06 UI Library         | 5, 6           | shadcn + react-charts · ห้าม MUI ใหม่ · lucide-react named · `cn()` helper                                   |
| 07 Reusability        | ทุก phase      | reuse `withApiHandler` / `customerAccessGuard` / `ok`/`created` / Error class · Rule of Three                |
| 08 Colors             | 5, 6           | สี theme.ts + master `color` field → CSS variable inline · ห้าม Tailwind default palette / hex hardcode      |
| 09 Clean Architecture | 1–4            | domain pure TS · application → port · adapter implement 1:1 · public API ใน `index.ts` · route handler บาง   |

## 8. Forbidden patterns (anti-patterns to avoid)

- ❌ `prisma.workProgressItem.findMany(...)` ใน route handler (rule 09 — ใส่ใน use case)
- ❌ `export type * from '@prisma/client'` ใน `index.ts` (rule 09 — leak Prisma)
- ❌ `import { WorkProgressItem } from '@prisma/client'` ใน `domain/` (rule 09)
- ❌ `try { ... } catch (e) {}` swallow (rule 03) — ใช้ Error class
- ❌ `bg-red-500` / `text-[#abc]` ใน component (rule 08)
- ❌ `@mui/*` import ใหม่ (rule 06)
- ❌ `findMany` ไม่ใส่ `take` ที่หน้ารายการ (rule 05)
- ❌ Inline `Date.now()` ใน domain function (rule 07 — pure)
- ❌ Wrap shadcn `Button` เป็น `<MyButton>` โดยไม่เพิ่มคุณค่า (rule 07)

## 9. Open Questions

1. **Attachment storage**: local (`public/uploads/`) vs S3/CDN → แผน: local
2. **Activity log retention**: ตลอด vs purge → แผน: ตลอด (เล็ก ~< 1KB/row)
3. **Multi-language master**: 1 field vs `name_th`/`name_en` → แผน: 1 field (ไทย-อังกฤษผสม)
4. **Template ผูก Package master**: เพิ่ม Package model? → ไม่ในเฟสนี้
5. **Notification system**: มีอยู่ใน repo มั้ย? → ตัด out ของ Phase 6 ถ้ายังไม่มี
6. **Import format**: CSV ก่อน / XLSX → แผน: CSV ก่อน, XLSX Phase 6 polish
7. **`isDefault` Status** มากกว่า 1 row: enforce ใน use case ผ่าน `$transaction` (unset ก่อน set) — confirm ถูกใจ?

## 10. Implementation Note สำคัญ

- **Claude ห้ามรัน Prisma CLI เอง** (prisma/CLAUDE.md §6) — ทุก phase แก้ไฟล์ใน `prisma/schema/` + seed เสร็จ → แจ้ง user รัน `migrate dev` + `prisma generate` (+ `npm run seed` ถ้ามี seed ใหม่) เอง
- **Run order ต่อ Phase**: schema → seed → code → routes → smoke test → `npm run build` → commit
- **ทุก phase ที่แตะ slice** invoke `clean-architecture-nextjs` ก่อน · ทุก phase ที่แตะ route invoke `api-foundation`
- **ก่อน close** → `verify` (test manual) + `code-review` (current diff) + `scrutinize` (สำหรับ phase ใหญ่ 1, 5)
- **เจอ bug** → `debug-mantra` · **หลัง fix** → `post-mortem` (ลง docs/ ถ้าใหญ่)

## 11. References

- Source CSV: [`SEO_Work_Progress_2026_12Months - Sheet1.csv`](../../SEO_Work_Progress_2026_12Months%20-%20Sheet1.csv)
- Pattern อ้างอิง: [`src/features/metrics/`](../../src/features/metrics/) — feature slice 4-layer ที่ใกล้สุดในระบบ
- Project rules: [`.claude/rules/`](../../.claude/rules/) ทั้ง 9 ไฟล์
- Skills: [`.claude/skills/`](../../.claude/skills/) ทั้ง 7 ไฟล์
- Prisma workflow rule: [`prisma/CLAUDE.md`](../../prisma/CLAUDE.md)
- API skeleton: [`src/app/api/customers/[customerId]/metrics/route.ts`](../../src/app/api/customers/[customerId]/metrics/route.ts)
- HTTP utility: [`src/infrastructure/http/`](../../src/infrastructure/http/) — `withApiHandler`, `customerAccessGuard`, `ok`/`created`/`noContent`
- Error class: [`src/lib/errors.ts`](../../src/lib/errors.ts) — `BadRequestError`, `NotFoundError`, `ForbiddenError`, `ConflictError`
- File upload: [`src/lib/file-upload.ts`](../../src/lib/file-upload.ts)
- Theme: [`src/theme/theme.ts`](../../src/theme/theme.ts)
