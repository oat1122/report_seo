"use client";

import { useCustomerHub } from "../hooks/useCustomerHub";
import { CustomerDashboardWidget } from "@/features/work-progress/presentation/components/summary/CustomerDashboardWidget";
import { CustomerHubHero } from "./CustomerHubHero";
import { CustomerStatsRow } from "./CustomerStatsRow";
import { CustomerNotificationsPanel } from "./CustomerNotificationsPanel";
import { CustomerQuickNav } from "./CustomerQuickNav";

interface CustomerHubClientProps {
  userId: string;
  userName: string;
}

export function CustomerHubClient({ userId, userName }: CustomerHubClientProps) {
  const { data, isLoading } = useCustomerHub();

  return (
    <div className="space-y-6">
      <CustomerHubHero userName={userName} />

      <CustomerStatsRow metrics={data?.metrics} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerDashboardWidget userId={userId} />
        </div>

        <div className="space-y-4">
          <CustomerNotificationsPanel />
          <CustomerQuickNav userId={userId} />
        </div>
      </div>
    </div>
  );
}
