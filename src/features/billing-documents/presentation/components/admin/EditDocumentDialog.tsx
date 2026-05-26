"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  useListDocumentItems,
  useUpsertDocumentItems,
} from "../../hooks/useDocumentItems";
import { DOCUMENT_TYPE_LABELS } from "../../../domain/DocumentType";
import type { BillingDocumentType } from "../../../domain/DocumentType";
import type { BillingDocument } from "../../../domain/BillingDocument";
import type { DocumentItemInput } from "../../../schemas";

interface Props {
  document: BillingDocument;
  customerId: string;
  cycleAmount?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LocalItem extends DocumentItemInput {
  localKey: string;
}

let keyCounter = 0;
function nextKey() {
  return `edit-${++keyCounter}`;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

export function EditDocumentDialog({
  document: doc,
  customerId,
  cycleAmount,
  open,
  onOpenChange,
}: Props) {
  const updateMutation = useUpdateDocument(customerId);
  const upsertItemsMutation = useUpsertDocumentItems(customerId);
  const { data: serverItems, isLoading: itemsLoading } =
    useListDocumentItems(customerId);

  const [type, setType] = useState<BillingDocumentType>(doc.type);
  const [note, setNote] = useState(doc.note ?? "");
  const [dueDate, setDueDate] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [itemsInitialized, setItemsInitialized] = useState(false);

  const items = useMemo(() => serverItems ?? [], [serverItems]);

  useEffect(() => {
    if (items.length > 0 && !itemsInitialized) {
      setLocalItems(
        items.map((item, i) => ({
          localKey: item.id,
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          orderIndex: i,
        })),
      );
      setItemsInitialized(true);
    }
  }, [items, itemsInitialized]);

  const addRow = () => {
    setLocalItems((prev) => [
      ...prev,
      {
        localKey: nextKey(),
        description: "",
        quantity: 1,
        unit: "รายการ",
        unitPrice: 0,
        orderIndex: prev.length,
      },
    ]);
  };

  const removeRow = (localKey: string) => {
    setLocalItems((prev) => prev.filter((i) => i.localKey !== localKey));
  };

  const updateField = (
    localKey: string,
    field: keyof LocalItem,
    value: string | number,
  ) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.localKey === localKey ? { ...item, [field]: value } : item,
      ),
    );
  };

  const total = localItems.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice),
    0,
  );

  const isSaving = upsertItemsMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (localItems.length === 0) {
      toast.error("ต้องมีอย่างน้อย 1 รายการ");
      return;
    }

    const toSave = localItems.map((item, i) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      orderIndex: i,
    }));

    upsertItemsMutation.mutate(toSave, {
      onSuccess: () => {
        updateMutation.mutate(
          {
            documentId: doc.id,
            input: {
              type,
              note: note || null,
              dueDate: dueDate || null,
              paidDate: paidDate || null,
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
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขเอกสาร {doc.documentNumber}</DialogTitle>
          <DialogDescription>
            แก้ไขรายละเอียดเอกสารและรายการสินค้า/บริการ แล้วสร้าง PDF ใหม่
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
            {total !== cycleAmount && localItems.length > 0 && (
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
            <Label>รายการสินค้า/บริการ</Label>
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1 size-3.5" />
              เพิ่มรายการ
            </Button>
          </div>

          {itemsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead className="w-16">จำนวน</TableHead>
                  <TableHead className="w-20">หน่วย</TableHead>
                  <TableHead className="w-28">ราคา/หน่วย</TableHead>
                  <TableHead className="w-24 text-right">รวม</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {localItems.map((item) => (
                  <TableRow key={item.localKey}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateField(
                            item.localKey,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="ค่าทำ SEO"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateField(
                            item.localKey,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.unit}
                        onChange={(e) =>
                          updateField(item.localKey, "unit", e.target.value)
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateField(
                            item.localKey,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatAmount(
                        Number(item.quantity) * Number(item.unitPrice),
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeRow(item.localKey)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {localItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-4 text-center text-sm text-muted-foreground"
                    >
                      ยังไม่มีรายการ — กด &quot;เพิ่มรายการ&quot; เพื่อเริ่ม
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

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
            disabled={isSaving}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || localItems.length === 0}
            className="bg-info text-info-foreground hover:bg-info/90"
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            บันทึกและสร้าง PDF ใหม่
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
