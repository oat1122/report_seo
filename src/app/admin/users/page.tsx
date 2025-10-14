"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { Role } from "@/types/auth";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User & { password?: string }>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (user?: User) => {
    setIsEditing(!!user);
    setCurrentUser(user || {});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentUser({});
  };

  const handleSave = async () => {
    const url = isEditing ? `/api/users/${currentUser.id}` : "/api/users";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });

      if (!response.ok) {
        throw new Error("Failed to save user");
      }

      fetchUsers();
      handleClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
        if (!response.ok) {
          throw new Error("Failed to delete user");
        }
        fetchUsers();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<Role>) => {
    setCurrentUser({
      ...currentUser,
      role: event.target.value as Role,
    });
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            Add User
          </Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(user)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Modal open={open} onClose={handleClose}>
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
              value={currentUser.name || ""}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, name: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={currentUser.email || ""}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, email: e.target.value })
              }
              margin="normal"
            />
            {!isEditing && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, password: e.target.value })
                }
                margin="normal"
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
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
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>
                Save
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </DashboardLayout>
  );
};

export default UserManagementPage;
