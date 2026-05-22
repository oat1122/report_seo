"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { MasterRowDialog } from "./MasterRowDialog";
import { useMarkTypes } from "../../hooks/useMasterTables";
import {
  useCreateMarkType,
  useUpdateMarkType,
  useDeactivateMaster,
} from "../../hooks/useMasterMutations";
import type {
  WorkProgressMarkType,
  UpsertMarkTypeInput,
  UpdateMarkTypeInput,
} from "@/features/work-progress";

export function MarkTypeManager() {
  const { data, isLoading } = useMarkTypes();
  const createMut = useCreateMarkType();
  const updateMut = useUpdateMarkType();
  const deactivateMut = useDeactivateMaster();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkProgressMarkType | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const submitting = createMut.isPending || updateMut.isPending;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const rows = (data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          สัญลักษณ์สำหรับเซลล์ period (PLANNED / IN_PROGRESS / COMPLETED /
          MISSED)
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="size-4" />
          เพิ่มสัญลักษณ์
        </Button>
      </div>

      <DataTable
        rows={rows}
        getRowKey={(r) => r.id}
        emptyState="ยังไม่มีสัญลักษณ์"
        columns={[
          {
            key: "code",
            header: "Code",
            cell: (r) => <span className="font-mono text-xs">{r.code}</span>,
            className: "w-40",
          },
          {
            key: "name",
            header: "ชื่อ",
            cell: (r) => (
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-4 rounded-sm"
                  style={
                    r.color
                      ? { backgroundColor: r.color }
                      : { backgroundColor: "var(--muted)" }
                  }
                  aria-hidden
                />
                <span>{r.name}</span>
                {r.icon && (
                  <span className="font-mono text-xs text-muted-foreground">
                    [{r.icon}]
                  </span>
                )}
                {r.isSystem && (
                  <Badge variant="secondary" className="text-xs">
                    system
                  </Badge>
                )}
              </div>
            ),
          },
          {
            key: "order",
            header: "ลำดับ",
            cell: (r) => r.orderIndex,
            align: "right",
            className: "w-20",
          },
          {
            key: "active",
            header: "สถานะ",
            cell: (r) =>
              r.isActive ? (
                <Badge variant="default">เปิดใช้</Badge>
              ) : (
                <Badge variant="outline">ปิด</Badge>
              ),
            className: "w-24",
          },
          {
            key: "actions",
            header: "",
            align: "right",
            className: "w-32",
            cell: (r) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(r);
                    setDialogOpen(true);
                  }}
                  aria-label="แก้ไข"
                >
                  <Pencil className="size-4" />
                </Button>
                {r.isActive && !r.isSystem && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmId(r.id)}
                    aria-label="ปิดใช้งาน"
                  >
                    <EyeOff className="size-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <MasterRowDialog
        kind="markType"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={async (body) => {
          if (editing) {
            await updateMut.mutateAsync({
              id: editing.id,
              body: body as UpdateMarkTypeInput,
            });
          } else {
            await createMut.mutateAsync(body as UpsertMarkTypeInput);
          }
          setDialogOpen(false);
        }}
        submitting={submitting}
      />

      <ConfirmAlert
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          if (!confirmId) return;
          await deactivateMut.mutateAsync({ kind: "markType", id: confirmId });
          setConfirmId(null);
        }}
        title="ปิดใช้งานสัญลักษณ์"
        message="สัญลักษณ์ที่ปิดใช้จะไม่ปรากฏใน Popover เลือก mark"
      />
    </div>
  );
}
