// src/app/customer/[userId]/report/page.tsx
"use client";

import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { ReportPage } from "@/components/Customer/Report";

interface PageProps {
  params: { userId: string };
}

export default function AdminViewCustomerReportPage({ params }: PageProps) {
  const { userId } = params;

  return (
    <DashboardLayout>
      <ReportPage customerId={userId} />
    </DashboardLayout>
  );
}
