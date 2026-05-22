"use client";

import { memo } from "react";
import { GripVertical, MoreHorizontal, Pencil, PanelRight, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PeriodCell } from "./PeriodCell";
import type {
  WorkProgressItemWithMarks,
  WorkProgressPeriod,
} from "@/features/work-progress";

interface PlanGridRowProps {
  userId: string;
  planId: string;
  item: WorkProgressItemWithMarks;
  periods: WorkProgressPeriod[];
  gridTemplate: string;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (item: WorkProgressItemWithMarks) => void;
  onDelete: (item: WorkProgressItemWithMarks) => void;
  onOpenDetail: (item: WorkProgressItemWithMarks) => void;
  readOnly?: boolean;
}

function PlanGridRowInner({
  userId,
  planId,
  item,
  periods,
  gridTemplate,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenDetail,
  readOnly,
}: PlanGridRowProps) {
  const sortable = useSortable({ id: item.id, disabled: readOnly });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridTemplateColumns: gridTemplate,
  } as React.CSSProperties;

  const marksByPeriod = new Map(item.periodMarks.map((m) => [m.periodId, m]));
  const rowBg = selected ? "bg-secondary/20" : "bg-card";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid border-b border-border",
        rowBg,
        isDragging && "z-10 opacity-50",
      )}
    >
      {/* Select */}
      <div className="flex items-center justify-center border-r border-border">
        {!readOnly && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(item.id)}
            aria-label={`เลือก ${item.activity}`}
          />
        )}
      </div>

      {/* Drag */}
      <div className="flex items-center justify-center border-r border-border">
        {!readOnly && (
          <button
            type="button"
            aria-label="ลากเพื่อเรียง"
            className="flex h-full w-full cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 border-r border-border px-3 py-2">
        <span
          className="inline-block size-2.5 rounded-sm"
          style={
            item.category.color
              ? { backgroundColor: item.category.color }
              : { backgroundColor: "var(--muted)" }
          }
          aria-hidden
        />
        <span className="truncate text-xs">{item.category.name}</span>
      </div>

      {/* Activity */}
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="flex flex-col justify-center border-r border-border px-3 py-2 text-left transition hover:bg-muted/30 focus-visible:bg-muted/50"
      >
        <span className="line-clamp-2 text-sm font-medium">{item.activity}</span>
        {item.description && (
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {item.description}
          </span>
        )}
      </button>

      {/* Status */}
      <div className="flex items-center border-r border-border px-3 py-2">
        <Badge
          variant="outline"
          style={
            item.status.color
              ? { borderColor: item.status.color, color: item.status.color }
              : undefined
          }
          className="text-xs"
        >
          {item.status.name}
        </Badge>
      </div>

      {/* % */}
      <div className="flex items-center justify-end border-r border-border px-3 py-2 text-sm font-medium tabular-nums">
        {item.progressPercent}%
      </div>

      {/* Duration */}
      <div className="flex items-center border-r border-border px-3 py-2 text-xs text-muted-foreground">
        {item.duration ?? "—"}
      </div>

      {/* Period cells */}
      {periods.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-center border-r border-border"
        >
          <PeriodCell
            userId={userId}
            planId={planId}
            itemId={item.id}
            periodId={p.id}
            mark={marksByPeriod.get(p.id)}
            readOnly={readOnly}
          />
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center justify-center border-l border-border">
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="เมนู">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpenDetail(item)}>
                <PanelRight className="size-4" />
                เปิด detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="size-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                variant="destructive"
              >
                <Trash2 className="size-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export const PlanGridRow = memo(PlanGridRowInner);
