// src/components/shared/TabPanel.tsx
import React from "react";
import { Box } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  prefix?: string;
}

/**
 * Shared TabPanel Component สำหรับแสดงเนื้อหาของแต่ละ Tab
 * @param children - เนื้อหาที่จะแสดงใน Tab
 * @param index - Index ของ Tab นี้
 * @param value - Index ของ Tab ที่กำลังเปิดอยู่
 * @param prefix - Prefix สำหรับ id (ใช้เพื่อให้แต่ละ TabPanel มี unique id)
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  prefix = "tabpanel",
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${prefix}-${index}`}
      aria-labelledby={`${prefix}-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
};
