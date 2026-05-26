import type { Metadata } from "next";
import { requireCustomer } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { CustomerHubClient } from "@/features/customer-hub/presentation/components/CustomerHubClient";
import PromotionSection from "./PromotionSection";

export const metadata: Metadata = {
  title: "Dashboard | SEO Report",
};

export default async function CustomerDashboard() {
  const session = await requireCustomer();

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        <CustomerHubClient
          userId={session.user.id}
          userName={session.user.name ?? ""}
        />
        <PromotionSection />
      </div>
    </DashboardLayout>
  );
}
