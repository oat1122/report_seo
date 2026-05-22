"use client";

import { memo } from "react";
import { GripVertical, ListChecks, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TemplatePeriodCell } from "./TemplatePeriodCell";
import type {
  WorkProgressCategory,
  WorkProgressMarkType,
  WorkProgressTemplateItem,
} from "@/features/work-progress";
import {
  parseTemplateDefaultPeriods,
  type TemplateDefaultPeriods,
} from "../../../domain/policies/template-default-periods";

interface TemplateGridRowProps {
  item: WorkProgressTemplateItem;
  category: WorkProgressCategory | undefined;
  periodSeqs: number[];
  markTypes: WorkProgressMarkType[];
  gridTemplate: string;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChangePeriodMark: (
    itemId: string,
    nextDefaultPeriods: TemplateDefaultPeriods,
  ) => void;
}

function TemplateGridRowInner({
  item,
  category,
  periodSeqs,
  markTypes,
  gridTemplate,
  disabled,
  onEdit,
  onDelete,
  onChangePeriodMark,
}: TemplateGridRowProps) {
  const sortable = useSortable({ id: item.id });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const defaults = parseTemplateDefaultPeriods(item.defaultPeriods);

  const handleCellChange = (seq: number, markTypeId: string | null) => {
    const next: TemplateDefaultPeriods = { ...defaults };
    if (markTypeId) {
      next[String(seq)] = { markTypeId };
    } else {
      delete next[String(seq)];
    }
    onChangePeriodMark(item.id, next);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, gridTemplateColumns: gridTemplate }}
      className={cn(
        "grid items-stretch border-b border-border bg-card text-sm last:border-b-0",
        isDragging && "opacity-50",
      )}
      role="row"
    >
      <div className="flex items-center justify-center border-r border-border">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="ลากเพื่อเรียง"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      <div className="flex items-center border-r border-border px-2 py-2">
        <Badge
          variant="outline"
          style={
            category?.color
              ? { borderColor: category.color, color: category.color }
              : undefined
          }
          className="text-xs"
        >
          {category?.name ?? "—"}
        </Badge>
      </div>
      <div className="flex min-w-0 flex-col justify-center border-r border-border px-2 py-2">
        <p className="truncate text-sm font-medium">{item.activity}</p>
        {item.description && (
          <p className="truncate text-xs text-muted-foreground">
            {item.description}
          </p>
        )}
        {item.subtasks && item.subtasks.length > 0 && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <ListChecks className="size-3" />
            {item.subtasks.length} งานย่อย
          </p>
        )}
      </div>
      <div className="flex items-center border-r border-border px-2 py-2 text-xs text-muted-foreground">
        {item.duration ?? "—"}
      </div>
      {periodSeqs.map((seq) => (
        <div
          key={seq}
          className="flex items-stretch justify-stretch border-r border-border"
        >
          <TemplatePeriodCell
            markTypeId={defaults[String(seq)]?.markTypeId ?? null}
            markTypes={markTypes}
            disabled={disabled}
            onChange={(markTypeId) => handleCellChange(seq, markTypeId)}
          />
        </div>
      ))}
      <div className="flex items-center justify-end gap-1 px-1 py-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onEdit}
          aria-label="แก้ไข"
          disabled={disabled}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          aria-label="ลบ"
          disabled={disabled}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export const TemplateGridRow = memo(TemplateGridRowInner);
