"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Notification } from "../../domain/Notification";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    const url = (notification.metadata as Record<string, unknown> | null)?.url;
    if (typeof url === "string") {
      if (url.startsWith("/")) {
        router.push(url);
      } else {
        window.location.href = url;
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
      className={cn(
        "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-muted/30",
      )}
    >
      {/* Unread indicator */}
      <div className="mt-2 flex-shrink-0">
        {!notification.isRead ? (
          <div className="size-2 rounded-full bg-info" />
        ) : (
          <div className="size-2" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{notification.title}</p>
        {notification.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {notification.body}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          {notification.actorName && (
            <span className="text-xs text-muted-foreground">
              {notification.actorName}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: th,
            })}
          </span>
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
