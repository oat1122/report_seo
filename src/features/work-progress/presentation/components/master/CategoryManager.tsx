"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { MasterRowDialog } from "./MasterRowDialog";
import { useCategories } from "../../hooks/useMasterTables";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeactivateMaster,
} from "../../hooks/useMasterMutations";
import type {
  WorkProgressCategory,
  UpsertCategoryInput,
  UpdateCategoryInput,
} from "@/features/work-progress";

export function CategoryManager() {
  const { data, isLoading } = useCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deactivateMut = useDeactivateMaster();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkProgressCategory | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (row: WorkProgressCategory) => {
    setEditing(row);
    setDialogOpen(true);
  };

  const handleSubmit = async (body: Record<string, unknown>) => {
    if (editing) {
      await updateMut.mutateAsync({
        id: editing.id,
        body: body as UpdateCategoryInput,
      });
    } else {
      await createMut.mutateAsync(body as UpsertCategoryInput);
    }
    setDialogOpen(false);
  };

  const submitting = createMut.isPending || updateMut.isPending;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const rows = (data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          หมวดของกิจกรรมในแผนงาน · ปิดใช้งานเพื่อซ่อนจากตัวเลือก
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="size-4" />
          เพิ่มหมวด
        </Button>
      </div>

      <DataTable
        rows={rows}
        getRowKey={(r) => r.id}
        emptyState="ยังไม่มีหมวด — เพิ่มใหม่ได้"
        columns={[
          {
            key: "code",
            header: "Code",
            cell: (r) => (
              <span className="font-mono text-xs">{r.code}</span>
            ),
            className: "w-40",
          },
          {
            key: "name",
            header: "ชื่อ",
            cell: (r) => (
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-3 rounded-sm"
                  style={
                    r.color
                      ? { backgroundColor: r.color }
                      : { backgroundColor: "var(--muted)" }
                  }
                  aria-hidden
                />
                <span>{r.name}</span>
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
                  onClick={() => openEdit(r)}
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
        kind="category"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <ConfirmAlert
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          if (!confirmId) return;
          await deactivateMut.mutateAsync({ kind: "category", id: confirmId });
          setConfirmId(null);
        }}
        title="ปิดใช้งานหมวด"
        message="หมวดที่ปิดใช้จะไม่ปรากฏในตัวเลือก แต่ item ที่ใช้อยู่จะยังคงอยู่ ดำเนินการต่อ?"
      />
    </div>
  );
}
