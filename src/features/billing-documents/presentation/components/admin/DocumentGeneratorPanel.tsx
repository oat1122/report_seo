"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateDocument } from "../../hooks/useDocuments";
import { DOCUMENT_TYPE_LABELS } from "../../../domain/DocumentType";
import type { BillingDocumentType } from "../../../domain/DocumentType";

interface Props {
  customerId: string;
}

export function DocumentGeneratorPanel({ customerId }: Props) {
  const generateMutation = useGenerateDocument(customerId);

  const [type, setType] = useState<BillingDocumentType>("INVOICE");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paidDate, setPaidDate] = useState("");

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        type,
        note: note || null,
        dueDate: dueDate || null,
        paidDate: paidDate || null,
      },
      {
        onSuccess: (doc) => {
          toast.success(
            `สร้าง${DOCUMENT_TYPE_LABELS[type]} ${doc.documentNumber} เรียบร้อย`,
          );
          setNote("");
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>สร้างเอกสาร</CardTitle>
        <CardDescription>
          เลือกประเภทเอกสารและกดสร้าง PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <Label>ประเภทเอกสาร</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as BillingDocumentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(DOCUMENT_TYPE_LABELS) as [
                    BillingDocumentType,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {(type === "INVOICE" || type === "BILLING_NOTE") && (
            <Field>
              <Label>กำหนดชำระ</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          )}

          {type === "RECEIPT" && (
            <Field>
              <Label>วันที่ชำระ</Label>
              <Input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </Field>
          )}

          <Field>
            <Label>หมายเหตุ (ถ้ามี)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </Field>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-info text-info-foreground hover:bg-info/90"
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <FileText className="mr-2 size-4" />
            )}
            สร้าง PDF
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
