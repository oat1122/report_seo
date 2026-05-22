"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import {
  addTemplateItemSchema,
  updateTemplateItemSchema,
  type AddTemplateItemInput,
  type UpdateTemplateItemInput,
} from "@/features/work-progress/schemas";
import type { WorkProgressTemplateItem } from "@/features/work-progress/domain/WorkProgressTemplate";
import { useCategories } from "../../hooks/useMasterTables";
import {
  useAddTemplateItem,
  useUpdateTemplateItem,
} from "../../hooks/useTemplates";

interface TemplateItemDialogProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: WorkProgressTemplateItem | null;
}

interface Form {
  categoryId: string;
  activity: string;
  description: string;
  duration: string;
  weight: number;
}

const empty: Form = {
  categoryId: "",
  activity: "",
  description: "",
  duration: "",
  weight: 1,
};

export function TemplateItemDialog({
  templateId,
  open,
  onOpenChange,
  initial,
}: TemplateItemDialogProps) {
  const { data: categories } = useCategories();
  const addMut = useAddTemplateItem();
  const updateMut = useUpdateTemplateItem();
  const [form, setForm] = useState<Form>(empty);

  useEffect(() => {
    if (!open) return;
    if (!initial) {
      setForm(empty);
      return;
    }
    setForm({
      categoryId: initial.categoryId,
      activity: initial.activity,
      description: initial.description ?? "",
      duration: initial.duration ?? "",
      weight: initial.weight,
    });
  }, [open, initial]);

  const isEdit = Boolean(initial);
  const activeCategories = (categories ?? []).filter((c) => c.isActive);

  const handleSubmit = async () => {
    const body: Record<string, unknown> = {
      categoryId: form.categoryId,
      activity: form.activity.trim(),
      description: form.description.trim() || null,
      duration: form.duration.trim() || null,
      weight: form.weight,
    };

    if (isEdit && initial) {
      const parsed = updateTemplateItemSchema.safeParse(body);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
        return;
      }
      await updateMut.mutateAsync({
        templateId,
        itemId: initial.id,
        body: parsed.data as UpdateTemplateItemInput,
      });
    } else {
      const parsed = addTemplateItemSchema.safeParse(body);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
        return;
      }
      await addMut.mutateAsync({
        templateId,
        body: parsed.data as AddTemplateItemInput,
      });
    }
    onOpenChange(false);
  };

  const submitting = addMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไข item" : "เพิ่ม item"} ใน template
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ti-act">กิจกรรม</Label>
            <Input
              id="ti-act"
              value={form.activity}
              onChange={(e) =>
                setForm((s) => ({ ...s, activity: e.target.value }))
              }
              maxLength={2000}
              autoFocus={!isEdit}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>หมวด</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, categoryId: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="-- เลือก --" />
              </SelectTrigger>
              <SelectContent>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ti-desc">รายละเอียด</Label>
            <Textarea
              id="ti-desc"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              rows={2}
              maxLength={5000}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ti-dur">ระยะ</Label>
              <Input
                id="ti-dur"
                value={form.duration}
                onChange={(e) =>
                  setForm((s) => ({ ...s, duration: e.target.value }))
                }
                maxLength={100}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ti-w">น้ำหนัก</Label>
              <Input
                id="ti-w"
                type="number"
                min={1}
                max={100}
                value={form.weight}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    weight: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.activity.trim() || !form.categoryId || submitting}
          >
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
