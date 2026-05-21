// src/app/customer/[userId]/report/page.tsx
import { notFound } from "next/navigation";
import { z } from "zod";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import ReportPage from "@/features/customer-report/presentation/ReportPage";
import { requireRole } from "@/lib/auth-utils";
import { getCustomerReport } from "@/features/customer-report";
import { Role } from "@/types/auth";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

const userIdSchema = z.uuid();

export default async function AdminViewCustomerReportPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole([Role.ADMIN, Role.SEO_DEV, Role.CUSTOMER]);
  const { userId } = await params;
  if (!userIdSchema.safeParse(userId).success) {
    notFound();
  }
  const reportData = await getCustomerReport(userId);
  const initialData = JSON.parse(
    JSON.stringify(reportData),
  ) as CustomerReportData;

  return (
    <DashboardLayout>
      <ReportPage customerId={userId} initialData={initialData} />
    </DashboardLayout>
  );
}
