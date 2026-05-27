import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { BackButton } from "@/components/shared/BackButton";
import { DocumentTemplateList } from "@/features/billing-documents/presentation/components/admin/DocumentTemplateList";

export const metadata = {
  title: "Template เอกสาร · Admin",
};

export default async function DocumentTemplatesPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Template เอกสาร
            </h1>
            <p className="text-sm text-muted-foreground">
              จัดการ template รายการสินค้า/บริการสำหรับสร้างเอกสาร PDF
            </p>
          </header>
        </div>
        <DocumentTemplateList />
      </div>
    </DashboardLayout>
  );
}
