"use client";

import { memo } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  WorkProgressCategory,
  WorkProgressTemplateItem,
} from "@/features/work-progress";

interface TemplateItemRowProps {
  item: WorkProgressTemplateItem;
  category: WorkProgressCategory | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

function TemplateItemRowInner({
  item,
  category,
  onEdit,
  onDelete,
}: TemplateItemRowProps) {
  const sortable = useSortable({ id: item.id });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[auto_140px_1fr_80px_80px_auto] items-center gap-2 rounded-md border border-border bg-card px-2 py-2",
        isDragging && "opacity-50",
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="ลากเพื่อเรียง"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Badge
        variant="outline"
        style={
          category?.color
            ? { borderColor: category.color, color: category.color }
            : undefined
        }
        className="justify-self-start text-xs"
      >
        {category?.name ?? "—"}
      </Badge>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item.activity}</p>
        {item.description && (
          <p className="truncate text-xs text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {item.duration ?? "—"}
      </span>
      <span className="text-xs tabular-nums">w: {item.weight}</span>
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" onClick={onEdit} aria-label="แก้ไข">
          <Pencil className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          aria-label="ลบ"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

export const TemplateItemRow = memo(TemplateItemRowInner);
