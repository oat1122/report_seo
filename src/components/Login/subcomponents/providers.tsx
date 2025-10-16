"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/theme/theme";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * NextAuth SessionProvider และ MUI ThemeProvider wrapper
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
