"use client";

import { Loader2, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useListBillingCycles, useUpdateBillingCycle } from "../../hooks/useBillingCycles";

interface BillingCycleTableProps {
  customerId: string;
  planId?: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
  PENDING: { label: "รอชำระ", variant: "outline", icon: Clock },
  PAID: { label: "ชำระแล้ว", variant: "secondary", icon: CheckCircle },
  OVERDUE: { label: "เกินกำหนด", variant: "destructive", icon: AlertTriangle },
  CANCELLED: { label: "ยกเลิก", variant: "default", icon: XCircle },
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

export function BillingCycleTable({ customerId, planId }: BillingCycleTableProps) {
  const { data: cycles, isLoading } = useListBillingCycles(customerId, planId);
  const updateMutation = useUpdateBillingCycle();

  const handleMarkPaid = (cycleId: string) => {
    updateMutation.mutate({
      customerId,
      cycleId,
      data: { status: "PAID", paidDate: new Date() },
    });
  };

  const handleMarkOverdue = (cycleId: string) => {
    updateMutation.mutate({
      customerId,
      cycleId,
      data: { status: "OVERDUE" },
    });
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!cycles?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          ยังไม่มีรอบจ่ายเงิน — สร้างแผนชำระเงินก่อน
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">งวด</TableHead>
              <TableHead>แผน</TableHead>
              <TableHead>วันครบกำหนด</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่ชำระ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycles.map((cycle) => {
              const config = STATUS_CONFIG[cycle.status] ?? STATUS_CONFIG.PENDING;
              const Icon = config.icon;
              return (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.cycleNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cycle.plan.description}
                  </TableCell>
                  <TableCell>{formatDate(cycle.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(cycle.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      <Icon className="size-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cycle.paidDate ? formatDate(cycle.paidDate) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {cycle.status === "PENDING" && (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkPaid(cycle.id)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "ชำระแล้ว"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleMarkOverdue(cycle.id)}
                          disabled={updateMutation.isPending}
                        >
                          เกินกำหนด
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
