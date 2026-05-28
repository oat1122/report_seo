'use client'

import { useState } from 'react'
import { Plus, Pencil, EyeOff, Flag, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { MasterRowDialog } from './MasterRowDialog'
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

export function StatusManager() {
  const { data, isLoading } = useStatuses()
  const createMut = useCreateStatus()
  const updateMut = useUpdateStatus()
  const deactivateMut = useDeactivateMaster()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WorkProgressStatus | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const submitting = createMut.isPending || updateMut.isPending

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  const rows = (data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          สถานะของ item · isDefault จำกัด 1 ตัว · isTerminal = ปลายทาง (COMPLETED/CANCELLED)
        </p>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
          size="sm"
        >
          <Plus className="size-4" />
          เพิ่มสถานะ
        </Button>
      </div>

      <DataTable
        rows={rows}
        getRowKey={(r) => r.id}
        emptyState="ยังไม่มีสถานะ"
        columns={[
          {
            key: 'code',
            header: 'Code',
            cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
            className: 'w-40',
          },
          {
            key: 'name',
            header: 'ชื่อ',
            cell: (r) => (
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-3 rounded-full"
                  style={
                    r.color ? { backgroundColor: r.color } : { backgroundColor: 'var(--muted)' }
                  }
                  aria-hidden
                />
                <span>{r.name}</span>
                {r.isSystem && (
                  <Badge variant="secondary" className="text-xs">
                    system
                  </Badge>
                )}
              </div>
            ),
          },
          {
            key: 'flags',
            header: 'คุณสมบัติ',
            cell: (r) => (
              <div className="flex flex-wrap gap-1">
                {r.isDefault && (
                  <Badge variant="default" className="gap-1 text-xs">
                    <Star className="size-3" />
                    default
                  </Badge>
                )}
                {r.isTerminal && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Flag className="size-3" />
                    terminal
                  </Badge>
                )}
              </div>
            ),
            className: 'w-44',
          },
          {
            key: 'order',
            header: 'ลำดับ',
            cell: (r) => r.orderIndex,
            align: 'right',
            className: 'w-20',
          },
          {
            key: 'active',
            header: 'สถานะ',
            cell: (r) =>
              r.isActive ? (
                <Badge variant="default">เปิดใช้</Badge>
              ) : (
                <Badge variant="outline">ปิด</Badge>
              ),
            className: 'w-24',
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            className: 'w-32',
            cell: (r) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(r)
                    setDialogOpen(true)
                  }}
                  aria-label="แก้ไข"
                >
                  <Pencil className="size-4" />
                </Button>
                {r.isActive && !r.isSystem && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmId(r.id)}
                    aria-label="ปิดใช้งาน"
                  >
                    <EyeOff className="size-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
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
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          if (!confirmId) return
          await deactivateMut.mutateAsync({ kind: 'status', id: confirmId })
          setConfirmId(null)
        }}
        title="ปิดใช้งานสถานะ"
        message="สถานะที่ปิดใช้จะไม่ปรากฏในตัวเลือก แต่ item ที่ใช้อยู่จะยังคงอยู่"
      />
    </div>
  )
}
