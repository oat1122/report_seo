// src/app/customer/report/page.tsx
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { ReportPage } from "@/components/Customer/Report";
import { requireCustomer } from "@/lib/auth-utils";
import { customerService } from "@/services/CustomerService";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

export default async function CustomerReportPage() {
  const session = await requireCustomer();
  const reportData = await customerService.getCustomerReport(session.user.id);
  // JSON-serialize ให้ Date → string ตรงกับ shape ของ React Query
  const initialData = JSON.parse(
    JSON.stringify(reportData),
  ) as CustomerReportData;

  return (
    <DashboardLayout>
      <ReportPage customerId={session.user.id} initialData={initialData} />
    </DashboardLayout>
  );
}
