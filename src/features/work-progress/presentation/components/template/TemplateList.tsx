"use client";

import { useState } from "react";
import Link from "next/link";
import { FileStack, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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

interface TemplateListProps {
  basePath: string;
}

export function TemplateList({ basePath }: TemplateListProps) {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useTemplates({ includeInactive });
  const deleteMut = useDeleteTemplate();

  const templates = data ?? [];

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-12 text-center">
            <FileStack className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ยังไม่มี template</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {templates.map((t) => (
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
      </CardContent>
    </Card>
  );
}

interface TemplateCardProps {
  tpl: WorkProgressTemplate;
  href: string;
  onDelete: () => void;
}

function TemplateCard({ tpl, href, onDelete }: TemplateCardProps) {
  const hasDescription = Boolean(tpl.description?.trim());
  const updatedLabel = new Date(tpl.updatedAt).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  return (
    <Card
      className={`group relative transition-all hover:shadow-md hover:ring-foreground/20 ${
        tpl.isActive ? "" : "opacity-60"
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-foreground ring-1 ring-secondary/30 transition-colors group-hover:bg-secondary/30">
            <FileStack className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="line-clamp-1 text-base font-semibold leading-snug">
              {tpl.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {tpl.durationMonths} เดือน
            </span>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="เมนู"
              className="-mr-1.5 -mt-1.5 opacity-60 transition-opacity group-hover:opacity-100"
            >
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
        <Link href={href} className="block">
          <p
            className={`line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed ${
              hasDescription
                ? "text-foreground/75"
                : "italic text-muted-foreground/60"
            }`}
          >
            {hasDescription ? tpl.description : "ยังไม่ได้เพิ่มรายละเอียด"}
          </p>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 bg-muted/30 py-2.5">
        <div className="flex items-center gap-1.5">
          {tpl.isSystem && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              SYSTEM
            </Badge>
          )}
          {!tpl.isActive && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              ปิดใช้
            </Badge>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          อัปเดต {updatedLabel}
        </span>
      </CardFooter>
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
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const createMut = useCreateTemplate();

  const handleSubmit = async () => {
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      periodType: "YEAR_12_MONTHS",
      durationMonths,
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
    setDurationMonths(12);
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
            <Label htmlFor="ct-duration">จำนวนเดือน</Label>
            <Select
              value={String(durationMonths)}
              onValueChange={(v) => setDurationMonths(Number(v))}
            >
              <SelectTrigger id="ct-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 6, 9, 12, 18, 24, 36, 48, 60].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} เดือน
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Template เก็บแค่จำนวนเดือน — เดือนเริ่มจริงจะระบุตอนสร้างแผน
            </p>
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
