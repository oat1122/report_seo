// src/app/customer/report/page.tsx
import type { Metadata } from "next";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import ReportPage from "@/components/Customer/Report/ReportPage";
import { requireCustomer } from "@/lib/auth-utils";
import { customerService } from "@/services/CustomerService";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

export const metadata: Metadata = {
  title: "รายงาน SEO | SEO Report",
};

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
