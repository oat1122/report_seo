"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Role } from "@/types";
import { useGetCombinedHistory } from "@/hooks/api/useCustomersApi";
import { HistoryModal } from "@/features/users/presentation/components/MetricsModal/HistoryModal";

interface HistoryButtonProps {
  role: Role | undefined;
  customerUserId: string | null;
  customerName: string;
}

export const HistoryButton = ({
  role,
  customerUserId,
  customerName,
}: HistoryButtonProps) => {
  const [open, setOpen] = useState(false);
  const isCustomer = role === Role.CUSTOMER;
  const { data } = useGetCombinedHistory(open ? customerUserId : null);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="ดูประวัติการเปลี่ยนแปลง"
              disabled={!isCustomer}
              onClick={() => setOpen(true)}
              className="rounded-full"
            >
              <Clock className="size-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>ดูประวัติการเปลี่ยนแปลง</TooltipContent>
      </Tooltip>

      <HistoryModal
        open={open}
        onClose={() => setOpen(false)}
        history={data?.metricsHistory ?? []}
        keywordHistory={data?.keywordHistory ?? []}
        customerName={customerName}
      />
    </>
  );
};
