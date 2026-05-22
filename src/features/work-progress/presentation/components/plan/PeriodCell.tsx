"use client";

import { memo, useState } from "react";
import { Check, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMarkTypes } from "../../hooks/useMasterTables";
import {
  useClearPeriodMark,
  useSetPeriodMark,
} from "../../hooks/useSetPeriodMark";
import type {
  WorkProgressMarkType,
  WorkProgressPeriodMarkWithType,
} from "@/features/work-progress";

interface PeriodCellProps {
  userId: string;
  planId: string;
  itemId: string;
  periodId: string;
  mark: WorkProgressPeriodMarkWithType | undefined;
  readOnly?: boolean;
}

function PeriodCellInner({
  userId,
  planId,
  itemId,
  periodId,
  mark,
  readOnly,
}: PeriodCellProps) {
  const [open, setOpen] = useState(false);
  const [markTypeId, setMarkTypeId] = useState<string>(mark?.markTypeId ?? "");
  const [percent, setPercent] = useState<string>(
    mark?.progressPercent != null ? String(mark.progressPercent) : "",
  );
  const [note, setNote] = useState(mark?.note ?? "");

  const { data: markTypes } = useMarkTypes();
  const setMut = useSetPeriodMark();
  const clearMut = useClearPeriodMark();

  const reset = () => {
    setMarkTypeId(mark?.markTypeId ?? "");
    setPercent(mark?.progressPercent != null ? String(mark.progressPercent) : "");
    setNote(mark?.note ?? "");
  };

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    setOpen(next);
  };

  const activeMarkTypes = (markTypes ?? []).filter((m) => m.isActive);
  const selectedType: WorkProgressMarkType | null =
    activeMarkTypes.find((m) => m.id === markTypeId) ?? null;

  const handleSave = async () => {
    if (!markTypeId) return;
    const p = percent.trim();
    const parsedPercent = p ? Number(p) : null;
    if (p && (Number.isNaN(parsedPercent) || parsedPercent! < 0 || parsedPercent! > 100)) {
      return;
    }
    await setMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: {
        periodId,
        markTypeId,
        progressPercent: parsedPercent,
        note: note.trim() || null,
      },
      markType: selectedType,
    });
    setOpen(false);
  };

  const handleClear = async () => {
    if (!mark) {
      setOpen(false);
      return;
    }
    await clearMut.mutateAsync({ userId, planId, itemId, periodId });
    setOpen(false);
  };

  const bgStyle = mark?.markType.color
    ? { backgroundColor: mark.markType.color }
    : undefined;

  if (readOnly) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center text-xs",
          !mark && "text-muted-foreground/40",
        )}
        style={bgStyle}
        title={mark ? `${mark.markType.name}${mark.progressPercent != null ? ` · ${mark.progressPercent}%` : ""}` : ""}
      >
        {mark ? (
          mark.progressPercent != null ? (
            <span className="font-medium text-white drop-shadow">
              {mark.progressPercent}%
            </span>
          ) : (
            <Check className="size-4 text-white drop-shadow" />
          )
        ) : (
          "·"
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-full w-full cursor-pointer transition hover:ring-2 hover:ring-primary/40",
            !mark && "bg-muted/30",
          )}
          style={bgStyle}
          aria-label={mark ? `mark: ${mark.markType.name}` : "ว่าง"}
        >
          {mark ? (
            mark.progressPercent != null ? (
              <span className="text-xs font-medium text-white drop-shadow">
                {mark.progressPercent}%
              </span>
            ) : (
              <Check className="mx-auto size-4 text-white drop-shadow" />
            )
          ) : (
            <span className="text-xs text-muted-foreground/40">·</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label className="text-xs">สัญลักษณ์</Label>
            <div className="flex flex-wrap gap-1">
              {activeMarkTypes.map((mt) => (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => setMarkTypeId(mt.id)}
                  className={cn(
                    "flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs transition",
                    markTypeId === mt.id
                      ? "ring-2 ring-primary"
                      : "hover:border-primary/40",
                  )}
                  style={mt.color ? { backgroundColor: mt.color, color: "#fff" } : undefined}
                >
                  {mt.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor={`pc-pct-${itemId}-${periodId}`} className="text-xs">
                %
              </Label>
              <Input
                id={`pc-pct-${itemId}-${periodId}`}
                type="number"
                min={0}
                max={100}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="0-100"
                className="h-8"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor={`pc-note-${itemId}-${periodId}`} className="text-xs">
              หมายเหตุ
            </Label>
            <Textarea
              id={`pc-note-${itemId}-${periodId}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          <div className="flex justify-between gap-2 pt-1">
            {mark ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                <X className="size-4" />
                ลบ
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!markTypeId || setMut.isPending}
              >
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const PeriodCell = memo(PeriodCellInner);
