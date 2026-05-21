"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeywordReportHistory } from "@/types/history";
import { cn } from "@/lib/utils";
import { HistoryBulkToolbar } from "./HistoryBulkToolbar";

interface VisibilityPayload {
  historyId?: string;
  historyIds?: string[];
  isVisible: boolean;
}

interface HistoryKeywordsTabProps {
  history: KeywordReportHistory[];
  isLoading?: boolean;
  canManage?: boolean;
  onToggleVisibility?: (payload: VisibilityPayload) => void;
}

export const HistoryKeywordsTab = ({
  history,
  isLoading = false,
  canManage = false,
  onToggleVisibility,
}: HistoryKeywordsTabProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleCount = history.filter((h) => h.isVisible).length;

  const groupedHistory = useMemo(
    () =>
      history.reduce(
        (acc, record) => {
          (acc[record.keyword] ??= []).push(record);
          return acc;
        },
        {} as Record<string, KeywordReportHistory[]>,
      ),
    [history],
  );

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleBulkSet = (isVisible: boolean) => {
    if (selectedIds.length === 0) return;
    onToggleVisibility?.({ historyIds: selectedIds, isVisible });
    setSelectedIds([]);
  };

  const handleToggleSingle = (historyId: string, nextVisible: boolean) =>
    onToggleVisibility?.({ historyId, isVisible: nextVisible });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-8 animate-spin text-info" />
      </div>
    );
  }

  const entries = Object.entries(groupedHistory);
  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        ไม่พบข้อมูลประวัติ Keywords
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <HistoryBulkToolbar
          visibleCount={visibleCount}
          totalCount={history.length}
          selectedCount={selectedIds.length}
          onShow={() => handleBulkSet(true)}
          onHide={() => handleBulkSet(false)}
        />
      )}

      {entries.map(([keyword, records]) => {
        const sorted = records
          .slice()
          .sort(
            (a, b) =>
              new Date(b.dateRecorded).getTime() -
              new Date(a.dateRecorded).getTime(),
          );
        return (
          <div key={keyword}>
            <h4 className="mb-2 flex items-center gap-2 text-base font-semibold">
              {keyword}
              {sorted[0]?.isTopReport && (
                <Badge className="bg-info text-info-foreground">Top Report</Badge>
              )}
            </h4>
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canManage && <TableHead className="w-10" />}
                    {canManage && (
                      <TableHead className="text-center">แสดง</TableHead>
                    )}
                    <TableHead>วันที่บันทึก</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-center">Traffic</TableHead>
                    <TableHead className="text-center">KD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((record) => {
                    const isSelected = selectedIds.includes(record.id);
                    return (
                      <TableRow
                        key={record.id}
                        data-state={isSelected ? "selected" : undefined}
                        className={cn(!record.isVisible && "opacity-55")}
                      >
                        {canManage && (
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelected(record.id)}
                              aria-label="เลือกแถว"
                            />
                          </TableCell>
                        )}
                        {canManage && (
                          <TableCell className="text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Checkbox
                                    checked={record.isVisible}
                                    onCheckedChange={(c) =>
                                      handleToggleSingle(record.id, c === true)
                                    }
                                    aria-label="แสดงในรายงานลูกค้า"
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {record.isVisible
                                  ? "กดเพื่อซ่อนจากลูกค้า"
                                  : "กดเพื่อเปิดให้ลูกค้าเห็น"}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        )}
                        <TableCell>
                          {new Date(record.dateRecorded).toLocaleString("th-TH")}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.position || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.traffic.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{record.kd}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
