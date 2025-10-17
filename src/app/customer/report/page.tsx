// src/app/customer/report/page.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { ReportPage } from "@/components/Customer/Report";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function CustomerReportPage() {
  const { data: session, status } = useSession({ required: true });

  if (status === "loading") {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading user session...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {session?.user?.id && <ReportPage customerId={session.user.id} />}
    </DashboardLayout>
  );
}
