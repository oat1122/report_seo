"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { Role } from "@/types/auth";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { UserTable } from "./UserTable";
import { UserModal } from "./UserModal";

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
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (user?: User) => {
    setIsEditing(!!user);
    if (user) {
      if (user.role === Role.CUSTOMER) {
        try {
          const response = await fetch(`/api/users/${user.id}`);
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser({
              ...user,
              companyName: userData.customerProfile?.name,
              domain: userData.customerProfile?.domain,
            });
          } else {
            setCurrentUser(user);
          }
        } catch (err) {
          console.error("Failed to fetch customer data:", err);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(user);
      }
    } else {
      setCurrentUser({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentUser({});
  };

  const handleSave = async () => {
    if (
      currentUser.role === Role.CUSTOMER &&
      (!currentUser.companyName || !currentUser.domain)
    ) {
      setError("Company Name and Domain are required for customers.");
      return;
    }

    const url = isEditing ? `/api/users/${currentUser.id}` : "/api/users";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save user");
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
        if (!response.ok) throw new Error("Failed to delete user");
        fetchUsers();
      } catch (err) {
        setError((err as Error).message);
      }
    }
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
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <UserTable
            users={users}
            onEdit={handleOpen}
            onDelete={handleDelete}
          />
        )}

        <UserModal
          open={open}
          isEditing={isEditing}
          currentUser={currentUser}
          onClose={handleClose}
          onSave={handleSave}
          setCurrentUser={setCurrentUser}
        />
      </Container>
    </DashboardLayout>
  );
};

export default UserManagement;
