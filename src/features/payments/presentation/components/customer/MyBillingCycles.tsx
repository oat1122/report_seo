"use client";

import { useState } from "react";
import { Clock, CheckCircle, AlertTriangle, XCircle, Search } from "lucide-react";
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
import { useListBillingCycles } from "../../hooks/useBillingCycles";
import { UploadProofDialog } from "./UploadProofDialog";

interface MyBillingCyclesProps {
  customerId: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
  PENDING: { label: "รอชำระ", variant: "outline", icon: Clock },
  REVIEWING: { label: "กำลังตรวจสอบหลักฐาน", variant: "default", icon: Search },
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

export function MyBillingCycles({ customerId }: MyBillingCyclesProps) {
  const [uploadCycleId, setUploadCycleId] = useState<string | null>(null);
  const { data: cycles, isLoading } = useListBillingCycles(customerId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!cycles?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          ยังไม่มีรอบจ่ายเงิน
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle) => {
                const config = STATUS_CONFIG[cycle.status] ?? STATUS_CONFIG.PENDING;
                const Icon = config.icon;
                return (
                  <TableRow key={cycle.id}>
                    <TableCell className="font-medium">
                      {cycle.cycleNumber}
                    </TableCell>
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
                    <TableCell className="text-right">
                      {(cycle.status === "PENDING" ||
                        cycle.status === "OVERDUE") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadCycleId(cycle.id)}
                        >
                          อัปโหลดหลักฐาน
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UploadProofDialog
        customerId={customerId}
        billingCycleId={uploadCycleId}
        open={!!uploadCycleId}
        onOpenChange={(open) => {
          if (!open) setUploadCycleId(null);
        }}
      />
    </>
  );
}
