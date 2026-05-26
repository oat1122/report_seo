import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { BackButton } from "@/components/shared/BackButton";
import { PaymentDashboard } from "@/features/payments/presentation/components/admin/PaymentDashboard";

export const metadata = {
  title: "Payment Management · Admin",
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminPaymentsPage({ params }: PageProps) {
  await requireAdmin();
  const { userId } = await params;

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              จัดการการชำระเงิน
            </h1>
            <p className="text-sm text-muted-foreground">
              สร้างแผนเก็บเงิน · อัปโหลดสัญญา · ตรวจสอบหลักฐาน
            </p>
          </header>
        </div>
        <PaymentDashboard customerId={userId} />
      </div>
    </DashboardLayout>
  );
}
