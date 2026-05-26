"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/features/notifications/presentation/components/NotificationCenter";
import { NotificationPreferencesDialog } from "@/features/notifications/presentation/components/NotificationPreferencesDialog";
import { useUnreadCount } from "@/features/notifications/presentation/hooks/useNotifications";

export function HubNotificationsPanel() {
  const { data: unreadCount } = useUnreadCount();
  const [prefOpen, setPrefOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4" />
            การแจ้งเตือน
          </CardTitle>
          <CardAction>
            {unreadCount != null && unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto p-0">
          <NotificationCenter
            onOpenPreferences={() => setPrefOpen(true)}
            className="w-full"
          />
        </CardContent>
      </Card>

      <NotificationPreferencesDialog
        open={prefOpen}
        onOpenChange={setPrefOpen}
      />
    </>
  );
}
