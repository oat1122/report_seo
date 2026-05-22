import Link from "next/link";
import { FileStack } from "lucide-react";
import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { MasterTablesShell } from "@/features/work-progress/presentation/components/master/MasterTablesShell";

export const metadata = {
  title: "ตั้งค่า Work Progress · Admin",
};

export default async function WorkProgressSettingsPage() {
  await requireAdmin();
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              ตั้งค่า Work Progress
            </h1>
            <p className="text-sm text-muted-foreground">
              จัดการ master tables ที่ใช้ใน plan ของลูกค้าทุกคน — หมวด · สถานะ
              · สัญลักษณ์ period
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/settings/work-progress/templates">
              <FileStack className="size-4" />
              Templates
            </Link>
          </Button>
        </header>
        <MasterTablesShell />
      </div>
    </DashboardLayout>
  );
}
