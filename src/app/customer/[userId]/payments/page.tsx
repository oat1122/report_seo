import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCustomer } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CustomerPaymentPage } from "@/features/payments/presentation/components/customer/CustomerPaymentPage";

export const metadata = {
  title: "การชำระเงิน | SEO Report",
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function CustomerPaymentsPage({ params }: PageProps) {
  const session = await requireCustomer();
  const { userId } = await params;
  if (userId !== session.user.id) notFound();

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/customer">
            <ArrowLeft className="mr-1.5 size-4" />
            กลับหน้าหลัก
          </Link>
        </Button>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            การชำระเงิน
          </h1>
          <p className="text-sm text-muted-foreground">
            ดูรอบจ่ายเงิน · อัปโหลดหลักฐาน · ดาวน์โหลดสัญญา
          </p>
        </header>
        <CustomerPaymentPage customerId={userId} />
      </div>
    </DashboardLayout>
  );
}
