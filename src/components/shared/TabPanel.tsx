import React from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  prefix?: string;
}

// Deprecated: ใช้ shadcn `<Tabs>` + `<TabsContent>` ในโค้ดใหม่
// คงไว้ชั่วคราวจนกว่า HistoryModal จะ migrate (Phase 7) แล้วลบไฟล์นี้
export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  prefix = "tabpanel",
  ...other
}) => {
  if (value !== index) return null;
  return (
    <div
      role="tabpanel"
      id={`${prefix}-${index}`}
      aria-labelledby={`${prefix}-tab-${index}`}
      className="mt-4"
      {...other}
    >
      {children}
    </div>
  );
};
