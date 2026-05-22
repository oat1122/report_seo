"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  subtasks: string[];
}

const empty: Form = {
  categoryId: "",
  activity: "",
  description: "",
  duration: "",
  weight: 1,
  subtasks: [],
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
  const [subtaskDraft, setSubtaskDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    setSubtaskDraft("");
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
      subtasks: (initial.subtasks ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((s) => s.title),
    });
  }, [open, initial]);

  const addSubtask = () => {
    const title = subtaskDraft.trim();
    if (!title) return;
    setForm((s) => ({ ...s, subtasks: [...s.subtasks, title] }));
    setSubtaskDraft("");
  };

  const removeSubtask = (idx: number) => {
    setForm((s) => ({
      ...s,
      subtasks: s.subtasks.filter((_, i) => i !== idx),
    }));
  };

  const isEdit = Boolean(initial);
  const activeCategories = (categories ?? []).filter((c) => c.isActive);

  const handleSubmit = async () => {
    const subtasks = form.subtasks
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((title, idx) => ({ title, orderIndex: idx }));

    const body: Record<string, unknown> = {
      categoryId: form.categoryId,
      activity: form.activity.trim(),
      description: form.description.trim() || null,
      duration: form.duration.trim() || null,
      weight: form.weight,
      subtasks,
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

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
              งานย่อย
            </h3>
            <div className="flex flex-col gap-2">
              {form.subtasks.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {form.subtasks.map((title, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
                    >
                      <span className="flex-1 text-sm">{title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="ลบ"
                        onClick={() => removeSubtask(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Input
                  className="h-8"
                  placeholder="เพิ่มงานย่อย..."
                  value={subtaskDraft}
                  maxLength={500}
                  onChange={(e) => setSubtaskDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addSubtask}
                  disabled={!subtaskDraft.trim()}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </section>
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
