import { useState } from "react";

export const useMobileDrawer = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return {
    mobileOpen,
    handleDrawerToggle,
    handleDrawerClose,
  };
};