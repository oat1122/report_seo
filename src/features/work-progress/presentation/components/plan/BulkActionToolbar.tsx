"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { useStatuses, useMarkTypes } from "../../hooks/useMasterTables";
import {
  useBulkUpdateItemStatus,
  useBulkDeleteItems,
  useBulkSetPeriodAcrossItems,
} from "../../hooks/useItemMutations";
import type { WorkProgressPeriod } from "@/features/work-progress";

interface BulkActionToolbarProps {
  userId: string;
  planId: string;
  periods: WorkProgressPeriod[];
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActionToolbar({
  userId,
  planId,
  periods,
  selectedIds,
  onClear,
}: BulkActionToolbarProps) {
  const { data: statuses = [] } = useStatuses();
  const { data: markTypes = [] } = useMarkTypes();
  const bulkStatus = useBulkUpdateItemStatus();
  const bulkDelete = useBulkDeleteItems();
  const bulkPeriod = useBulkSetPeriodAcrossItems();

  const [statusOpen, setStatusOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusId, setStatusId] = useState<string>("");
  const [periodId, setPeriodId] = useState<string>(periods[0]?.id ?? "");
  const [markTypeId, setMarkTypeId] = useState<string>("");

  const applyStatus = async () => {
    if (!statusId) return;
    await bulkStatus.mutateAsync({
      userId,
      planId,
      body: { itemIds: selectedIds, statusId },
    });
    toast.success(`อัปเดตสถานะ ${selectedIds.length} รายการ`);
    setStatusOpen(false);
    onClear();
  };

  const applyPeriod = async () => {
    if (!periodId) return;
    await bulkPeriod.mutateAsync({
      userId,
      planId,
      body: {
        periodId,
        itemIds: selectedIds,
        markTypeId: markTypeId || null,
      },
    });
    toast.success(`ตั้ง mark ${selectedIds.length} ช่อง`);
    setPeriodOpen(false);
    onClear();
  };

  const applyDelete = async () => {
    await bulkDelete.mutateAsync({
      userId,
      planId,
      body: { itemIds: selectedIds },
    });
    toast.success(`ลบ ${selectedIds.length} รายการ`);
    setConfirmDelete(false);
    onClear();
  };

  return (
    <div className="pointer-events-none sticky bottom-4 z-20 flex justify-center">
      <Card className="pointer-events-auto rounded-full border-2 border-primary/60 shadow-lg">
        <CardContent className="flex items-center gap-2 py-2 pl-3 pr-2">
          <Badge variant="secondary" className="rounded-full">
            เลือก {selectedIds.length}
          </Badge>

          <Popover open={statusOpen} onOpenChange={setStatusOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                เปลี่ยนสถานะ
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  เลือกสถานะใหม่
                </span>
                <Select value={statusId} onValueChange={setStatusId}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={applyStatus}
                  disabled={!statusId || bulkStatus.isPending}
                >
                  ยืนยัน
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                Mark period
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  ตั้ง mark ของ period นี้
                </span>
                <Select value={periodId} onValueChange={setPeriodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={markTypeId} onValueChange={setMarkTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก mark (ว่าง = ล้าง)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— ล้าง mark —</SelectItem>
                    {markTypes
                      .filter((m) => m.isActive)
                      .map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={applyPeriod}
                  disabled={!periodId || bulkPeriod.isPending}
                >
                  ยืนยัน
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" />
            ลบ
          </Button>

          <Button
            size="icon"
            variant="ghost"
            aria-label="ยกเลิกการเลือก"
            onClick={onClear}
          >
            <X className="size-4" />
          </Button>
        </CardContent>
      </Card>

      <ConfirmAlert
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={applyDelete}
        title={`ลบ ${selectedIds.length} รายการ`}
        message="ลบรายการที่เลือกพร้อม marks / subtasks / attachments — ย้อนกลับไม่ได้"
      />
    </div>
  );
}
