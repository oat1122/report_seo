"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ProvidersProps {
  children: ReactNode;
}

// NextAuth + Redux + React Query + Tooltip providers (no MUI — โปรเจกต์ใช้ shadcn/Tailwind ทั้งหมด)
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
