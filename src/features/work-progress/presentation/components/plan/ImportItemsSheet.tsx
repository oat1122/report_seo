"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CloudUpload, FileSpreadsheet } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  importPlanItemRowSchema,
  type ImportPlanItemRowInput,
} from "@/features/work-progress/schemas/import";
import { useImportItems } from "../../hooks/useItemMutations";

interface ImportItemsSheetProps {
  userId: string;
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RowDraft {
  raw: Record<string, unknown>;
  parsed: ImportPlanItemRowInput | null;
  error: string | null;
}

export function ImportItemsSheet({
  userId,
  planId,
  open,
  onOpenChange,
}: ImportItemsSheetProps) {
  const [drafts, setDrafts] = useState<RowDraft[]>([]);
  const [parsing, setParsing] = useState(false);
  const importMut = useImportItems();

  const handleFile = async (file: File) => {
    setParsing(true);
    try {
      const rows = await parseFileToRows(file);
      const next = rows.map<RowDraft>((raw) => {
        const result = importPlanItemRowSchema.safeParse(raw);
        if (result.success) {
          return { raw, parsed: result.data, error: null };
        }
        return {
          raw,
          parsed: null,
          error: result.error.issues
            .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
            .join(" · "),
        };
      });
      setDrafts(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อ่านไฟล์ไม่สำเร็จ");
    } finally {
      setParsing(false);
    }
  };

  const validRows = drafts
    .map((d) => d.parsed)
    .filter((r): r is ImportPlanItemRowInput => r !== null);
  const errorCount = drafts.length - validRows.length;

  const confirmImport = async () => {
    if (validRows.length === 0) return;
    try {
      const result = await importMut.mutateAsync({
        userId,
        planId,
        body: { rows: validRows },
      });
      toast.success(`Import สำเร็จ ${result.count} รายการ`);
      setDrafts([]);
      onOpenChange(false);
    } catch {
      // axios interceptor toasts the error
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Import รายการจาก CSV / XLSX</SheetTitle>
          <SheetDescription>
            คอลัมน์ที่รองรับ: categoryCode, activity, statusCode (optional),
            duration, weight, description, note
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <FileDropzone onFile={handleFile} parsing={parsing} />

          {drafts.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{validRows.length} valid</Badge>
                {errorCount > 0 && (
                  <Badge variant="outline" className="text-destructive">
                    {errorCount} error
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrafts([])}
                  className="ml-auto"
                >
                  ล้าง
                </Button>
              </div>

              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>categoryCode</TableHead>
                      <TableHead>activity</TableHead>
                      <TableHead>statusCode</TableHead>
                      <TableHead>duration</TableHead>
                      <TableHead className="text-right">weight</TableHead>
                      <TableHead>note / error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drafts.map((d, idx) => (
                      <TableRow
                        key={idx}
                        className={cn(d.error && "bg-destructive/10")}
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="text-xs">
                          {pickStr(d.raw, "categoryCode")}
                        </TableCell>
                        <TableCell className="text-xs">
                          {pickStr(d.raw, "activity")}
                        </TableCell>
                        <TableCell className="text-xs">
                          {pickStr(d.raw, "statusCode") || "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {pickStr(d.raw, "duration") || "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {pickStr(d.raw, "weight") || "1"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {d.error ? (
                            <span className="text-destructive">{d.error}</span>
                          ) : (
                            pickStr(d.raw, "note")
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={confirmImport}
                  disabled={validRows.length === 0 || importMut.isPending}
                >
                  Import {validRows.length} รายการ
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface FileDropzoneProps {
  onFile: (file: File) => void;
  parsing: boolean;
}

function FileDropzone({ onFile, parsing }: FileDropzoneProps) {
  return (
    <label
      className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition hover:border-primary/40 hover:bg-muted/50"
      htmlFor="import-file-input"
    >
      {parsing ? (
        <CloudUpload className="size-8 animate-pulse text-muted-foreground" />
      ) : (
        <FileSpreadsheet className="size-8 text-muted-foreground" />
      )}
      <span className="text-sm font-medium">
        {parsing ? "กำลังอ่านไฟล์..." : "เลือกไฟล์ CSV หรือ XLSX"}
      </span>
      <span className="text-xs text-muted-foreground">
        แถวแรกต้องเป็น header — ค่ารองรับ: categoryCode, activity, statusCode,
        duration, weight, description, note
      </span>
      <input
        id="import-file-input"
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}

async function parseFileToRows(file: File): Promise<Record<string, unknown>[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const { default: Papa } = await import("papaparse");
    const text = await file.text();
    const result = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });
    if (result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }
    return result.data;
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const xlsx = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = xlsx.read(buffer, { type: "array" });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) throw new Error("ไฟล์ XLSX ไม่มีชีต");
    const sheet = wb.Sheets[firstSheetName];
    return xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
  }
  throw new Error("รองรับเฉพาะ .csv และ .xlsx");
}

function pickStr(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  if (v === null || v === undefined) return "";
  return String(v);
}
