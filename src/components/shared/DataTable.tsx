"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<TRow> {
  key: string;
  header: ReactNode;
  cell: (row: TRow, index: number) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow, index: number) => string | number;
  emptyState?: ReactNode;
  caption?: ReactNode;
  onRowClick?: (row: TRow) => void;
  rowClassName?: (row: TRow, index: number) => string | undefined;
  className?: string;
  stickyHeader?: boolean;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function DataTable<TRow>({
  columns,
  rows,
  getRowKey,
  emptyState,
  caption,
  onRowClick,
  rowClassName,
  className,
  stickyHeader,
}: DataTableProps<TRow>) {
  const hasRows = rows.length > 0;

  return (
    <Table className={className}>
      {caption}
      <TableHeader
        className={cn(stickyHeader && "sticky top-0 z-10 bg-card")}
      >
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                col.align && alignClass[col.align],
                col.headerClassName,
              )}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {hasRows ? (
          rows.map((row, index) => (
            <TableRow
              key={getRowKey(row, index)}
              data-clickable={onRowClick ? "" : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                onRowClick && "cursor-pointer",
                rowClassName?.(row, index),
              )}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    col.align && alignClass[col.align],
                    col.className,
                  )}
                >
                  {col.cell(row, index)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="py-8 text-center text-muted-foreground"
            >
              {emptyState ?? "ยังไม่มีข้อมูล"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
