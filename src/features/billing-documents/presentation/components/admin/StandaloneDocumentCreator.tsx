"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateSelector } from "./TemplateSelector";
import { CustomerSearchCombobox } from "./CustomerSearchCombobox";
import {
  DocumentItemsEditor,
  createItemKey,
  type EditableItem,
} from "./DocumentItemsEditor";
import { useDocumentTemplate } from "../../hooks/useDocumentTemplates";
import { useGenerateStandaloneDocument } from "../../hooks/useStandaloneDocument";
import { DOCUMENT_TYPE_LABELS } from "../../../domain/DocumentType";
import type { BillingDocumentType } from "../../../domain/DocumentType";
import type { CustomerForDocument } from "../../../application/ports/BillingDocumentRepository";

type Mode = "manual" | "autofill";

export function StandaloneDocumentCreator() {
  const generateMutation = useGenerateStandaloneDocument();

  const [mode, setMode] = useState<Mode>("manual");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerForDocument | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");
  const [customerContactName, setCustomerContactName] = useState("");

  const [type, setType] = useState<BillingDocumentType>("INVOICE");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paidDate, setPaidDate] = useState("");

  const [items, setItems] = useState<EditableItem[]>([
    {
      key: createItemKey(),
      description: "ค่าบริการ",
      quantity: 1,
      unit: "รายการ",
      unitPrice: 0,
    },
  ]);

  const { data: template } = useDocumentTemplate(templateId);

  useEffect(() => {
    if (template?.items && template.items.length > 0) {
      setItems(
        [...template.items]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((i) => ({
            key: createItemKey(),
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
          })),
      );
    }
  }, [template]);

  const handleCustomerSelect = (customer: CustomerForDocument | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerAddress(customer.address ?? "");
      setCustomerTaxId(customer.taxId ?? "");
      setCustomerContactName(customer.contactName ?? "");
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as Mode);
    if (newMode === "manual") {
      setSelectedCustomer(null);
    }
  };

  const total = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  const isValid =
    customerName.trim().length > 0 &&
    templateId !== null &&
    items.length > 0 &&
    items.every((i) => i.description.trim());

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        customerId: selectedCustomer?.id ?? null,
        customer: {
          name: customerName.trim(),
          address: customerAddress.trim() || null,
          taxId: customerTaxId.trim() || null,
          contactName: customerContactName.trim() || null,
        },
        type,
        templateId: templateId!,
        items: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
        })),
        note: note.trim() || null,
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
    <div className="flex flex-col gap-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลลูกค้า</CardTitle>
          <CardDescription>
            กรอกข้อมูลเอง หรือเลือกจากลูกค้าที่มีในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Tabs value={mode} onValueChange={handleModeChange}>
              <TabsList className="w-full">
                <TabsTrigger value="manual" className="flex-1">
                  กรอกเอง
                </TabsTrigger>
                <TabsTrigger value="autofill" className="flex-1">
                  เลือกจากระบบ
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === "autofill" && (
              <Field>
                <Label>ค้นหาลูกค้า</Label>
                <CustomerSearchCombobox
                  selected={selectedCustomer}
                  onSelect={handleCustomerSelect}
                />
              </Field>
            )}

            {selectedCustomer && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedCustomer.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ข้อมูลจากระบบ — แก้ไขได้ก่อนสร้างเอกสาร
                </span>
              </div>
            )}

            <Field>
              <Label>
                ชื่อลูกค้า <span className="text-destructive">*</span>
              </Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ชื่อบริษัท / บุคคล"
              />
            </Field>

            <Field>
              <Label>ที่อยู่</Label>
              <Textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                rows={2}
                placeholder="ที่อยู่สำหรับออกเอกสาร"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label>เลขผู้เสียภาษี</Label>
                <Input
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                  placeholder="เลขประจำตัวผู้เสียภาษี"
                />
              </Field>
              <Field>
                <Label>ผู้ติดต่อ</Label>
                <Input
                  value={customerContactName}
                  onChange={(e) => setCustomerContactName(e.target.value)}
                  placeholder="ชื่อผู้ติดต่อ"
                />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Document Config */}
      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าเอกสาร</CardTitle>
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

            <TemplateSelector
              value={templateId}
              onValueChange={setTemplateId}
            />

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
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>รายการในเอกสาร</CardTitle>
          <CardDescription>
            {template
              ? `โหลดจาก template "${template.name}" — แก้ไขได้`
              : "เลือก template เพื่อโหลดรายการ หรือเพิ่มรายการเอง"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentItemsEditor items={items} onItemsChange={setItems} />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generateMutation.isPending || !isValid}
        size="lg"
        className="w-full bg-info text-info-foreground hover:bg-info/90"
      >
        {generateMutation.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <FileText className="mr-2 size-4" />
        )}
        สร้าง PDF ({DOCUMENT_TYPE_LABELS[type]})
        {total > 0 && (
          <span className="ml-2">
            ·{" "}
            {total.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
          </span>
        )}
      </Button>
    </div>
  );
}
