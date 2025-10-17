// src/app/customer/[userId]/report/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { ReportPage } from "@/components/Customer/Report";

export default function AdminViewCustomerReportPage() {
  // ใช้ useParams hook เพื่อดึงค่าจาก URL (แก้ไข Warning จาก Next.js)
  const params = useParams();
  const userId = params.userId as string;

  return (
    <DashboardLayout>
      {userId && <ReportPage customerId={userId} />}
    </DashboardLayout>
  );
}
