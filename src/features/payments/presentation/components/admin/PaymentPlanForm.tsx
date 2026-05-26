"use client";

import { useEffect, useState } from "react";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
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
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState("");

  const createMutation = useCreatePaymentPlan();
  const updateMutation = useUpdatePaymentPlan();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const activeType = isEdit
    ? (editPlan.type as "MONTHLY" | "INSTALLMENT")
    : type;

  useEffect(() => {
    if (editPlan && open) {
      setType(editPlan.type as "MONTHLY" | "INSTALLMENT");
      setAmount(String(editPlan.amount));
      setDescription(editPlan.description);
      setBillingDay(String(editPlan.billingDay ?? 1));
      setTotalInstallments(String(editPlan.totalInstallments ?? 12));
      setStartDate(new Date(editPlan.startDate));
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
    setStartDate(new Date());
    setNote("");
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !description.trim() || !startDate) return;

    if (isEdit) {
      updateMutation.mutate(
        {
          customerId,
          planId: editPlan.id,
          data: {
            description: description.trim(),
            amount: parsedAmount,
            billingDay: parseInt(billingDay, 10),
            totalInstallments:
              activeType === "INSTALLMENT"
                ? parseInt(totalInstallments, 10)
                : null,
            startDate,
            endDate: null,
            note: note.trim() || null,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        {
          customerId,
          plan: {
            type,
            amount: parsedAmount,
            description: description.trim(),
            billingDay: parseInt(billingDay, 10),
            totalInstallments:
              type === "INSTALLMENT" ? parseInt(totalInstallments, 10) : null,
            startDate,
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
          <div className="space-y-2">
            <Label>ประเภท</Label>
            <Select
              value={activeType}
              onValueChange={(v) => setType(v as "MONTHLY" | "INSTALLMENT")}
              disabled={isEdit}
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

          <div className="space-y-2">
            <Label>วันที่เก็บเงินทุกเดือน (1-31)</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
            />
          </div>

          {activeType === "INSTALLMENT" && (
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

          <div className="space-y-2">
            <Label>วันเริ่มต้น</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {startDate
                    ? format(startDate, "d MMM yyyy", { locale: th })
                    : "เลือกวันที่"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  defaultMonth={startDate}
                />
              </PopoverContent>
            </Popover>
          </div>

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
            disabled={isPending || !amount || !description.trim() || !startDate}
          >
            {isPending && <Loader2 className="mr-1 size-3 animate-spin" />}
            {isEdit ? "บันทึก" : "สร้างแผน"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
