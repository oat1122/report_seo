"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_GROUPS,
  type NotificationType,
} from "../../domain/NotificationTypes";
import {
  useNotificationPreferences,
  useUpdatePreferences,
} from "../hooks/useNotifications";

interface NotificationPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPreferencesDialog({
  open,
  onOpenChange,
}: NotificationPreferencesDialogProps) {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();
  const [localState, setLocalState] = useState<
    Record<string, boolean>
  >({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }
    if (preferences && !initializedRef.current) {
      const state: Record<string, boolean> = {};
      for (const pref of preferences) {
        state[pref.type] = pref.enabled;
      }
      setLocalState(state);
      initializedRef.current = true;
    }
  }, [preferences, open]);

  const handleToggle = (type: string) => {
    setLocalState((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSave = () => {
    const items = Object.entries(localState).map(([type, enabled]) => ({
      type,
      enabled,
    }));
    updatePreferences.mutate(items, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ตั้งค่าการแจ้งเตือน</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(NOTIFICATION_TYPE_GROUPS).map(
              ([groupLabel, types]) => (
                <div key={groupLabel}>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    {groupLabel}
                  </h4>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div
                        key={type}
                        className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50"
                      >
                        <span className="text-sm">
                          {NOTIFICATION_TYPE_LABELS[type as NotificationType]}
                        </span>
                        <Switch
                          checked={localState[type] ?? true}
                          onCheckedChange={() => handleToggle(type)}
                        />
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              ),
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updatePreferences.isPending}
              >
                {updatePreferences.isPending && (
                  <Loader2 className="mr-1 size-3 animate-spin" />
                )}
                บันทึก
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
