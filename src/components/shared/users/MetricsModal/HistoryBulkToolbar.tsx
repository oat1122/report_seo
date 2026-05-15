"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryBulkToolbarProps {
  visibleCount: number;
  totalCount: number;
  selectedCount: number;
  onShow: () => void;
  onHide: () => void;
}

// Bulk action toolbar — shared by HistoryMetricsTab + HistoryKeywordsTab
export const HistoryBulkToolbar = ({
  visibleCount,
  totalCount,
  selectedCount,
  onShow,
  onHide,
}: HistoryBulkToolbarProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">
        แสดงให้ลูกค้าเห็น {visibleCount} จาก {totalCount} รายการ
      </p>
      {selectedCount > 0 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onShow}
            className="border-success/40 text-success hover:bg-success/10"
          >
            <Eye className="size-4" />
            เปิด ({selectedCount})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onHide}
            className="border-warning/40 text-warning hover:bg-warning/10"
          >
            <EyeOff className="size-4" />
            ซ่อน ({selectedCount})
          </Button>
        </div>
      )}
    </div>
  );
};
