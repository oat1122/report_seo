"use client";

import { BellOff, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationCenterProps {
  onOpenPreferences: () => void;
}

export function NotificationCenter({
  onOpenPreferences,
}: NotificationCenterProps) {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.pages.flatMap((p) => p.data) ?? [];
  const isEmpty = !isLoading && notifications.length === 0;

  return (
    <div className="flex w-80 flex-col sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">การแจ้งเตือน</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => markAllAsRead.mutate()}
          disabled={markAllAsRead.isPending}
        >
          <CheckCheck className="mr-1 size-3.5" />
          อ่านทั้งหมด
        </Button>
      </div>

      <Separator />

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <BellOff className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">ยังไม่มีการแจ้งเตือน</p>
          </div>
        )}

        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onMarkRead={(id) => markAsRead.mutate(id)}
            onDelete={(id) => deleteNotification.mutate(id)}
          />
        ))}

        {hasNextPage && (
          <div className="px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : null}
              โหลดเพิ่มเติม
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Footer */}
      <div className="px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground"
          onClick={onOpenPreferences}
        >
          ตั้งค่าการแจ้งเตือน
        </Button>
      </div>
    </div>
  );
}
