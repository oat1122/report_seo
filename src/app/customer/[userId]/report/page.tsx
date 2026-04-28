// src/app/customer/[userId]/report/page.tsx
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { ReportPage } from "@/components/Customer/Report";
import { requireRole } from "@/lib/auth-utils";
import { customerService } from "@/services/CustomerService";
import { Role } from "@/types/auth";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

export default async function AdminViewCustomerReportPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole([Role.ADMIN, Role.SEO_DEV, Role.CUSTOMER]);
  const { userId } = await params;
  const reportData = await customerService.getCustomerReport(userId);
  const initialData = JSON.parse(
    JSON.stringify(reportData),
  ) as CustomerReportData;

  return (
    <DashboardLayout>
      <ReportPage customerId={userId} initialData={initialData} />
    </DashboardLayout>
  );
}
