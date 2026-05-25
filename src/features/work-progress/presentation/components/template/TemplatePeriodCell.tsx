"use client";

import { memo, useState } from "react";
import { Check, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkProgressMarkType } from "@/features/work-progress";

interface TemplatePeriodCellProps {
  markTypeId: string | null;
  markTypes: WorkProgressMarkType[];
  disabled?: boolean;
  onChange: (markTypeId: string | null) => void;
}

function TemplatePeriodCellInner({
  markTypeId,
  markTypes,
  disabled,
  onChange,
}: TemplatePeriodCellProps) {
  const [open, setOpen] = useState(false);
  const active = markTypes.find((m) => m.id === markTypeId) ?? null;
  const bgStyle = active?.color
    ? { backgroundColor: active.color }
    : undefined;

  if (disabled) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center text-xs",
          !active && "text-muted-foreground/40",
        )}
        style={bgStyle}
      >
        {active ? (
          <Check className="size-4 text-white drop-shadow" />
        ) : (
          "·"
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-full w-full cursor-pointer transition hover:ring-2 hover:ring-primary/40",
            !active && "bg-muted/50",
          )}
          style={bgStyle}
          aria-label={active ? `mark: ${active.name}` : "ว่าง"}
        >
          {active ? (
            <Check className="mx-auto size-4 text-white drop-shadow" />
          ) : (
            <span className="text-xs text-muted-foreground/40">·</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex flex-col gap-1">
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
            ประเภท mark
          </p>
          {markTypes.length === 0 ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              ยังไม่มี mark type — แอดมินต้องเพิ่มก่อน
            </p>
          ) : (
            markTypes.map((m) => (
              <button
                key={m.id}
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                  m.id === markTypeId && "bg-muted",
                )}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
              >
                <span
                  className="inline-block size-3 rounded-sm border border-border"
                  style={m.color ? { backgroundColor: m.color } : undefined}
                />
                <span className="flex-1 truncate">{m.name}</span>
                {m.id === markTypeId && <Check className="size-3.5" />}
              </button>
            ))
          )}
          {active && (
            <>
              <div className="mt-1 border-t border-border" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <X className="size-3.5" />
                ลบ mark
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const TemplatePeriodCell = memo(TemplatePeriodCellInner);
