"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentPlanList } from "./PaymentPlanList";
import { BillingCycleTable } from "./BillingCycleTable";
import { ContractFileUpload } from "./ContractFileUpload";
import { ProofReviewList } from "./ProofReviewList";
import { CycleDocumentView } from "@/features/billing-documents/presentation/components/admin/CycleDocumentView";

interface PaymentDashboardProps {
  customerId: string;
}

export function PaymentDashboard({ customerId }: PaymentDashboardProps) {
  return (
    <Tabs defaultValue="plans" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="plans">แผนชำระเงิน</TabsTrigger>
        <TabsTrigger value="cycles">รอบจ่ายเงิน</TabsTrigger>
        <TabsTrigger value="contracts">ไฟล์สัญญา</TabsTrigger>
        <TabsTrigger value="proofs">หลักฐานการโอน</TabsTrigger>
        <TabsTrigger value="documents">เอกสาร</TabsTrigger>
      </TabsList>

      <TabsContent value="plans" className="mt-6">
        <PaymentPlanList customerId={customerId} />
      </TabsContent>

      <TabsContent value="cycles" className="mt-6">
        <BillingCycleTable customerId={customerId} />
      </TabsContent>

      <TabsContent value="contracts" className="mt-6">
        <ContractFileUpload customerId={customerId} />
      </TabsContent>

      <TabsContent value="proofs" className="mt-6">
        <ProofReviewList customerId={customerId} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <CycleDocumentView customerId={customerId} />
      </TabsContent>
    </Tabs>
  );
}
