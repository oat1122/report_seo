"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  Tooltip,
  Stack,
} from "@mui/material";
import { Role } from "@/types/auth";
import { User, UserFormState } from "@/types/user";
import { getRoleLabel } from "./lib/userUtils";
import { useSession } from "next-auth/react";
import {
  Visibility,
  VisibilityOff,
  Edit as EditIcon,
} from "@mui/icons-material";

interface UserModalProps {
  open: boolean;
  isEditing: boolean;
  currentUser: UserFormState;
  onClose: () => void;
  onSave: () => void;
  onSavePassword: () => void;
  onFormChange: (name: string, value: string | Role | boolean) => void;
  seoDevs: User[];
  isSeoDevView?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  isEditing,
  currentUser,
  onClose,
  onSave,
  onSavePassword,
  onFormChange,
  seoDevs,
  isSeoDevView = false,
}) => {
  const { data: session } = useSession();
  const canEditRole = session?.user?.role === Role.ADMIN;
  const isOwnProfile = session?.user?.id === currentUser.id;

  // State สำหรับจัดการการแก้ไขรหัสผ่านและการแสดงผล
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (event: SelectChangeEvent<Role>) => {
    onFormChange("role", event.target.value as Role);
  };

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    onFormChange(name, type === "checkbox" ? checked : value);
  };

  const handleSeoDevChange = (event: SelectChangeEvent<string>) => {
    onFormChange("seoDevId", event.target.value);
  };

  // ฟังก์ชันสำหรับ Toggle การแสดงผลรหัสผ่าน
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ฟังก์ชันสำหรับเปิด/ปิดโหมดแก้ไขรหัสผ่าน
  const handleTogglePasswordEdit = () => {
    setIsPasswordEditing(!isPasswordEditing);
    // Reset password fields เมื่อปิดโหมดแก้ไข
    if (isPasswordEditing) {
      onFormChange("currentPassword", "");
      onFormChange("newPassword", "");
      onFormChange("confirmPassword", "");
    }
  };

  // ฟังก์ชันสำหรับปิด Modal พร้อมรีเซ็ต state
  const handleCloseModal = () => {
    setIsPasswordEditing(false);
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      sx={{
        backdropFilter: "blur(4px)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500 },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          p: 4,
          borderRadius: 3,
        }}
      >
        {/* Modal Header */}
        <Box>
          <Typography variant="h4" component="h2" mb={1} fontWeight={700}>
            {isEditing ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {isEditing
              ? "แก้ไขข้อมูลผู้ใช้งานในระบบ"
              : "กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่"}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="ชื่อผู้ใช้"
          name="name"
          value={currentUser.name || ""}
          onChange={handleFormChange}
          margin="normal"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <TextField
          fullWidth
          label="อีเมล"
          name="email"
          type="email"
          value={currentUser.email || ""}
          onChange={handleFormChange}
          margin="normal"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        {!isEditing && (
          <TextField
            fullWidth
            label="รหัสผ่าน"
            name="password"
            type={showPassword ? "text" : "password"}
            onChange={handleFormChange}
            margin="normal"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        )}
        <FormControl
          fullWidth
          margin="normal"
          disabled={isSeoDevView && !canEditRole}
        >
          <InputLabel id="role-label">บทบาท</InputLabel>
          <Select
            labelId="role-label"
            label="บทบาท"
            value={currentUser.role || ""}
            onChange={handleRoleChange}
            sx={{
              borderRadius: 2,
            }}
          >
            {Object.values(Role).map((role) => (
              <MenuItem
                key={role}
                value={role}
                disabled={isSeoDevView && role !== Role.CUSTOMER}
              >
                {getRoleLabel(role)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* แสดงฟิลด์ Customer สำหรับทั้งสร้างและแก้ไข */}
        {currentUser.role === Role.CUSTOMER && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "rgba(149, 146, 255, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(149, 146, 255, 0.2)",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              mb={2}
              color="info.main"
            >
              ข้อมูลบริษัท
            </Typography>
            <TextField
              fullWidth
              label="ชื่อบริษัท"
              name="companyName"
              value={currentUser.companyName || ""}
              onChange={handleFormChange}
              margin="normal"
              required={!isEditing}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "white",
                },
              }}
            />
            <TextField
              fullWidth
              label="โดเมน (เช่น example.com)"
              name="domain"
              value={currentUser.domain || ""}
              onChange={handleFormChange}
              margin="normal"
              required={!isEditing}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "white",
                },
              }}
            />

            {/* Dropdown สำหรับเลือก SEO Dev */}
            {!isSeoDevView && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="seodev-label">ผู้ดูแล (SEO Dev)</InputLabel>
                <Select
                  labelId="seodev-label"
                  label="ผู้ดูแล (SEO Dev)"
                  value={currentUser.seoDevId || ""}
                  onChange={handleSeoDevChange}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "white",
                  }}
                >
                  <MenuItem value="">
                    <em>-- ไม่กำหนด --</em>
                  </MenuItem>
                  {seoDevs.map((dev) => (
                    <MenuItem key={dev.id} value={dev.id}>
                      {dev.name || dev.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {isEditing && (
          <Box mt={3}>
            <Divider sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="overline">Change Password</Typography>
                <Tooltip title={isPasswordEditing ? "ยกเลิก" : "แก้ไขรหัสผ่าน"}>
                  <IconButton onClick={handleTogglePasswordEdit} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Divider>

            {isPasswordEditing && (
              <>
                {isOwnProfile && !canEditRole && (
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    onChange={handleFormChange}
                    margin="normal"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  onChange={handleFormChange}
                  margin="normal"
                  variant="outlined"
                  disabled={isSeoDevView && !isOwnProfile}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          disabled={isSeoDevView && !isOwnProfile}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  onChange={handleFormChange}
                  margin="normal"
                  variant="outlined"
                  disabled={isSeoDevView && !isOwnProfile}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Dedicated Save Password Button */}
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={onSavePassword}
                  disabled={
                    !currentUser.newPassword ||
                    !currentUser.confirmPassword ||
                    (isOwnProfile &&
                      !canEditRole &&
                      !currentUser.currentPassword)
                  }
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Save Password
                </Button>
              </>
            )}
          </Box>
        )}

        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: "9999px",
              px: 3,
              borderColor: "#E2E8F0",
              color: "text.primary",
              "&:hover": {
                borderColor: "#CBD5E0",
                bgcolor: "rgba(0,0,0,0.02)",
              },
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onSave}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              px: 4,
              fontWeight: 600,
            }}
          >
            {isEditing ? "บันทึกการเปลี่ยนแปลง" : "สร้างผู้ใช้งาน"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
