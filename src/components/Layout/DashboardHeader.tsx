"use client"; // แปลงเป็น Client Component

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
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
} from "@mui/material";
import {
  AccessTime,
  PersonOutline,
  Language,
  Logout,
  ExpandMore,
} from "@mui/icons-material";

// สร้าง Interface สำหรับข้อมูลที่จะดึงมา
interface HeaderData {
  userName: string | null;
  userRole: string;
  domain: string | null;
}

export const DashboardHeader: React.FC = () => {
  const [data, setData] = useState<HeaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  useEffect(() => {
    // ฟังก์ชันสำหรับดึงข้อมูลจาก API
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user-header");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result: HeaderData = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
        setData(null); // ตั้งค่าข้อมูลเป็น null หากเกิดข้อผิดพลาด
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // useEffect จะทำงานครั้งเดียวเมื่อ component ถูก mount

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
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Image
              src="https://placehold.jp/80x80.png"
              alt="Logo"
              width={50}
              height={50}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Icon Group */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              sx={{
                border: "1px solid #e0e0e0",
                width: 40,
                height: 40,
              }}
            >
              <AccessTime />
            </IconButton>
            <Button
              variant="contained"
              onClick={handleUserMenuClick}
              sx={{
                backgroundColor: "#f5f5f5",
                color: "black",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#e0e0e0" },
                borderRadius: "20px",
                padding: "6px 16px",
                textTransform: "none",
                minWidth: 150, // กำหนดความกว้างขั้นต่ำ
              }}
              startIcon={<PersonOutline />}
              endIcon={<ExpandMore />}
            >
              {loading ? <Skeleton width="80%" /> : data?.userName || "Guest"}
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
            py: 0.5,
            px: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Language sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {loading ? (
              <Skeleton width="150px" />
            ) : data?.domain ? (
              data.domain
            ) : data?.userRole === "CUSTOMER" ? (
              "No domain assigned"
            ) : (
              `${data?.userRole || "USER"} Dashboard`
            )}
          </Typography>
        </Box>
      </Container>
    </AppBar>
  );
};
