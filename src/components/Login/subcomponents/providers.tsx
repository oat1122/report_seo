"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/theme/theme";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * NextAuth SessionProvider และ MUI ThemeProvider wrapper
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
