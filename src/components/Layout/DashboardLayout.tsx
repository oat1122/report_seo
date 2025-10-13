import React from "react";
import { Box } from "@mui/material";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <DashboardHeader />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};
