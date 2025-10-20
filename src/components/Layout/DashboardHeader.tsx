"use client"; // แปลงเป็น Client Component

import React, { useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography,
  Container,
  Skeleton, // Import Skeleton for loading state
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  AccessTime,
  PersonOutline,
  Language,
  Logout,
  ExpandMore,
} from "@mui/icons-material";
import { HistoryModal } from "@/components/shared/users/MetricsModal/HistoryModal";
import { Role, OverallMetricsHistory, KeywordReportHistory } from "@/types";
import axios from "@/lib/axios";
import { showPromiseToast } from "@/components/shared/toast/lib/toastify";

// Define a type for the combined history data
interface CombinedHistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
}

export const DashboardHeader: React.FC = () => {
  const { data: session, status } = useSession(); // เพิ่ม status เพื่อเช็ค loading
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // State สำหรับ History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<CombinedHistoryData>({
    metricsHistory: [],
    keywordHistory: [],
  });

  // เปิด/ปิด เมนู user
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // ฟังก์ชัน Logout
  const handleLogout = async () => {
    handleUserMenuClose();
    await signOut({
      callbackUrl: "/",
    });
  };

  // ฟังก์ชันเปิด History Modal
  const handleOpenHistoryModal = async () => {
    // ตรวจสอบว่าเป็น Customer เท่านั้น
    if (session?.user?.role !== Role.CUSTOMER) {
      showPromiseToast(Promise.reject(), {
        pending: "",
        success: "",
        error: "ฟีเจอร์นี้สำหรับลูกค้าเท่านั้น",
      });
      return;
    }

    try {
      const userId = session.user.id;
      const response = await axios.get<CombinedHistoryData>(
        `/customers/${userId}/metrics/history`
      );
      setHistoryData(response.data);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch metrics history", err);
      showPromiseToast(Promise.reject(err), {
        pending: "",
        success: "",
        error: "ไม่สามารถโหลดข้อมูลประวัติได้",
      });
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setHistoryData({ metricsHistory: [], keywordHistory: [] });
  };

  // ดึงข้อมูลจาก session โดยตรง
  const isLoading = status === "loading";
  const userName = session?.user?.name || "Guest";
  const userRole = session?.user?.role;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "white",
        color: "text.primary",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{ justifyContent: "space-between", py: 0.5, minHeight: "48px" }}
        >
          {/* Logo - เปลี่ยน path ที่นี่ */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/img/LOGO SEO PRIME4_0.png"
              alt="SEO Prime Logo"
              width={70}
              height={24}
              priority
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Icon Group */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="ดูประวัติการเปลี่ยนแปลง">
              <IconButton
                onClick={handleOpenHistoryModal}
                disabled={session?.user?.role !== Role.CUSTOMER}
                size="small"
                sx={{
                  border: "1px solid #e0e0e0",
                  width: 32,
                  height: 32,
                }}
              >
                <AccessTime fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              onClick={handleUserMenuClick}
              size="small"
              sx={{
                backgroundColor: "#f5f5f5",
                color: "black",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#e0e0e0" },
                borderRadius: "16px",
                padding: "4px 12px",
                textTransform: "none",
                minWidth: 120,
                fontSize: "0.875rem",
              }}
              startIcon={<PersonOutline fontSize="small" />}
              endIcon={<ExpandMore fontSize="small" />}
            >
              {/* ดึงข้อมูลจาก session โดยตรง */}
              {isLoading ? <Skeleton width="80%" /> : userName}
            </Button>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleUserMenuClose}
              onClick={handleUserMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>ออกจากระบบ</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
        {/* Website Info Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            py: 0.25,
            px: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Language sx={{ fontSize: 16, mr: 0.75, color: "text.secondary" }} />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
          >
            {isLoading ? (
              <Skeleton width="150px" />
            ) : userRole === "CUSTOMER" ? (
              "Customer Report Panel" // แสดงข้อความสำหรับ Customer
            ) : (
              `${userRole || "USER"} Dashboard`
            )}
          </Typography>
        </Box>
      </Container>

      {/* History Modal */}
      <HistoryModal
        open={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        history={historyData.metricsHistory}
        keywordHistory={historyData.keywordHistory}
        customerName={userName}
      />
    </AppBar>
  );
};
