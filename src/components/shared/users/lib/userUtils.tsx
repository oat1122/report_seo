import React from "react";
import { Role } from "@/types/auth";
import {
  AdminPanelSettings,
  Business,
  Code,
  Person,
} from "@mui/icons-material";

export const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return <AdminPanelSettings fontSize="small" />;
    case Role.CUSTOMER:
      return <Business fontSize="small" />;
    case Role.SEO_DEV:
      return <Code fontSize="small" />;
    default:
      return <Person fontSize="small" />;
  }
};

export const getRoleColor = (
  role: Role
): "error" | "info" | "secondary" | "default" => {
  switch (role) {
    case Role.ADMIN:
      return "error";
    case Role.CUSTOMER:
      return "info";
    case Role.SEO_DEV:
      return "secondary";
    default:
      return "default";
  }
};

export const getRoleLabel = (role: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return "ผู้ดูแลระบบ";
    case Role.CUSTOMER:
      return "ลูกค้า";
    case Role.SEO_DEV:
      return "SEO Developer";
    default:
      return role;
  }
};
