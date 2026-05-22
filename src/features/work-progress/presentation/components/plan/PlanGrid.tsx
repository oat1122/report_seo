"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Upload } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { PlanGridRow } from "./PlanGridRow";
import { ItemEditDialog } from "./ItemEditDialog";
import { ItemDetailSheet } from "../item/ItemDetailSheet";
import { BulkActionToolbar } from "./BulkActionToolbar";
import { ImportItemsSheet } from "./ImportItemsSheet";
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
  select: 40,
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
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<WorkProgressItemWithMarks | null>(null);
  const [detailItem, setDetailItem] =
    useState<WorkProgressItemWithMarks | null>(null);

  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.id));
    });
  }, [items]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const gridTemplate = `${COL_WIDTH.select}px ${COL_WIDTH.drag}px ${COL_WIDTH.category}px ${COL_WIDTH.activity}px ${COL_WIDTH.status}px ${COL_WIDTH.percent}px ${COL_WIDTH.duration}px repeat(${periods.length}, ${COL_WIDTH.period}px) ${COL_WIDTH.actions}px`;
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

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
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => setImportOpen(true)}
            size="sm"
            variant="outline"
          >
            <Upload className="size-4" />
            Import
          </Button>
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
            <div className="flex items-center justify-center border-r border-border">
              {!readOnly && items.length > 0 && (
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="เลือกทั้งหมด"
                />
              )}
            </div>
            <div className="border-r border-border" />
            <div className="border-r border-border px-3 py-2">หมวด</div>
            <div className="border-r border-border px-3 py-2">กิจกรรม</div>
            <div className="border-r border-border px-3 py-2">สถานะ</div>
            <div className="border-r border-border px-3 py-2 text-right">
              %
            </div>
            <div className="border-r border-border px-3 py-2">ระยะ</div>
            {periods.map((p) => (
              <div
                key={p.id}
                className="border-r border-border px-2 py-2 text-center"
              >
                {p.label}
              </div>
            ))}
            <div className="border-l border-border" />
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
                    selected={selectedIds.has(item.id)}
                    onToggleSelect={toggleSelect}
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

      {!readOnly && selectedIds.size > 0 && (
        <BulkActionToolbar
          userId={userId}
          planId={planId}
          periods={periods}
          selectedIds={Array.from(selectedIds)}
          onClear={clearSelection}
        />
      )}

      {!readOnly && (
        <ImportItemsSheet
          userId={userId}
          planId={planId}
          open={importOpen}
          onOpenChange={setImportOpen}
        />
      )}
    </div>
  );
}

