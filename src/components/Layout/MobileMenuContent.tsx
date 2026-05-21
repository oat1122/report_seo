"use client";

import { signOut } from "next-auth/react";
import { Clock, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Role } from "@/types";
import { useState } from "react";
import { useGetCombinedHistory } from "@/hooks/api/useCustomersApi";
import { HistoryModal } from "@/features/users/presentation/components/MetricsModal/HistoryModal";
import { ThemeToggle } from "./ThemeToggle";

interface MobileMenuContentProps {
  userName: string;
  userRole: Role | undefined;
  customerUserId: string | null;
  isLoading: boolean;
  onAction: () => void;
}

export const MobileMenuContent = ({
  userName,
  userRole,
  customerUserId,
  isLoading,
  onAction,
}: MobileMenuContentProps) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const isCustomer = userRole === Role.CUSTOMER;
  const { data: historyData } = useGetCombinedHistory(
    historyOpen ? customerUserId : null,
  );

  const handleLogout = async () => {
    onAction();
    await signOut({ callbackUrl: "/" });
  };

  const handleOpenHistory = () => {
    setHistoryOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-1 px-4">
        <div className="flex items-center gap-2 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted">
            <User className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <>
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  {userRole ?? "USER"}
                </p>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-muted-foreground">โหมดสี</span>
          <ThemeToggle />
        </div>

        <Separator />

        {isCustomer && (
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handleOpenHistory}
          >
            <Clock className="size-4" />
            ดูประวัติการเปลี่ยนแปลง
          </Button>
        )}

        <Button
          variant="ghost"
          className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          ออกจากระบบ
        </Button>
      </div>

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyData?.metricsHistory ?? []}
        keywordHistory={historyData?.keywordHistory ?? []}
        customerName={userName}
      />
    </>
  );
};
