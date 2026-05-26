"use client";

import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListContractFiles } from "../../hooks/useContractFiles";

interface MyContractFilesProps {
  customerId: string;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MyContractFiles({ customerId }: MyContractFilesProps) {
  const { data: files, isLoading } = useListContractFiles(customerId);

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!files?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          ยังไม่มีไฟล์สัญญา
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{file.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  อัปโหลดเมื่อ {formatDate(file.uploadDate)}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-1 size-4" />
                ดาวน์โหลด
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
