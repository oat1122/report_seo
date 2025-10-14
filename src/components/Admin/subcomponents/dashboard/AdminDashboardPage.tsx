import { requireAdmin } from "@/lib/auth-utils";
import { Dashboard } from "@/components/Admin/subcomponents/dashboard/Dashboard";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default async function AdminDashboardPage() {
  // Server-side protection and data fetching
  const session = await requireAdmin();

  return (
    <DashboardLayout>
      <Dashboard user={session.user} />
    </DashboardLayout>
  );
}
