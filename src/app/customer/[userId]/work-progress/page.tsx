import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { PlanList } from "@/features/work-progress/presentation/components/plan/PlanList";

export const metadata = {
  title: "Work Progress | SEO Report",
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function CustomerWorkProgressListPage({
  params,
}: PageProps) {
  const session = await requireCustomer();
  const { userId } = await params;
  if (userId !== session.user.id) notFound();

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            แผนงานของฉัน
          </h1>
          <p className="text-sm text-muted-foreground">
            ดูแผนงาน SEO และความคืบหน้าที่ทีมจัดทำให้
          </p>
        </header>
        <PlanList
          userId={userId}
          basePath={`/customer/${userId}/work-progress`}
          readOnly
        />
      </div>
    </DashboardLayout>
  );
}
