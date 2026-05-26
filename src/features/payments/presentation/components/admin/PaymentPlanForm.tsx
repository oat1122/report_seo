"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreatePaymentPlan,
  useUpdatePaymentPlan,
} from "../../hooks/usePaymentPlans";
import type { PaymentPlan } from "../../../index";

interface PaymentPlanFormProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPlan?: PaymentPlan | null;
}

export function PaymentPlanForm({
  customerId,
  open,
  onOpenChange,
  editPlan,
}: PaymentPlanFormProps) {
  const isEdit = !!editPlan;

  const [type, setType] = useState<"MONTHLY" | "INSTALLMENT">("MONTHLY");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [totalInstallments, setTotalInstallments] = useState("12");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [note, setNote] = useState("");

  const createMutation = useCreatePaymentPlan();
  const updateMutation = useUpdatePaymentPlan();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editPlan && open) {
      setType(editPlan.type as "MONTHLY" | "INSTALLMENT");
      setAmount(String(editPlan.amount));
      setDescription(editPlan.description);
      setBillingDay(String(editPlan.billingDay ?? 1));
      setTotalInstallments(String(editPlan.totalInstallments ?? 12));
      setStartDate(new Date(editPlan.startDate).toISOString().split("T")[0]);
      setNote(editPlan.note ?? "");
    } else if (!editPlan && open) {
      resetForm();
    }
  }, [editPlan, open]);

  const resetForm = () => {
    setType("MONTHLY");
    setAmount("");
    setDescription("");
    setBillingDay("1");
    setTotalInstallments("12");
    setStartDate(new Date().toISOString().split("T")[0]);
    setNote("");
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !description.trim()) return;

    if (isEdit) {
      updateMutation.mutate(
        {
          customerId,
          planId: editPlan.id,
          data: {
            description: description.trim(),
            amount: parsedAmount,
            billingDay:
              editPlan.type === "MONTHLY" ? parseInt(billingDay, 10) : null,
            endDate: null,
            note: note.trim() || null,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      if (!startDate) return;
      createMutation.mutate(
        {
          customerId,
          plan: {
            type,
            amount: parsedAmount,
            description: description.trim(),
            billingDay: type === "MONTHLY" ? parseInt(billingDay, 10) : null,
            totalInstallments:
              type === "INSTALLMENT" ? parseInt(totalInstallments, 10) : null,
            startDate: new Date(startDate),
            note: note.trim() || null,
          },
        },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขแผนชำระเงิน" : "สร้างแผนชำระเงิน"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "MONTHLY" | "INSTALLMENT")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">รายเดือน</SelectItem>
                  <SelectItem value="INSTALLMENT">
                    ผ่อนชำระ (จำนวนงวด)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>ชื่อแพ็กเกจ / บริการ</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น SEO Standard Package"
            />
          </div>

          <div className="space-y-2">
            <Label>จำนวนเงินต่อรอบ (บาท)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {(isEdit ? editPlan.type === "MONTHLY" : type === "MONTHLY") && (
            <div className="space-y-2">
              <Label>วันที่เก็บเงินทุกเดือน</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
              />
            </div>
          )}

          {!isEdit && type === "INSTALLMENT" && (
            <div className="space-y-2">
              <Label>จำนวนงวดทั้งหมด</Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
              />
            </div>
          )}

          {!isEdit && (
            <div className="space-y-2">
              <Label>วันเริ่มต้น</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>หมายเหตุ (ไม่บังคับ)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !amount || !description.trim()}
          >
            {isPending && <Loader2 className="mr-1 size-3 animate-spin" />}
            {isEdit ? "บันทึก" : "สร้างแผน"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
