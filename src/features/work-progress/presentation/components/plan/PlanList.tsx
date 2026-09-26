'use client'

import { useState } from 'react'
import { Copy, FilePlus2, LayoutTemplate, Plus, RefreshCw } from 'lucide-react'
import { AnimatePresence, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardGridSkeleton } from '@/components/skeletons'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { cn } from '@/lib/utils'
import { EmptyPlansState } from './EmptyPlansState'
import { PlanCard } from './PlanCard'
import { CreatePlanDialog, type PlanSourceTab } from './CreatePlanDialog'
import { EditPlanDialog } from './EditPlanDialog'
import {
  useArchivePlan,
  useDeletePlan,
  useWorkProgressPlans,
} from '../../hooks/useWorkProgressPlans'
import type { WorkProgressPlan } from '@/features/work-progress'

interface PlanListProps {
  userId: string
  basePath: string // e.g. /admin/customers/[userId]/work-progress
  readOnly?: boolean
}

const START_OPTIONS: {
  tab: PlanSourceTab
  title: string
  description: string
  icon: typeof FilePlus2
}[] = [
  {
    tab: 'empty',
    title: 'จากศูนย์',
    description: 'กำหนดชื่อแผน ช่วงเดือน และรูปแบบ period เอง',
    icon: FilePlus2,
  },
  {
    tab: 'template',
    title: 'ใช้ template',
    description: 'เลือกจาก template ที่เปิดใช้ พร้อม items ที่กำหนดไว้แล้ว',
    icon: LayoutTemplate,
  },
  {
    tab: 'clone',
    title: 'Clone จากแผนเดิม',
    description: 'คัดลอกแผนเดิมของลูกค้ารายนี้ แล้วกำหนดช่วงเวลาใหม่',
    icon: Copy,
  },
]

export function PlanList({ userId, basePath, readOnly }: PlanListProps) {
  const [includeArchived, setIncludeArchived] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createTab, setCreateTab] = useState<PlanSourceTab>('empty')
  const [editPlan, setEditPlan] = useState<WorkProgressPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkProgressPlan | null>(null)

  const { data, isLoading, isError, refetch, isRefetching } = useWorkProgressPlans(userId, {
    includeArchived: readOnly ? false : includeArchived,
  })
  const archiveMut = useArchivePlan()
  const deleteMut = useDeletePlan()

  const openCreate = (tab: PlanSourceTab = 'empty') => {
    setCreateTab(tab)
    setCreateOpen(true)
  }

  if (isLoading) {
    return <CardGridSkeleton cols={3} count={3} />
  }

  const plans = data ?? []
  const hasPlans = plans.length > 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-xl font-semibold">
            แผนงาน <span className="tabular-nums">({plans.length})</span>
          </h2>
          <p className="text-text-secondary text-[13px]">
            {readOnly
              ? 'แผนงาน SEO ที่ทีมจัดทำให้ — เลือกแผนเพื่อดูความคืบหน้ารายเดือน'
              : 'จัดการแผนงานของลูกค้า — สร้าง · ใช้ template · clone จากแผนเดิม'}
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex min-h-11 items-center gap-2.5">
              <Switch
                id={`show-archived-${userId}`}
                checked={includeArchived}
                onCheckedChange={setIncludeArchived}
              />
              <Label htmlFor={`show-archived-${userId}`} className="cursor-pointer text-sm">
                แสดงที่เก็บถาวร
              </Label>
            </div>
            <Button onClick={() => openCreate('empty')}>
              <Plus className="size-4" />
              สร้างแผนงาน
            </Button>
          </div>
        )}
      </div>

      {isError ? (
        <Card className="items-center gap-3 px-6 py-10 text-center" role="alert">
          <p className="text-sm font-medium">โหลดรายการแผนงานไม่สำเร็จ</p>
          <p className="text-text-secondary text-[13px]">
            ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองโหลดใหม่อีกครั้ง
          </p>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('size-4', isRefetching && 'animate-spin')} />
            ลองใหม่
          </Button>
        </Card>
      ) : !hasPlans ? (
        <EmptyPlansState readOnly={readOnly} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {plans.map((plan) => (
              <motion.li
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <PlanCard
                  userId={userId}
                  plan={plan}
                  href={`${basePath}/${plan.id}`}
                  readOnly={readOnly}
                  onEdit={() => setEditPlan(plan)}
                  onArchiveToggle={() =>
                    archiveMut.mutate({
                      userId,
                      planId: plan.id,
                      isArchived: !plan.isArchived,
                    })
                  }
                  onDelete={() => setDeleteTarget(plan)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {!readOnly && (
        <Card
          className="gap-4 px-5 py-5 sm:px-6"
          role="region"
          aria-labelledby={`wp-new-${userId}`}
        >
          <div className="flex flex-col gap-1">
            <h2 id={`wp-new-${userId}`} className="text-[17px] font-semibold">
              เริ่มแผนใหม่
            </h2>
            <p className="text-text-secondary text-[13px]">
              เลือกวิธีสร้างแผน — ทุกแบบแก้ไขต่อได้ภายหลัง
            </p>
          </div>
          <div className="grid gap-3.5 md:grid-cols-3">
            {START_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.tab}
                  type="button"
                  onClick={() => openCreate(opt.tab)}
                  className="border-accent hover:border-info-strong focus-visible:ring-ring/70 flex items-start gap-3.5 rounded-[16px] border border-dashed bg-white/60 p-[18px] text-left transition-colors outline-none focus-visible:ring-[3px] dark:bg-white/5"
                >
                  <span
                    aria-hidden
                    className="bg-info-subtle text-info-strong flex size-10 shrink-0 items-center justify-center rounded-[12px]"
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[15px] font-semibold">{opt.title}</span>
                    <span className="text-text-secondary text-[13px] leading-relaxed">
                      {opt.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {!readOnly && (
        <>
          <CreatePlanDialog
            userId={userId}
            open={createOpen}
            onOpenChange={setCreateOpen}
            initialTab={createTab}
          />

          {editPlan && (
            <EditPlanDialog
              userId={userId}
              plan={editPlan}
              open={!!editPlan}
              onOpenChange={(open) => {
                if (!open) setEditPlan(null)
              }}
            />
          )}

          <ConfirmAlert
            open={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            onConfirm={async () => {
              if (!deleteTarget) return
              await deleteMut.mutateAsync({ userId, planId: deleteTarget.id })
              setDeleteTarget(null)
            }}
            title={deleteTarget ? `ลบแผน “${deleteTarget.title}”` : 'ลบแผนงาน'}
            message="ลบแผนนี้พร้อม items, marks ทุกรอบ, งานย่อย และไฟล์แนบทั้งหมด — การกระทำนี้ย้อนกลับไม่ได้ ถ้าแค่ไม่ใช้แล้วให้เลือก “เก็บถาวร” แทน"
          />
        </>
      )}
    </div>
  )
}
