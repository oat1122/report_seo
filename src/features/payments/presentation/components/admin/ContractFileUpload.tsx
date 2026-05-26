"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Trash2, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useListContractFiles,
  useUploadContractFile,
  useDeleteContractFile,
} from "../../hooks/useContractFiles";

interface ContractFileUploadProps {
  customerId: string;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ContractFileUpload({ customerId }: ContractFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { data: files, isLoading } = useListContractFiles(customerId);
  const uploadMutation = useUploadContractFile();
  const deleteMutation = useDeleteContractFile();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ customerId, file });
    e.target.value = "";
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ customerId, contractId: deleteTarget.id });
    setDeleteTarget(null);
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">ไฟล์สัญญา</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Upload className="mr-1 size-4" />
            )}
            อัปโหลดสัญญา
          </Button>
        </div>
      </div>

      {files?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ยังไม่มีไฟล์สัญญา
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {files?.map((file) => (
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
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" asChild>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="size-4" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    setDeleteTarget({ id: file.id, name: file.fileName })
                  }
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ &quot;{deleteTarget?.name}&quot; ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
