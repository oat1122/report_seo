"use client";

import { useState } from "react";
import { Plus, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListPaymentPlans,
  useCancelPaymentPlan,
} from "../../hooks/usePaymentPlans";
import { PaymentPlanForm } from "./PaymentPlanForm";
import type { PaymentPlan } from "../../../index";

interface PaymentPlanListProps {
  customerId: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ACTIVE: { label: "ใช้งาน", variant: "default" },
  COMPLETED: { label: "เสร็จสิ้น", variant: "secondary" },
  CANCELLED: { label: "ยกเลิก", variant: "destructive" },
};

const TYPE_LABEL: Record<string, string> = {
  MONTHLY: "รายเดือน",
  INSTALLMENT: "ผ่อนชำระ",
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}

export function PaymentPlanList({ customerId }: PaymentPlanListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
  const { data: plans, isLoading } = useListPaymentPlans(customerId);
  const cancelMutation = useCancelPaymentPlan();

  const handleEdit = (plan: PaymentPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleCancel = (plan: PaymentPlan) => {
    if (!confirm("ยืนยันยกเลิกแผนชำระเงินนี้?")) return;
    cancelMutation.mutate({ customerId, planId: plan.id });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">แผนชำระเงิน</h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 size-4" />
          สร้างแผนใหม่
        </Button>
      </div>

      {plans?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ยังไม่มีแผนชำระเงิน
          </CardContent>
        </Card>
      )}

      {plans?.map((plan) => {
        const badge = STATUS_BADGE[plan.status] ?? STATUS_BADGE.ACTIVE;
        return (
          <Card key={plan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{plan.description}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{TYPE_LABEL[plan.type]}</span>
                    <span>·</span>
                    <span>{formatCurrency(plan.amount)}/งวด</span>
                    {plan.type === "MONTHLY" && plan.billingDay && (
                      <>
                        <span>·</span>
                        <span>ทุกวันที่ {plan.billingDay}</span>
                      </>
                    )}
                    {plan.type === "INSTALLMENT" && plan.totalInstallments && (
                      <>
                        <span>·</span>
                        <span>{plan.totalInstallments} งวด</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  เริ่ม {formatDate(plan.startDate)}
                  {plan.endDate && ` — สิ้นสุด ${formatDate(plan.endDate)}`}
                </span>
                {plan.status === "ACTIVE" && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Pencil className="mr-1 size-3" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleCancel(plan)}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending && (
                        <Loader2 className="mr-1 size-3 animate-spin" />
                      )}
                      ยกเลิก
                    </Button>
                  </div>
                )}
              </div>
              {plan.note && (
                <p className="mt-2 text-sm text-muted-foreground">{plan.note}</p>
              )}
            </CardContent>
          </Card>
        );
      })}

      <PaymentPlanForm
        customerId={customerId}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingPlan(null);
        }}
        editPlan={editingPlan}
      />
    </div>
  );
}
