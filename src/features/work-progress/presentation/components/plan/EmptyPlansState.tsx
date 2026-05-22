"use client";

import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPlansStateProps {
  onCreate?: () => void;
  readOnly?: boolean;
}

export function EmptyPlansState({ onCreate, readOnly }: EmptyPlansStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ClipboardList className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">ยังไม่มีแผนงาน</h3>
        <p className="text-sm text-muted-foreground">
          {readOnly
            ? "ยังไม่มีแผนงานที่เปิดให้ดู"
            : "สร้างใหม่จากศูนย์ ใช้ template หรือ clone จากแผนเดิม"}
        </p>
      </div>
      {!readOnly && onCreate && (
        <Button onClick={onCreate}>
          <Plus className="size-4" />
          สร้างแผนงาน
        </Button>
      )}
    </div>
  );
}
