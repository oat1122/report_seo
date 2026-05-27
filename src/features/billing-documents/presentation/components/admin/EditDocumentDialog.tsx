"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateDocument } from "../../hooks/useDocuments";
import { DOCUMENT_TYPE_LABELS } from "../../../domain/DocumentType";
import type { BillingDocumentType } from "../../../domain/DocumentType";
import type { BillingDocument } from "../../../domain/BillingDocument";
import type { DocumentTemplateDetail } from "../../../domain/DocumentTemplate";
import type { UpdateDocumentItemInput } from "../../../schemas";

interface EditableItem extends UpdateDocumentItemInput {
  key: string;
}

interface Props {
  document: BillingDocument;
  customerId: string;
  cycleAmount?: number | null;
  template?: DocumentTemplateDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

let nextKey = 0;
function createKey() {
  return `item-${++nextKey}`;
}

function buildInitialItems(
  template: DocumentTemplateDetail | null | undefined,
  totalAmount: number,
): EditableItem[] {
  if (template && template.items.length > 0) {
    return template.items
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((i) => ({
        key: createKey(),
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
      }));
  }

  return [
    {
      key: createKey(),
      description: "ค่าบริการ",
      quantity: 1,
      unit: "รายการ",
      unitPrice: totalAmount,
    },
  ];
}

export function EditDocumentDialog({
  document: doc,
  customerId,
  cycleAmount,
  template,
  open,
  onOpenChange,
}: Props) {
  const updateMutation = useUpdateDocument(customerId);

  const [type, setType] = useState<BillingDocumentType>(doc.type);
  const [note, setNote] = useState(doc.note ?? "");
  const [dueDate, setDueDate] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [items, setItems] = useState<EditableItem[]>(() =>
    buildInitialItems(template, Number(doc.totalAmount)),
  );

  const total = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  const handleItemChange = (
    key: string,
    field: keyof UpdateDocumentItemInput,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        key: createKey(),
        description: "",
        quantity: 1,
        unit: "รายการ",
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const isValid = items.length > 0 && items.every((i) => i.description.trim());

  const handleSave = () => {
    updateMutation.mutate(
      {
        documentId: doc.id,
        input: {
          type,
          note: note || null,
          dueDate: dueDate || null,
          paidDate: paidDate || null,
          items: items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
          })),
        },
      },
      {
        onSuccess: (updated) => {
          toast.success(
            `แก้ไขเอกสาร ${updated.documentNumber} เรียบร้อย (PDF สร้างใหม่แล้ว)`,
          );
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>แก้ไขเอกสาร {doc.documentNumber}</DialogTitle>
          <DialogDescription>
            แก้ไขรายละเอียดเอกสารแล้วสร้าง PDF ใหม่
          </DialogDescription>
        </DialogHeader>

        {cycleAmount != null && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              ยอดตามแผนชำระ:
            </span>
            <Badge variant="secondary" className="text-sm">
              {formatAmount(cycleAmount)} บาท
            </Badge>
            {total !== cycleAmount && items.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                ต่างจากแผน {formatAmount(Math.abs(total - cycleAmount))} บาท
              </Badge>
            )}
          </div>
        )}

        <FieldGroup>
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

          {(type === "INVOICE" || type === "BILLING_NOTE") && (
            <Field>
              <Label>กำหนดชำระ</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          )}

          {type === "RECEIPT" && (
            <Field>
              <Label>วันที่ชำระ</Label>
              <Input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </Field>
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
        </FieldGroup>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>รายการในเอกสาร</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="mr-1 size-4" />
              เพิ่มรายการ
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รายละเอียด</TableHead>
                <TableHead className="w-20">จำนวน</TableHead>
                <TableHead className="w-24">หน่วย</TableHead>
                <TableHead className="w-28">ราคา/หน่วย</TableHead>
                <TableHead className="w-24 text-right">รวม</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="p-1">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.key, "description", e.target.value)
                      }
                      placeholder="รายละเอียด..."
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          item.key,
                          "quantity",
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(item.key, "unit", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          item.key,
                          "unitPrice",
                          Math.max(0, parseFloat(e.target.value) || 0),
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-1 text-right text-sm font-medium">
                    {formatAmount(item.quantity * item.unitPrice)}
                  </TableCell>
                  <TableCell className="p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveItem(item.key)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-right text-sm text-muted-foreground">
            รวมทั้งสิ้น:{" "}
            <span className="font-semibold text-foreground">
              {formatAmount(total)} บาท
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !isValid}
            className="bg-info text-info-foreground hover:bg-info/90"
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            บันทึกและสร้าง PDF ใหม่
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
