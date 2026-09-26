'use client'

import { useState } from 'react'
import { Flag, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { MasterRowDialog } from './MasterRowDialog'
import { MasterTableCard } from './MasterTableCard'
import { useStatuses } from '../../hooks/useMasterTables'
import {
  useCreateStatus,
  useUpdateStatus,
  useDeactivateMaster,
} from '../../hooks/useMasterMutations'
import type {
  WorkProgressStatus,
  UpsertStatusInput,
  UpdateStatusInput,
} from '@/features/work-progress'

const flagClass = 'text-text-secondary'

export function StatusManager() {
  const { data, isLoading, isError, refetch } = useStatuses()
  const createMut = useCreateStatus()
  const updateMut = useUpdateStatus()
  const deactivateMut = useDeactivateMaster()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WorkProgressStatus | null>(null)
  const [confirmRow, setConfirmRow] = useState<WorkProgressStatus | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const submitting = createMut.isPending || updateMut.isPending
  const rows = (data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex)

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

  return (
    <>
      <MasterTableCard
        headingId="wp-master-status"
        title="สถานะ (Status)"
        description="Default = ค่าเริ่มต้นของ item ใหม่ (มีได้ 1 สถานะ) · Terminal = ถือว่างานจบ"
        addLabel="เพิ่มสถานะ"
        emptyText="ยังไม่มีสถานะ"
        rows={rows}
        isLoading={isLoading}
        isError={isError}
        pendingId={pendingId}
        onRetry={() => void refetch()}
        onAdd={() => {
          setEditing(null)
          setDialogOpen(true)
        }}
        onEdit={(row) => {
          setEditing(row)
          setDialogOpen(true)
        }}
        onDeactivate={(row) => {
          setConfirmRow(row)
          setConfirmOpen(true)
        }}
        onReactivate={(row) =>
          void runRowAction(row.id, () =>
            updateMut.mutateAsync({ id: row.id, body: { isActive: true } }),
          )
        }
        renderFlags={(row) => (
          <>
            {row.isDefault && (
              <Badge variant="outline" className={flagClass}>
                <Star className="size-3" aria-hidden />
                Default
              </Badge>
            )}
            {row.isTerminal && (
              <Badge variant="outline" className={flagClass}>
                <Flag className="size-3" aria-hidden />
                Terminal
              </Badge>
            )}
          </>
        )}
      />

      <MasterRowDialog
        kind="status"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={async (body) => {
          if (editing) {
            await updateMut.mutateAsync({
              id: editing.id,
              body: body as UpdateStatusInput,
            })
          } else {
            await createMut.mutateAsync(body as UpsertStatusInput)
          }
          setDialogOpen(false)
        }}
        submitting={submitting}
      />

      <ConfirmAlert
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!confirmRow) return
          const row = confirmRow
          setConfirmOpen(false)
          void runRowAction(row.id, () => deactivateMut.mutateAsync({ kind: 'status', id: row.id }))
        }}
        title={`ปิดใช้งานสถานะ “${confirmRow?.name ?? ''}”`}
        message="สถานะนี้จะไม่ปรากฏในตัวเลือกเมื่ออัปเดต item อีก · item ที่อยู่ในสถานะนี้แล้วจะยังคงสถานะเดิม · เปิดใช้งานอีกครั้งได้ภายหลัง"
      />
    </>
  )
}
