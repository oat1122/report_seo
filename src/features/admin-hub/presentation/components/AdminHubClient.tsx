"use client";

import { useUnreadCount } from "@/features/notifications/presentation/hooks/useNotifications";
import { useAdminHub } from "../hooks/useAdminHub";
import { HubStatsRow } from "./HubStatsRow";
import { CustomerOverviewSection } from "./CustomerOverviewSection";
import { HubNotificationsPanel } from "./HubNotificationsPanel";
import { QuickNavSection } from "./QuickNavSection";

export function AdminHubClient() {
  const { data, isLoading } = useAdminHub();
  const { data: unreadCount } = useUnreadCount();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Admin Hub</h1>

      <HubStatsRow
        userCounts={data?.userCounts}
        unreadCount={unreadCount}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerOverviewSection
            customers={data?.customers}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-4">
          <HubNotificationsPanel />
          <QuickNavSection />
        </div>
      </div>
    </div>
  );
}
