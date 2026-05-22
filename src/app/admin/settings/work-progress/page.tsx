import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { WorkProgressSettingsTabs } from "@/features/work-progress/presentation/components/WorkProgressSettingsTabs";

export const metadata = {
  title: "ตั้งค่า Work Progress · Admin",
};

export default async function WorkProgressSettingsPage() {
  await requireAdmin();
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              ตั้งค่า Work Progress
            </h1>
            <p className="text-sm text-muted-foreground">
              จัดการ master tables และ templates ที่ใช้ใน plan ของลูกค้าทุกคน
            </p>
          </header>
        </div>
        <WorkProgressSettingsTabs />
      </div>
    </DashboardLayout>
  );
}
