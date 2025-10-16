// src/components/shared/toast/ToastComponents.tsx
import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";

// Base component for toast content
const ToastContent = ({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {icon}
    <Typography variant="body2" sx={{ ml: 1.5 }}>
      {message}
    </Typography>
  </Box>
);

// Specific toast components for different states
export const PendingToast = ({ message }: { message: string }) => (
  <ToastContent
    icon={<CircularProgress size={20} color="inherit" />}
    message={message}
  />
);

export const SuccessToast = ({ message }: { message: string }) => (
  <ToastContent icon={<CheckCircle />} message={message} />
);

export const ErrorToast = ({ message }: { message: string }) => (
  <ToastContent icon={<Error />} message={message} />
);
