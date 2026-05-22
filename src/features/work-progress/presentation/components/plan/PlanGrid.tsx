"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { PlanGridRow } from "./PlanGridRow";
import { ItemEditDialog } from "./ItemEditDialog";
import { ItemDetailSheet } from "../item/ItemDetailSheet";
import { useWorkProgressPlan } from "../../hooks/useWorkProgressPlan";
import {
  useDeleteItem,
  useReorderItems,
} from "../../hooks/useItemMutations";
import type {
  WorkProgressItemWithMarks,
  WorkProgressPeriod,
} from "@/features/work-progress";

interface PlanGridProps {
  userId: string;
  planId: string;
  readOnly?: boolean;
}

const COL_WIDTH = {
  drag: 40,
  category: 160,
  activity: 280,
  status: 120,
  percent: 60,
  duration: 100,
  period: 80,
  actions: 48,
} as const;

export function PlanGrid({ userId, planId, readOnly }: PlanGridProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId);
  const deleteMut = useDeleteItem();
  const reorderMut = useReorderItems();

  const [editing, setEditing] = useState<WorkProgressItemWithMarks | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<WorkProgressItemWithMarks | null>(null);
  const [detailItem, setDetailItem] =
    useState<WorkProgressItemWithMarks | null>(null);

  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const periods = useMemo<WorkProgressPeriod[]>(
    () => (data?.periods ?? []).slice().sort((a, b) => a.seq - b.seq),
    [data?.periods],
  );

  const items = useMemo<WorkProgressItemWithMarks[]>(() => {
    const base = (data?.items ?? [])
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);
    if (!localOrder) return base;
    const byId = new Map(base.map((i) => [i.id, i]));
    return localOrder
      .map((id) => byId.get(id))
      .filter((i): i is WorkProgressItemWithMarks => !!i);
  }, [data?.items, localOrder]);

  const gridTemplate = `${COL_WIDTH.drag}px ${COL_WIDTH.category}px ${COL_WIDTH.activity}px ${COL_WIDTH.status}px ${COL_WIDTH.percent}px ${COL_WIDTH.duration}px repeat(${periods.length}, ${COL_WIDTH.period}px) ${COL_WIDTH.actions}px`;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = items.map((i) => i.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(ids, oldIdx, newIdx);
    setLocalOrder(next);
    reorderMut.mutate(
      {
        userId,
        planId,
        body: {
          order: next.map((itemId, idx) => ({ itemId, orderIndex: idx })),
        },
      },
      {
        onSettled: () => setLocalOrder(null),
      },
    );
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-3">
      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={openCreate} size="sm">
            <Plus className="size-4" />
            เพิ่ม item
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <div
          role="table"
          aria-label="Work progress grid"
          className="min-w-fit"
        >
          {/* Header */}
          <div
            role="row"
            className="grid border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="sticky left-0 z-[3] border-r border-border bg-muted/50" />
            <div className="sticky left-10 z-[3] border-r border-border bg-muted/50 px-3 py-2">
              หมวด
            </div>
            <div className="sticky left-[200px] z-[3] border-r border-border bg-muted/50 px-3 py-2">
              กิจกรรม
            </div>
            <div className="sticky left-[480px] z-[3] border-r border-border bg-muted/50 px-3 py-2">
              สถานะ
            </div>
            <div className="sticky left-[600px] z-[3] border-r border-border bg-muted/50 px-3 py-2 text-right">
              %
            </div>
            <div className="sticky left-[660px] z-[3] border-r border-border bg-muted/50 px-3 py-2">
              ระยะ
            </div>
            {periods.map((p) => (
              <div
                key={p.id}
                className="border-r border-border px-2 py-2 text-center"
              >
                {p.label}
              </div>
            ))}
            <div className="sticky right-0 z-[3] border-l border-border bg-muted/50" />
          </div>

          {/* Rows */}
          {items.length === 0 ? (
            <div className="bg-card px-6 py-12 text-center text-sm text-muted-foreground">
              ยังไม่มี item — กด &quot;เพิ่ม item&quot; เพื่อเริ่ม
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <PlanGridRow
                    key={item.id}
                    userId={userId}
                    planId={planId}
                    item={item}
                    periods={periods}
                    gridTemplate={gridTemplate}
                    onEdit={(i) => {
                      setEditing(i);
                      setDialogOpen(true);
                    }}
                    onDelete={(i) => setDeleteTarget(i)}
                    onOpenDetail={(i) => setDetailItem(i)}
                    readOnly={readOnly}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <ItemEditDialog
        userId={userId}
        planId={planId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
      />

      <ItemDetailSheet
        userId={userId}
        planId={planId}
        item={
          detailItem
            ? (items.find((i) => i.id === detailItem.id) ?? detailItem)
            : null
        }
        onClose={() => setDetailItem(null)}
        readOnly={readOnly}
      />

      <ConfirmAlert
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMut.mutateAsync({
            userId,
            planId,
            itemId: deleteTarget.id,
          });
          setDeleteTarget(null);
        }}
        title="ลบ item"
        message="ลบ item พร้อม marks / subtasks / attachments ทั้งหมด"
      />
    </div>
  );
}
