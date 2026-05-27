"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface EditableItem {
  key: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

let nextKey = 0;
export function createItemKey() {
  return `item-${++nextKey}`;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

interface Props {
  items: EditableItem[];
  onItemsChange: (items: EditableItem[]) => void;
}

export function DocumentItemsEditor({ items, onItemsChange }: Props) {
  const total = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  const handleItemChange = (
    key: string,
    field: keyof Omit<EditableItem, "key">,
    value: string | number,
  ) => {
    onItemsChange(
      items.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddItem = () => {
    onItemsChange([
      ...items,
      {
        key: createItemKey(),
        description: "",
        quantity: 1,
        unit: "รายการ",
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (key: string) => {
    onItemsChange(items.filter((item) => item.key !== key));
  };

  return (
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
  );
}
