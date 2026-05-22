"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import {
  useDeleteMeta,
  useUpsertMeta,
} from "../../hooks/useItemMeta";
import { upsertMetaSchema } from "@/features/work-progress/schemas";
import type {
  WorkProgressItemMeta,
  MetaValueType,
} from "@/features/work-progress/domain/WorkProgressItemMeta";

const TYPE_OPTIONS: { value: MetaValueType; label: string }[] = [
  { value: "string", label: "ข้อความ" },
  { value: "number", label: "ตัวเลข" },
  { value: "date", label: "วันที่" },
  { value: "json", label: "JSON" },
];

interface ItemMetaEditorProps {
  userId: string;
  planId: string;
  itemId: string;
  meta: WorkProgressItemMeta[];
  readOnly?: boolean;
}

export function ItemMetaEditor({
  userId,
  planId,
  itemId,
  meta,
  readOnly,
}: ItemMetaEditorProps) {
  const upsertMut = useUpsertMeta();
  const deleteMut = useDeleteMeta();

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<MetaValueType>("string");

  const handleAdd = async () => {
    const body = {
      key: newKey.trim(),
      value: newValue,
      valueType: newType,
    };
    const parsed = upsertMetaSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }
    await upsertMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: parsed.data,
    });
    setNewKey("");
    setNewValue("");
    setNewType("string");
  };

  return (
    <div className="flex flex-col gap-2">
      {meta.length === 0 ? (
        <p className="text-xs text-muted-foreground">ยังไม่มี meta field</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {meta.map((m) => (
            <li
              key={m.id}
              className="grid grid-cols-[120px_1fr_80px_auto] items-center gap-2 rounded-md border border-border px-2 py-1.5"
            >
              <span className="font-mono text-xs">{m.key}</span>
              <span className="truncate text-sm">{m.value}</span>
              <span className="text-xs text-muted-foreground">
                {m.valueType}
              </span>
              {!readOnly && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    deleteMut.mutate({
                      userId,
                      planId,
                      itemId,
                      key: m.key,
                    })
                  }
                  aria-label="ลบ"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <div className="grid grid-cols-[120px_1fr_100px_auto] gap-2">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="key"
            maxLength={100}
            className="h-8 font-mono"
          />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="value"
            maxLength={10000}
            className="h-8"
          />
          <Select
            value={newType}
            onValueChange={(v) => setNewType(v as MetaValueType)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!newKey.trim() || upsertMut.isPending}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
