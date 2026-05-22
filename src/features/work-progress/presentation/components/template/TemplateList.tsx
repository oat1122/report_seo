"use client";

import { useState } from "react";
import Link from "next/link";
import { FileStack, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { toast } from "react-toastify";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
} from "../../hooks/useTemplates";
import {
  upsertTemplateSchema,
  type UpsertTemplateInput,
} from "@/features/work-progress/schemas";
import type { WorkProgressTemplate } from "@/features/work-progress/domain/WorkProgressTemplate";

const PERIOD_LABEL: Record<string, string> = {
  YEAR_12_MONTHS: "12 เดือน",
  YEAR_4_QUARTERS: "4 ไตรมาส",
  HALF_2_PERIODS: "ครึ่งปี",
  CUSTOM: "กำหนดเอง",
};

interface TemplateListProps {
  basePath: string;
}

export function TemplateList({ basePath }: TemplateListProps) {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useTemplates({ includeInactive });
  const deleteMut = useDeleteTemplate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="t-incl-inactive"
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
          />
          <Label htmlFor="t-incl-inactive" className="cursor-pointer text-sm">
            แสดง template ที่ปิดใช้
          </Label>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          สร้าง template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-12 text-center">
          <FileStack className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">ยังไม่มี template</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((t) => (
            <TemplateCard
              key={t.id}
              tpl={t}
              href={`${basePath}/${t.id}`}
              onDelete={() => setDeleteId(t.id)}
            />
          ))}
        </div>
      )}

      <CreateTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        basePath={basePath}
      />

      <ConfirmAlert
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await deleteMut.mutateAsync({ id: deleteId });
          setDeleteId(null);
        }}
        title="ลบ template"
        message="ลบ template นี้ (system template ลบไม่ได้)"
      />
    </div>
  );
}

interface TemplateCardProps {
  tpl: WorkProgressTemplate;
  href: string;
  onDelete: () => void;
}

function TemplateCard({ tpl, href, onDelete }: TemplateCardProps) {
  return (
    <Card className={tpl.isActive ? undefined : "opacity-70"}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <Link href={href} className="flex flex-1 items-start gap-2">
          <FileStack className="mt-0.5 size-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-semibold">{tpl.name}</span>
            <div className="mt-1 flex flex-wrap gap-1 text-xs">
              <Badge variant="secondary">
                {PERIOD_LABEL[tpl.periodType] ?? tpl.periodType}
              </Badge>
              {tpl.isSystem && <Badge variant="outline">system</Badge>}
              {!tpl.isActive && <Badge variant="outline">ปิด</Badge>}
            </div>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="เมนู">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={href}>
                <Pencil className="size-4" />
                แก้ไข
              </Link>
            </DropdownMenuItem>
            {!tpl.isSystem && (
              <DropdownMenuItem onClick={onDelete} variant="destructive">
                <Trash2 className="size-4" />
                ลบ
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Link href={href}>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {tpl.description ?? "—"}
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePath: string;
}

function CreateTemplateDialog({
  open,
  onOpenChange,
}: CreateTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [periodType, setPeriodType] = useState("YEAR_12_MONTHS");
  const createMut = useCreateTemplate();

  const handleSubmit = async () => {
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      periodType,
      isActive: true,
    };
    const parsed = upsertTemplateSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }
    await createMut.mutateAsync(parsed.data as UpsertTemplateInput);
    setName("");
    setDescription("");
    setPeriodType("YEAR_12_MONTHS");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้าง template</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ct-name">ชื่อ</Label>
            <Input
              id="ct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ct-desc">รายละเอียด</Label>
            <Textarea
              id="ct-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={5000}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>รูปแบบ period</Label>
            <Select value={periodType} onValueChange={setPeriodType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YEAR_12_MONTHS">12 เดือน</SelectItem>
                <SelectItem value="YEAR_4_QUARTERS">4 ไตรมาส</SelectItem>
                <SelectItem value="HALF_2_PERIODS">ครึ่งปี</SelectItem>
                <SelectItem value="CUSTOM">กำหนดเอง</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createMut.isPending}
          >
            สร้าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
