"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store } from "@/store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ProvidersProps {
  children: ReactNode;
}

// NextAuth + Redux + React Query + next-themes + Tooltip providers
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
