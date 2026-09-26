'use client'

import { useState } from 'react'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { MasterRowDialog } from './MasterRowDialog'
import { MasterTableCard } from './MasterTableCard'
import { useCategories } from '../../hooks/useMasterTables'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeactivateMaster,
} from '../../hooks/useMasterMutations'
import type {
  WorkProgressCategory,
  UpsertCategoryInput,
  UpdateCategoryInput,
} from '@/features/work-progress'

export function CategoryManager() {
  const { data, isLoading, isError, refetch } = useCategories()
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const deactivateMut = useDeactivateMaster()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WorkProgressCategory | null>(null)
  const [confirmRow, setConfirmRow] = useState<WorkProgressCategory | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (row: WorkProgressCategory) => {
    setEditing(row)
    setDialogOpen(true)
  }

  const handleSubmit = async (body: Record<string, unknown>) => {
    if (editing) {
      await updateMut.mutateAsync({
        id: editing.id,
        body: body as UpdateCategoryInput,
      })
    } else {
      await createMut.mutateAsync(body as UpsertCategoryInput)
    }
    setDialogOpen(false)
  }

  const runRowAction = async (id: string, action: () => Promise<unknown>) => {
    setPendingId(id)
    try {
      await action()
    } catch {
      // ข้อความ error แสดงผ่าน toast ของ axios interceptor แล้ว
    } finally {
      setPendingId(null)
    }
  }

  const submitting = createMut.isPending || updateMut.isPending
  const rows = (data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <>
      <MasterTableCard
        headingId="wp-master-category"
        title="หมวด (Category)"
        description="หมวดของกิจกรรมในแผนงาน · ปิดใช้งานเพื่อซ่อนจากตัวเลือก"
        addLabel="เพิ่มหมวด"
        emptyText="ยังไม่มีหมวด"
        rows={rows}
        isLoading={isLoading}
        isError={isError}
        pendingId={pendingId}
        onRetry={() => void refetch()}
        onAdd={openCreate}
        onEdit={openEdit}
        onDeactivate={(row) => {
          setConfirmRow(row)
          setConfirmOpen(true)
        }}
        onReactivate={(row) =>
          void runRowAction(row.id, () =>
            updateMut.mutateAsync({ id: row.id, body: { isActive: true } }),
          )
        }
      />

      <MasterRowDialog
        kind="category"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <ConfirmAlert
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!confirmRow) return
          const row = confirmRow
          setConfirmOpen(false)
          void runRowAction(row.id, () =>
            deactivateMut.mutateAsync({ kind: 'category', id: row.id }),
          )
        }}
        title={`ปิดใช้งานหมวด “${confirmRow?.name ?? ''}”`}
        message="หมวดนี้จะไม่ปรากฏในตัวเลือกของแผนงานและ template อีก · item ที่ใช้หมวดนี้อยู่แล้วจะยังคงอยู่ครบ · เปิดใช้งานอีกครั้งได้ภายหลัง"
      />
    </>
  )
}
