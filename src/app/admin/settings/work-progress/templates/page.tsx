import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { BackButton } from "@/components/shared/BackButton";
import { TemplateList } from "@/features/work-progress/presentation/components/template/TemplateList";

export const metadata = {
  title: "Work Progress · Templates · Admin",
};

export default async function TemplateListPage() {
  await requireAdmin();
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
            <p className="text-sm text-muted-foreground">
              Template ใช้สร้างแผนใหม่แบบ 1-click พร้อม items ที่กำหนดล่วงหน้า
            </p>
          </header>
        </div>
        <TemplateList basePath="/admin/settings/work-progress/templates" />
      </div>
    </DashboardLayout>
  );
}
