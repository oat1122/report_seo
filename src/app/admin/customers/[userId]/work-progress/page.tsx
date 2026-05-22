import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { PlanList } from "@/features/work-progress/presentation/components/plan/PlanList";

export const metadata = {
  title: "Work Progress · Admin",
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminWorkProgressListPage({ params }: PageProps) {
  await requireAdmin();
  const { userId } = await params;
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Work Progress
          </h1>
          <p className="text-sm text-muted-foreground">
            จัดการแผนงานของลูกค้า — สร้าง · ใช้ template · clone จากแผนเดิม
          </p>
        </header>
        <PlanList
          userId={userId}
          basePath={`/admin/customers/${userId}/work-progress`}
        />
      </div>
    </DashboardLayout>
  );
}
