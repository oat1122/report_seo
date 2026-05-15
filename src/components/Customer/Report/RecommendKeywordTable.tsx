"use client";

import React from "react";
import { Lightbulb, Star, Sparkles, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { KeywordRecommend } from "@/types/metrics";

interface RecommendKeywordTableProps {
  keywords: KeywordRecommend[];
  title?: string;
}

const kdStyle: Record<string, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "bg-success/10 text-success" },
  MEDIUM: { label: "Medium", className: "bg-warning/10 text-warning" },
  HARD: { label: "Hard", className: "bg-destructive/10 text-destructive" },
};

const getKdStyle = (kd: string | null | undefined) =>
  (kd && kdStyle[kd]) || kdStyle.MEDIUM;

const KeywordCard: React.FC<{ kw: KeywordRecommend }> = ({ kw }) => {
  const kd = kw.kd ? getKdStyle(kw.kd) : null;
  const isTop = kw.isTopReport;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
        isTop && "bg-warning/5",
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            isTop ? "bg-warning/15 text-warning" : "bg-info/15 text-info",
          )}
        >
          {isTop ? <Sparkles className="size-4" /> : <Lightbulb className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-bold">{kw.keyword}</p>
          {isTop && (
            <Badge className="gap-1 border-warning bg-warning/15 text-warning">
              <Star className="size-3" />
              Top Pick
            </Badge>
          )}
        </div>
        {kd && (
          <Badge className={cn("min-w-16 justify-center font-semibold", kd.className)}>
            {kd.label}
          </Badge>
        )}
      </div>
      {kw.note && (
        <div className="rounded-lg border border-info/10 bg-info/5 p-3">
          <p className="text-sm text-muted-foreground">{kw.note}</p>
        </div>
      )}
    </div>
  );
};

export const RecommendKeywordTable: React.FC<RecommendKeywordTableProps> = ({
  keywords,
  title,
}) => {
  if (keywords.length === 0) return null;

  const topCount = keywords.filter((k) => k.isTopReport).length;

  return (
    <>
      {/* Mobile: card layout */}
      <div className="md:hidden">
        {title && <h3 className="mb-3 text-xl font-bold">{title}</h3>}
        <div className="flex flex-col gap-3">
          {keywords.map((kw) => (
            <KeywordCard key={kw.id} kw={kw} />
          ))}
        </div>
      </div>

      {/* Desktop: compact table */}
      <div className="hidden h-fit max-h-[600px] overflow-hidden rounded-2xl border border-border md:block">
        {title && (
          <div className="bg-gradient-to-br from-secondary to-secondary/80 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-secondary-foreground" />
              <h3 className="font-bold text-secondary-foreground">{title}</h3>
            </div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                Keyword
              </TableHead>
              <TableHead className="w-20 text-center text-xs font-bold tracking-wider uppercase text-muted-foreground">
                KD
              </TableHead>
              <TableHead className="w-12 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="mx-auto size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Strategic Note</TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw) => {
              const kd = kw.kd ? getKdStyle(kw.kd) : null;
              const isTop = kw.isTopReport;
              return (
                <TableRow key={kw.id} className={cn(isTop && "bg-warning/5")}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          isTop ? "bg-warning" : "bg-info",
                        )}
                      />
                      <span className="text-sm font-semibold">{kw.keyword}</span>
                      {isTop && (
                        <Star className="ml-auto size-3.5 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {kd && (
                      <Badge className={cn("min-w-14 justify-center font-semibold", kd.className)}>
                        {kd.label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {kw.note && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="mx-auto size-4 cursor-pointer text-info" />
                        </TooltipTrigger>
                        <TooltipContent side="left">{kw.note}</TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="border-t border-border bg-info/5 p-2 text-center">
          <p className="text-xs font-semibold text-muted-foreground">
            {keywords.length} recommendations • {topCount} top priorities
          </p>
        </div>
      </div>
    </>
  );
};
