'use client'

import { useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SubtaskList } from './SubtaskList'
import { AttachmentGallery } from './AttachmentGallery'
import { AssignItemPopover } from './AssignItemPopover'
import { getEffectiveItemPercent } from '../../../domain/policies/progress-calculator'
import type { WorkProgressItemWithMarks } from '@/features/work-progress'

interface ItemDetailSheetProps {
  userId: string
  planId: string
  item: WorkProgressItemWithMarks | null
  onClose: () => void
  readOnly?: boolean
}

export function ItemDetailSheet({ userId, planId, item, onClose, readOnly }: ItemDetailSheetProps) {
  const effectivePercent = useMemo(
    () =>
      item
        ? getEffectiveItemPercent({
            status: { isTerminal: item.status.isTerminal },
            subtasks: item.subtasks,
          })
        : 0,
    [item],
  )

  return (
    <Sheet open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[100vw]! max-w-[1100px]! overflow-y-auto sm:w-[80vw]!">
        {item && (
          <>
            <SheetHeader>
              <SheetTitle className="text-base">{item.activity}</SheetTitle>
              <SheetDescription asChild>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    style={
                      item.category.color
                        ? {
                            borderColor: item.category.color,
                            color: item.category.color,
                          }
                        : undefined
                    }
                  >
                    {item.category.name}
                  </Badge>
                  <Badge variant="secondary">{item.status.name}</Badge>
                  <span className="text-xs">{effectivePercent}%</span>
                  {item.duration && (
                    <span className="text-muted-foreground text-xs">· {item.duration}</span>
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4">
              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-semibold uppercase">
                  ผู้รับผิดชอบ
                </h3>
                <AssignItemPopover
                  userId={userId}
                  planId={planId}
                  itemId={item.id}
                  currentAssigneeId={item.assignedToId}
                  currentAssigneeName={item.assignedTo?.name ?? null}
                  readOnly={readOnly}
                />
              </section>

              <Separator />

              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-semibold uppercase">งานย่อย</h3>
                <SubtaskList
                  userId={userId}
                  planId={planId}
                  itemId={item.id}
                  subtasks={item.subtasks}
                  readOnly={readOnly}
                />
              </section>

              <Separator />

              <section className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-xs font-semibold uppercase">
                  ไฟล์ / ลิงก์
                </h3>
                <AttachmentGallery
                  userId={userId}
                  planId={planId}
                  itemId={item.id}
                  attachments={item.attachments}
                  readOnly={readOnly}
                />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
