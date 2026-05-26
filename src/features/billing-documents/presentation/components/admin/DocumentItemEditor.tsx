"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useListDocumentItems,
  useUpsertDocumentItems,
} from "../../hooks/useDocumentItems";
import type { DocumentItemInput } from "../../../schemas";

interface Props {
  customerId: string;
}

interface LocalItem extends DocumentItemInput {
  localKey: string;
}

let keyCounter = 0;
function nextKey() {
  return `new-${++keyCounter}`;
}

export function DocumentItemEditor({ customerId }: Props) {
  const { data: items = [], isLoading } = useListDocumentItems(customerId);
  const upsertMutation = useUpsertDocumentItems(customerId);
  const [localItems, setLocalItems] = useState<LocalItem[]>([]);

  useEffect(() => {
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
  }, [items]);

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

  const handleSave = () => {
    const toSave = localItems.map((item, i) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      orderIndex: i,
    }));
    upsertMutation.mutate(toSave, {
      onSuccess: () => toast.success("บันทึกรายการเรียบร้อย"),
    });
  };

  const total = localItems.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice),
    0,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>รายการสินค้า/บริการ</CardTitle>
            <CardDescription>
              กำหนดรายการที่จะแสดงในเอกสาร PDF ของลูกค้ารายนี้
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1 size-4" />
            เพิ่มรายการ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead className="w-20">จำนวน</TableHead>
              <TableHead className="w-24">หน่วย</TableHead>
              <TableHead className="w-32">ราคา/หน่วย</TableHead>
              <TableHead className="w-28 text-right">รวม</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {localItems.map((item, idx) => (
              <TableRow key={item.localKey}>
                <TableCell className="text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateField(item.localKey, "description", e.target.value)
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
                <TableCell className="text-right font-medium">
                  {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString(
                    "th-TH",
                    { minimumFractionDigits: 2 },
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(item.localKey)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {localItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  ยังไม่มีรายการ — กด &quot;เพิ่มรายการ&quot; เพื่อเริ่ม
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            รวมทั้งสิ้น:{" "}
            <span className="font-semibold text-foreground">
              {total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
            </span>
          </p>
          <Button
            onClick={handleSave}
            disabled={upsertMutation.isPending || localItems.length === 0}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {upsertMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            บันทึกรายการ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
