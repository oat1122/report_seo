"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ColorPickerInput } from "./ColorPickerInput";
import { toast } from "react-toastify";
import {
  upsertCategorySchema,
  upsertStatusSchema,
  upsertMarkTypeSchema,
  type MasterKindCode,
} from "@/features/work-progress/schemas";
import type {
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
} from "@/features/work-progress/domain/WorkProgressMaster";

type MasterRow = WorkProgressCategory | WorkProgressStatus | WorkProgressMarkType;

type FormState = {
  code: string;
  name: string;
  description: string;
  color: string | null;
  icon: string;
  orderIndex: number;
  isActive: boolean;
  isTerminal: boolean;
  isDefault: boolean;
};

const empty: FormState = {
  code: "",
  name: "",
  description: "",
  color: null,
  icon: "",
  orderIndex: 0,
  isActive: true,
  isTerminal: false,
  isDefault: false,
};

interface MasterRowDialogProps {
  kind: MasterKindCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: MasterRow | null;
  onSubmit: (body: Record<string, unknown>) => Promise<void> | void;
  submitting?: boolean;
}

const titleLabel: Record<MasterKindCode, string> = {
  category: "หมวด (Category)",
  status: "สถานะ (Status)",
  markType: "สัญลักษณ์ (Mark Type)",
};

export function MasterRowDialog({
  kind,
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: MasterRowDialogProps) {
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (!open) return;
    if (!initial) {
      setForm(empty);
      return;
    }
    setForm({
      code: initial.code,
      name: initial.name,
      description:
        "description" in initial ? (initial.description ?? "") : "",
      color: initial.color ?? null,
      icon: "icon" in initial ? (initial.icon ?? "") : "",
      orderIndex: initial.orderIndex,
      isActive: initial.isActive,
      isTerminal: "isTerminal" in initial ? initial.isTerminal : false,
      isDefault: "isDefault" in initial ? initial.isDefault : false,
    });
  }, [open, initial]);

  const isEdit = Boolean(initial);

  const handleSubmit = async () => {
    const body: Record<string, unknown> = {
      code: form.code,
      name: form.name,
      color: form.color ?? null,
      orderIndex: form.orderIndex,
      isActive: form.isActive,
    };
    if (kind === "category") {
      body.description = form.description || null;
      body.icon = form.icon || null;
    }
    if (kind === "markType") {
      body.icon = form.icon || null;
    }
    if (kind === "status") {
      body.isTerminal = form.isTerminal;
      body.isDefault = form.isDefault;
    }

    const schema =
      kind === "category"
        ? upsertCategorySchema
        : kind === "status"
          ? upsertStatusSchema
          : upsertMarkTypeSchema;

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    await onSubmit(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไข" : "เพิ่ม"} {titleLabel[kind]}
          </DialogTitle>
          <DialogDescription>
            code ใช้อ้างอิงทางโปรแกรม · name ใช้แสดงผล
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="mrd-code">Code (UPPER_SNAKE_CASE)</Label>
            <Input
              id="mrd-code"
              value={form.code}
              onChange={(e) =>
                setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))
              }
              placeholder="เช่น KEYWORD_INTENT"
              maxLength={50}
              className="font-mono"
              autoFocus={!isEdit}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mrd-name">ชื่อ</Label>
            <Input
              id="mrd-name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              maxLength={100}
            />
          </div>

          {kind === "category" && (
            <div className="grid gap-2">
              <Label htmlFor="mrd-desc">รายละเอียด</Label>
              <Textarea
                id="mrd-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                rows={3}
                maxLength={2000}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>สี</Label>
              <ColorPickerInput
                value={form.color}
                onChange={(v) => setForm((s) => ({ ...s, color: v }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mrd-order">ลำดับ</Label>
              <Input
                id="mrd-order"
                type="number"
                min={0}
                value={form.orderIndex}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    orderIndex: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          {(kind === "category" || kind === "markType") && (
            <div className="grid gap-2">
              <Label htmlFor="mrd-icon">Icon (lucide-react name)</Label>
              <Input
                id="mrd-icon"
                value={form.icon}
                onChange={(e) =>
                  setForm((s) => ({ ...s, icon: e.target.value }))
                }
                placeholder="เช่น Target, Layers"
                maxLength={50}
              />
            </div>
          )}

          {kind === "status" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">สถานะปลาย (Terminal)</p>
                  <p className="text-xs text-muted-foreground">
                    เช่น COMPLETED, CANCELLED — งานเสร็จไม่ดำเนินต่อ
                  </p>
                </div>
                <Switch
                  checked={form.isTerminal}
                  onCheckedChange={(v) =>
                    setForm((s) => ({ ...s, isTerminal: v }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">เป็นค่าเริ่มต้น</p>
                  <p className="text-xs text-muted-foreground">
                    item ใหม่ใช้สถานะนี้ — ระบบจัดให้มีเพียง 1
                  </p>
                </div>
                <Switch
                  checked={form.isDefault}
                  onCheckedChange={(v) =>
                    setForm((s) => ({ ...s, isDefault: v }))
                  }
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
            <Label htmlFor="mrd-active" className="cursor-pointer">
              เปิดใช้งาน
            </Label>
            <Switch
              id="mrd-active"
              checked={form.isActive}
              onCheckedChange={(v) => setForm((s) => ({ ...s, isActive: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
