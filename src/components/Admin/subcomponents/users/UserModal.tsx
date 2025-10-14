"use client";

import React from "react";
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
} from "@mui/material";
import { Role } from "@/types/auth";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
}

interface UserFormState extends Partial<User> {
  password?: string;
  companyName?: string;
  domain?: string;
  seoDevId?: string | null;
}

interface UserModalProps {
  open: boolean;
  isEditing: boolean;
  currentUser: UserFormState;
  onClose: () => void;
  onSave: () => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserFormState>>;
  seoDevs: User[]; // รับ props seoDevs
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  isEditing,
  currentUser,
  onClose,
  onSave,
  setCurrentUser,
  seoDevs, // รับค่า seoDevs มาจาก props
}) => {
  const handleRoleChange = (event: SelectChangeEvent<Role>) => {
    setCurrentUser({
      ...currentUser,
      role: event.target.value as Role,
    });
  };

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handler สำหรับ Select ของ SEO Dev
  const handleSeoDevChange = (event: SelectChangeEvent<string>) => {
    setCurrentUser((prev) => ({ ...prev, seoDevId: event.target.value }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" mb={2}>
          {isEditing ? "Edit User" : "Add User"}
        </Typography>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={currentUser.name || ""}
          onChange={handleFormChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={currentUser.email || ""}
          onChange={handleFormChange}
          margin="normal"
        />
        {!isEditing && (
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            onChange={handleFormChange}
            margin="normal"
          />
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            label="Role"
            value={currentUser.role || ""}
            onChange={handleRoleChange}
          >
            {Object.values(Role).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* แสดงฟิลด์ Customer สำหรับทั้งสร้างและแก้ไข */}
        {currentUser.role === Role.CUSTOMER && (
          <>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={currentUser.companyName || ""}
              onChange={handleFormChange}
              margin="normal"
              required={!isEditing}
            />
            <TextField
              fullWidth
              label="Domain (e.g., example.com)"
              name="domain"
              value={currentUser.domain || ""}
              onChange={handleFormChange}
              margin="normal"
              required={!isEditing}
            />

            {/* Dropdown สำหรับเลือก SEO Dev (แสดงทั้งตอนสร้างและแก้ไข) */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="seodev-label">ผู้ดูแล (SEO Dev)</InputLabel>
              <Select
                labelId="seodev-label"
                label="ผู้ดูแล (SEO Dev)"
                value={currentUser.seoDevId || ""}
                onChange={handleSeoDevChange}
              >
                <MenuItem value="">
                  <em>-- ไม่กำหนด --</em>
                </MenuItem>
                {seoDevs.map((dev) => (
                  <MenuItem key={dev.id} value={dev.id}>
                    {dev.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} variant="contained" sx={{ ml: 1 }}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
