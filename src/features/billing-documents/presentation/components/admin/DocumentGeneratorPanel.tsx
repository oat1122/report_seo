"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  useGenerateDocument,
  useGenerateAllForCycle,
} from "../../hooks/useDocuments";
import { useBillingCyclesForDocuments } from "../../hooks/useBillingCyclesForDocuments";
import { useDocumentTemplate } from "../../hooks/useDocumentTemplates";
import { DOCUMENT_TYPE_LABELS } from "../../../domain/DocumentType";
import type { BillingDocumentType } from "../../../domain/DocumentType";

interface Props {
  customerId: string;
}

const NO_CYCLE = "__none__";

export function DocumentGeneratorPanel({ customerId }: Props) {
  const generateMutation = useGenerateDocument(customerId);
  const generateAllMutation = useGenerateAllForCycle(customerId);
  const { data: cycles = [] } = useBillingCyclesForDocuments(customerId);

  const [selectedCycleId, setSelectedCycleId] = useState<string>(NO_CYCLE);
  const [type, setType] = useState<BillingDocumentType>("INVOICE");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paidDate, setPaidDate] = useState("");

  const selectedCycle = useMemo(
    () => cycles.find((c) => c.id === selectedCycleId),
    [cycles, selectedCycleId],
  );

  const templateId = selectedCycle?.plan.documentTemplateId ?? null;
  const { data: template } = useDocumentTemplate(templateId);

  const itemsTotal = useMemo(
    () =>
      template
        ? template.items.reduce(
            (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice),
            0,
          )
        : 0,
    [template],
  );

  const hasCycle = selectedCycleId !== NO_CYCLE;
  const amountMismatch =
    hasCycle &&
    selectedCycle &&
    template &&
    Math.abs(itemsTotal - selectedCycle.amount) > 0.01;

  const effectiveDueDate =
    hasCycle && selectedCycle
      ? new Date(selectedCycle.dueDate).toISOString().split("T")[0]
      : dueDate;
  const effectivePaidDate =
    hasCycle && selectedCycle?.paidDate
      ? new Date(selectedCycle.paidDate).toISOString().split("T")[0]
      : paidDate;

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        type,
        note: note || null,
        dueDate: effectiveDueDate || null,
        paidDate: effectivePaidDate || null,
        billingCycleId: hasCycle ? selectedCycleId : undefined,
        templateId: templateId ?? undefined,
      },
      {
        onSuccess: (doc) => {
          toast.success(
            `สร้าง${DOCUMENT_TYPE_LABELS[type]} ${doc.documentNumber} เรียบร้อย`,
          );
          setNote("");
        },
      },
    );
  };

  const handleGenerateAll = () => {
    if (!hasCycle) return;
    generateAllMutation.mutate(
      { billingCycleId: selectedCycleId, note: note || null },
      {
        onSuccess: (docs) => {
          toast.success(`สร้างเอกสาร ${docs.length} ฉบับเรียบร้อย`);
          setNote("");
        },
      },
    );
  };

  const isPending =
    generateMutation.isPending || generateAllMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>สร้างเอกสาร</CardTitle>
        <CardDescription>
          เลือกรอบจ่ายเงิน (ถ้ามี) แล้วสร้าง PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {cycles.length > 0 && (
            <Field>
              <Label>เชื่อมโยงกับรอบจ่ายเงิน (ไม่บังคับ)</Label>
              <Select
                value={selectedCycleId}
                onValueChange={setSelectedCycleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ไม่เชื่อมโยง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CYCLE}>ไม่เชื่อมโยง</SelectItem>
                  {cycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.plan.description} — งวด {cycle.cycleNumber} (
                      {new Date(cycle.dueDate).toLocaleDateString("th-TH", {
                        month: "short",
                        day: "numeric",
                      })}
                      {" · "}
                      {Number(cycle.amount).toLocaleString("th-TH", {
                        minimumFractionDigits: 0,
                      })}{" "}
                      บาท)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {hasCycle && !templateId && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-destructive">
                แผนชำระนี้ยังไม่ได้เลือก template เอกสาร
              </p>
            </div>
          )}

          {hasCycle && template && (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <p className="font-medium">
                Template: {template.name}
              </p>
              <p className="text-muted-foreground">
                {template.items.length} รายการ · รวม{" "}
                {itemsTotal.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}{" "}
                บาท
              </p>
            </div>
          )}

          {amountMismatch && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  ยอดรวมไม่ตรงกับรอบจ่ายเงิน
                </p>
                <p className="text-muted-foreground">
                  ยอดรายการ:{" "}
                  {itemsTotal.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  บาท · ยอดรอบจ่าย:{" "}
                  {selectedCycle!.amount.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  บาท
                </p>
              </div>
            </div>
          )}

          <Field>
            <Label>ประเภทเอกสาร</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as BillingDocumentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(DOCUMENT_TYPE_LABELS) as [
                    BillingDocumentType,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {!hasCycle && (type === "INVOICE" || type === "BILLING_NOTE") && (
            <Field>
              <Label>กำหนดชำระ</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          )}

          {!hasCycle && type === "RECEIPT" && (
            <Field>
              <Label>วันที่ชำระ</Label>
              <Input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </Field>
          )}

          {hasCycle && (
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              กำหนดชำระ / วันที่ชำระ จะถูกกำหนดจากรอบจ่ายเงินอัตโนมัติ
            </div>
          )}

          <Field>
            <Label>หมายเหตุ (ถ้ามี)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </Field>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isPending || (hasCycle && !templateId)}
              className="w-full bg-info text-info-foreground hover:bg-info/90"
            >
              {generateMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileText className="mr-2 size-4" />
              )}
              สร้าง PDF ({DOCUMENT_TYPE_LABELS[type]})
            </Button>

            {hasCycle && (
              <Button
                variant="outline"
                onClick={handleGenerateAll}
                disabled={isPending || !templateId}
                className="w-full"
              >
                {generateAllMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 size-4" />
                )}
                สร้างเอกสารทั้ง 4 ประเภท
              </Button>
            )}
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
