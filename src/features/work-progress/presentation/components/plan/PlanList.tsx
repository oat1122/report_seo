"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  ClipboardList,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";
import { EmptyPlansState } from "./EmptyPlansState";
import { CreatePlanDialog } from "./CreatePlanDialog";
import { EditPlanDialog } from "./EditPlanDialog";
import {
  useArchivePlan,
  useDeletePlan,
  useWorkProgressPlans,
} from "../../hooks/useWorkProgressPlans";
import type { WorkProgressPlan } from "@/features/work-progress";

const PERIOD_LABEL: Record<string, string> = {
  YEAR_12_MONTHS: "12 เดือน",
  YEAR_4_QUARTERS: "4 ไตรมาส",
  HALF_2_PERIODS: "ครึ่งปี",
  CUSTOM: "กำหนดเอง",
};

interface PlanListProps {
  userId: string;
  basePath: string; // e.g. /admin/customers/[userId]/work-progress
  readOnly?: boolean;
}

export function PlanList({ userId, basePath, readOnly }: PlanListProps) {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<WorkProgressPlan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useWorkProgressPlans(userId, {
    includeArchived: readOnly ? false : includeArchived,
  });
  const archiveMut = useArchivePlan();
  const deleteMut = useDeletePlan();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const plans = data ?? [];
  const hasPlans = plans.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {!readOnly && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              id="show-archived"
              checked={includeArchived}
              onCheckedChange={setIncludeArchived}
            />
            <Label htmlFor="show-archived" className="cursor-pointer text-sm">
              แสดงที่เก็บถาวร
            </Label>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            สร้างแผนงาน
          </Button>
        </div>
      )}

      {!hasPlans ? (
        <EmptyPlansState
          onCreate={() => setCreateOpen(true)}
          readOnly={readOnly}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              href={`${basePath}/${plan.id}`}
              readOnly={readOnly}
              onEdit={() => setEditPlan(plan)}
              onArchiveToggle={() =>
                archiveMut.mutate({
                  userId,
                  planId: plan.id,
                  isArchived: !plan.isArchived,
                })
              }
              onDelete={() => setDeleteId(plan.id)}
            />
          ))}
        </div>
      )}

      {!readOnly && (
        <>
          <CreatePlanDialog
            userId={userId}
            open={createOpen}
            onOpenChange={setCreateOpen}
          />

          {editPlan && (
            <EditPlanDialog
              userId={userId}
              plan={editPlan}
              open={!!editPlan}
              onOpenChange={(open) => {
                if (!open) setEditPlan(null);
              }}
            />
          )}

          <ConfirmAlert
            open={deleteId !== null}
            onClose={() => setDeleteId(null)}
            onConfirm={async () => {
              if (!deleteId) return;
              await deleteMut.mutateAsync({ userId, planId: deleteId });
              setDeleteId(null);
            }}
            title="ลบแผนงาน"
            message="ลบแผนนี้พร้อม items / marks / subtasks ทั้งหมด — การกระทำนี้ย้อนกลับไม่ได้"
          />
        </>
      )}
    </div>
  );
}

interface PlanCardProps {
  plan: WorkProgressPlan;
  href: string;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}

function PlanCard({
  plan,
  href,
  onEdit,
  onArchiveToggle,
  onDelete,
  readOnly,
}: PlanCardProps) {
  return (
    <Card
      className={
        plan.isArchived
          ? "opacity-70 transition hover:opacity-100"
          : "transition hover:border-primary/40"
      }
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <Link
          href={href}
          className="flex flex-1 items-start gap-2 outline-none focus-visible:underline"
        >
          <ClipboardList className="mt-0.5 size-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="line-clamp-2 font-semibold">{plan.title}</span>
            {plan.packageName && (
              <span className="text-xs text-muted-foreground">
                {plan.packageName}
              </span>
            )}
          </div>
        </Link>
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="เมนู">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchiveToggle}>
                {plan.isArchived ? (
                  <>
                    <ArchiveRestore className="size-4" />
                    คืนจากที่เก็บ
                  </>
                ) : (
                  <>
                    <Archive className="size-4" />
                    เก็บถาวร
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} variant="destructive">
                <Trash2 className="size-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <Link href={href} className="block">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">{PERIOD_LABEL[plan.periodType] ?? plan.periodType}</Badge>
            {plan.year && <Badge variant="outline">{plan.year}</Badge>}
            {plan.isArchived && (
              <Badge variant="outline" className="gap-1">
                <Archive className="size-3" />
                เก็บถาวร
              </Badge>
            )}
          </div>
          {plan.note && (
            <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
              {plan.note}
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
