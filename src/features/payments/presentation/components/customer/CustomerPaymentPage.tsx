"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyBillingCycles } from "./MyBillingCycles";
import { MyContractFiles } from "./MyContractFiles";
import { MyPaymentHistory } from "./MyPaymentHistory";

interface CustomerPaymentPageProps {
  customerId: string;
}

export function CustomerPaymentPage({ customerId }: CustomerPaymentPageProps) {
  return (
    <Tabs defaultValue="billing" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="billing">รอบจ่ายเงิน</TabsTrigger>
        <TabsTrigger value="contracts">ไฟล์สัญญา</TabsTrigger>
        <TabsTrigger value="history">ประวัติการชำระ</TabsTrigger>
      </TabsList>

      <TabsContent value="billing" className="mt-6">
        <MyBillingCycles customerId={customerId} />
      </TabsContent>

      <TabsContent value="contracts" className="mt-6">
        <MyContractFiles customerId={customerId} />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <MyPaymentHistory customerId={customerId} />
      </TabsContent>
    </Tabs>
  );
}
