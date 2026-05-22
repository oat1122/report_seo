"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  useAddSubtask,
  useDeleteSubtask,
  useToggleSubtask,
} from "../../hooks/useSubtaskActions";
import type { WorkProgressSubtask } from "@/features/work-progress";

interface SubtaskListProps {
  userId: string;
  planId: string;
  itemId: string;
  subtasks: WorkProgressSubtask[];
  readOnly?: boolean;
}

export function SubtaskList({
  userId,
  planId,
  itemId,
  subtasks,
  readOnly,
}: SubtaskListProps) {
  const addMut = useAddSubtask();
  const toggleMut = useToggleSubtask();
  const deleteMut = useDeleteSubtask();
  const [newTitle, setNewTitle] = useState("");

  const sorted = subtasks.slice().sort((a, b) => a.orderIndex - b.orderIndex);

  const handleAdd = async () => {
    const t = newTitle.trim();
    if (!t) return;
    await addMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: { title: t },
    });
    setNewTitle("");
  };

  return (
    <div className="flex flex-col gap-2">
      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground">ยังไม่มีงานย่อย</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {sorted.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
            >
              <Checkbox
                checked={s.isDone}
                disabled={readOnly || toggleMut.isPending}
                onCheckedChange={() =>
                  toggleMut.mutate({
                    userId,
                    planId,
                    itemId,
                    subtaskId: s.id,
                  })
                }
              />
              <span
                className={
                  s.isDone
                    ? "flex-1 text-sm text-muted-foreground line-through"
                    : "flex-1 text-sm"
                }
              >
                {s.title}
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
                      subtaskId: s.id,
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
        <div className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="เพิ่มงานย่อย..."
            maxLength={500}
            className="h-8"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!newTitle.trim() || addMut.isPending}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
