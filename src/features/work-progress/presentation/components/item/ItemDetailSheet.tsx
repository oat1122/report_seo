"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SubtaskList } from "./SubtaskList";
import { AttachmentGallery } from "./AttachmentGallery";
import { ItemMetaEditor } from "./ItemMetaEditor";
import { AssignItemPopover } from "./AssignItemPopover";
import type { WorkProgressItemWithMarks } from "@/features/work-progress";

interface ItemDetailSheetProps {
  userId: string;
  planId: string;
  item: WorkProgressItemWithMarks | null;
  onClose: () => void;
  readOnly?: boolean;
}

export function ItemDetailSheet({
  userId,
  planId,
  item,
  onClose,
  readOnly,
}: ItemDetailSheetProps) {
  return (
    <Sheet open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-2xl overflow-y-auto sm:max-w-2xl">
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
                  <span className="text-xs">{item.progressPercent}%</span>
                  {item.duration && (
                    <span className="text-xs text-muted-foreground">
                      · {item.duration}
                    </span>
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4">
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  ผู้รับผิดชอบ
                </h3>
                <AssignItemPopover
                  userId={userId}
                  planId={planId}
                  itemId={item.id}
                  currentAssigneeId={item.assignedToId}
                  readOnly={readOnly}
                />
              </section>

              <Separator />

              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  งานย่อย
                </h3>
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
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
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

              <Separator />

              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Meta fields
                </h3>
                <ItemMetaEditor
                  userId={userId}
                  planId={planId}
                  itemId={item.id}
                  meta={item.meta}
                  readOnly={readOnly}
                />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
