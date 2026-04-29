"use client";

import { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer area error:", error);
  }, [error]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          border: "2px solid",
          borderColor: "divider",
          textAlign: "center",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "#d32f2f1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 40, color: "error.main" }} />
          </Box>
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              เกิดข้อผิดพลาด
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ขออภัย ระบบไม่สามารถโหลดหน้านี้ได้ในขณะนี้
            </Typography>
            {error.digest && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "monospace", opacity: 0.7 }}
              >
                ref: {error.digest}
              </Typography>
            )}
          </Stack>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={reset}
          >
            ลองใหม่อีกครั้ง
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
