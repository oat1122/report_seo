"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityLog } from "../../hooks/useActivityLog";
import type {
  WorkProgressActivity,
  WorkProgressActivityAction,
} from "@/features/work-progress";

interface ActivityFeedProps {
  userId: string;
  planId: string;
}

const ACTION_LABEL: Partial<Record<WorkProgressActivityAction, string>> = {
  PLAN_CREATED: "สร้างแผน",
  PLAN_UPDATED: "แก้ไขแผน",
  PLAN_ARCHIVED: "เก็บแผน",
  PLAN_DELETED: "ลบแผน",
  ITEM_CREATED: "เพิ่ม item",
  ITEM_UPDATED: "แก้ไข item",
  ITEM_DELETED: "ลบ item",
  ITEM_REORDERED: "เรียงใหม่",
  ITEM_ASSIGNED: "กำหนดผู้รับผิดชอบ",
  MARK_SET: "ตั้ง mark",
  MARK_CLEARED: "ล้าง mark",
  MARK_BULK_SET: "ตั้ง mark หลายช่อง",
  SUBTASK_CREATED: "เพิ่มงานย่อย",
  SUBTASK_TOGGLED: "ติ๊กงานย่อย",
  SUBTASK_DELETED: "ลบงานย่อย",
  ATTACHMENT_UPLOADED: "อัปโหลดไฟล์",
  ATTACHMENT_LINKED: "เพิ่มลิงก์",
  ATTACHMENT_DELETED: "ลบไฟล์",
  META_UPSERTED: "บันทึก meta",
  META_DELETED: "ลบ meta",
};

function formatTimeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH");
}

export function ActivityFeed({ userId, planId }: ActivityFeedProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivityLog(userId, planId);

  const flat: WorkProgressActivity[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data?.pages],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="size-4" />
          กิจกรรมล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : flat.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีกิจกรรม</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {flat.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-2 border-b border-border pb-2 last:border-0"
              >
                <Badge variant="outline" className="shrink-0 text-xs">
                  {a.entity}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">
                    {ACTION_LABEL[a.action] ?? a.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(new Date(a.createdAt))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {hasNextPage && (
          <div className="mt-3 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "กำลังโหลด..." : "โหลดเพิ่ม"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
