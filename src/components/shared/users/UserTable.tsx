"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  TableContainer,
  Chip,
  Box,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Edit,
  Delete,
  BarChart,
  RestoreFromTrash,
  Visibility,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { User } from "@/types/user";
import { Role } from "@/types/auth";
import { getRoleIcon, getRoleColor, getRoleLabel } from "./lib/userUtils";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onOpenMetrics: (user: User) => void;
  isSeoDevView?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onRestore,
  onOpenMetrics,
  isSeoDevView = false,
}) => {
  const { data: session } = useSession();

  // Check if the viewer can see the report link
  const canViewReport =
    session?.user?.role === Role.ADMIN || session?.user?.role === Role.SEO_DEV;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "background.paper" }}>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "text.primary",
              }}
            >
              ชื่อผู้ใช้
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "text.primary",
              }}
            >
              อีเมล
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "text.primary",
              }}
            >
              บทบาท
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "text.primary",
              }}
            >
              วันที่สร้าง
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "text.primary",
              }}
            >
              จัดการ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  ไม่พบข้อมูลผู้ใช้งาน
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isDeleted = !!user.deletedAt;
              return (
                <TableRow
                  key={user.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "rgba(49, 251, 76, 0.04)",
                    },
                    transition: "background-color 0.2s",
                    // ทำให้แถวที่ถูกลบเป็นสีเทาและจางลง
                    bgcolor: isDeleted
                      ? "action.disabledBackground"
                      : "inherit",
                    "& .MuiTableCell-root": {
                      color: isDeleted ? "text.disabled" : "inherit",
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight={600}>
                      {user.name || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: "8px",
                        opacity: isDeleted ? 0.6 : 1, // ทำให้ Chip จางลง
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                    >
                      {isDeleted ? (
                        // ถ้าถูกลบแล้ว ให้แสดงปุ่ม Restore (ซ่อนสำหรับ SEO Dev)
                        !isSeoDevView && (
                          <Tooltip title="กู้คืน">
                            <IconButton
                              onClick={() => onRestore(user.id)}
                              size="small"
                              color="success"
                            >
                              <RestoreFromTrash fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )
                      ) : (
                        // ถ้ายังไม่ถูกลบ ให้แสดงปุ่มปกติ
                        <>
                          {user.role === Role.CUSTOMER && canViewReport && (
                            <Tooltip title="ดูหน้ารายงานของลูกค้า">
                              <IconButton
                                component={Link}
                                href={`/customer/${user.id}/report`}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                color="secondary"
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {user.role === Role.CUSTOMER && (
                            <Tooltip title="จัดการข้อมูล Domain">
                              <IconButton
                                onClick={() => onOpenMetrics(user)}
                                size="small"
                                sx={{
                                  color: "secondary.main",
                                  "&:hover": {
                                    bgcolor: "rgba(100, 100, 255, 0.1)",
                                  },
                                }}
                              >
                                <BarChart fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="แก้ไข">
                            <IconButton
                              onClick={() => onEdit(user)}
                              size="small"
                              sx={{
                                color: "info.main",
                                "&:hover": {
                                  bgcolor: "rgba(149, 146, 255, 0.1)",
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {!isSeoDevView && (
                            <Tooltip title="ลบ">
                              <IconButton
                                onClick={() => onDelete(user.id)}
                                size="small"
                                sx={{
                                  color: "error.main",
                                  "&:hover": {
                                    bgcolor: "rgba(244, 67, 54, 0.1)",
                                  },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
