"use client";

import { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";
import { HistoryMetricsTab } from "./HistoryMetricsTab";
import { HistoryKeywordsTab } from "./HistoryKeywordsTab";

interface VisibilityPayload {
  historyId?: string;
  historyIds?: string[];
  isVisible: boolean;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: OverallMetricsHistory[];
  keywordHistory?: KeywordReportHistory[];
  customerName: string;
  isLoading?: boolean;
  canManage?: boolean;
  onToggleMetricsVisibility?: (payload: VisibilityPayload) => void;
  onToggleKeywordVisibility?: (payload: VisibilityPayload) => void;
}

export const HistoryModal = ({
  open,
  onClose,
  history,
  keywordHistory = [],
  customerName,
  isLoading = false,
  canManage = false,
  onToggleMetricsVisibility,
  onToggleKeywordVisibility,
}: HistoryModalProps) => {
  const [tab, setTab] = useState("metrics");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ประวัติการเปลี่ยนแปลง</DialogTitle>
          <DialogDescription>
            ลูกค้า: <span className="font-semibold text-foreground">{customerName}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="metrics">
              <BarChart3 className="size-4" />
              Overall Metrics
            </TabsTrigger>
            <TabsTrigger value="keywords">
              <TrendingUp className="size-4" />
              Keywords History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="mt-4">
            <HistoryMetricsTab
              history={history}
              isLoading={isLoading}
              canManage={canManage}
              onToggleVisibility={onToggleMetricsVisibility}
            />
          </TabsContent>

          <TabsContent value="keywords" className="mt-4">
            <HistoryKeywordsTab
              history={keywordHistory}
              isLoading={isLoading}
              canManage={canManage}
              onToggleVisibility={onToggleKeywordVisibility}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
