"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import type { Notification } from "../../domain/Notification";
import { NOTIFICATION_QUERY_KEYS } from "./useNotifications";

const MAX_RECONNECT_ATTEMPTS = 3;

export function useNotificationSocket() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const failCountRef = useRef(0);

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.list,
      });

      toast(notification.title, {
        description: notification.body ?? undefined,
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    const socket = io({
      path: "/api/socket",
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    socket.on("notification:new", handleNewNotification);

    socket.on("connect", () => {
      failCountRef.current = 0;
    });

    socket.on("connect_error", () => {
      failCountRef.current += 1;
      if (failCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
        socket.disconnect();
      }
    });

    socketRef.current = socket;

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [status, handleNewNotification]);
}
