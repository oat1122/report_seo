'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAddSubtask, useDeleteSubtask, useToggleSubtask } from '../../hooks/useSubtaskActions'
import type { WorkProgressSubtask } from '@/features/work-progress'

interface SubtaskListProps {
  userId: string
  planId: string
  itemId: string
  subtasks: WorkProgressSubtask[]
  readOnly?: boolean
}

export function SubtaskList({ userId, planId, itemId, subtasks, readOnly }: SubtaskListProps) {
  const addMut = useAddSubtask()
  const toggleMut = useToggleSubtask()
  const deleteMut = useDeleteSubtask()
  const [newTitle, setNewTitle] = useState('')

  const sorted = subtasks.slice().sort((a, b) => a.orderIndex - b.orderIndex)

  const handleAdd = async () => {
    const t = newTitle.trim()
    if (!t) return
    await addMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: { title: t },
    })
    setNewTitle('')
  }

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.length === 0 ? (
        <p className="text-text-secondary text-[13px]">
          {readOnly
            ? 'ยังไม่มีงานย่อย'
            : 'ยังไม่มีงานย่อย — เพิ่มขั้นตอนย่อยเพื่อคำนวณ % อัตโนมัติ'}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {sorted.map((s) => (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-muted/70 flex min-h-11 items-center gap-2.5 rounded-[12px] px-3 py-1.5"
              >
                <Checkbox
                  id={`st-${s.id}`}
                  checked={s.isDone}
                  disabled={readOnly || toggleMut.isPending}
                  onCheckedChange={() =>
                    toggleMut.mutate({
                      userId,
                      planId,
                      itemId,
                      subtaskId: s.id,
                    })
                  }
                />
                <label
                  htmlFor={`st-${s.id}`}
                  className={cn(
                    'flex-1 text-sm',
                    s.isDone && 'text-text-secondary line-through',
                    !readOnly && 'cursor-pointer',
                  )}
                >
                  {s.title}
                </label>
                {!readOnly && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-danger-strong"
                    onClick={() =>
                      deleteMut.mutate({
                        userId,
                        planId,
                        itemId,
                        subtaskId: s.id,
                      })
                    }
                    aria-label={`ลบงานย่อย ${s.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {!readOnly && (
        <div className="flex gap-2">
          <label htmlFor={`st-new-${itemId}`} className="sr-only">
            ชื่องานย่อยใหม่
          </label>
          <Input
            id={`st-new-${itemId}`}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            placeholder="เพิ่มงานย่อย แล้วกด Enter"
            maxLength={500}
          />
          <Button
            type="button"
            variant="soft"
            size="icon"
            onClick={handleAdd}
            disabled={!newTitle.trim() || addMut.isPending}
            aria-label="เพิ่มงานย่อย"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
