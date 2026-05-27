import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { BackButton } from "@/components/shared/BackButton";
import { StandaloneDocumentCreator } from "@/features/billing-documents/presentation/components/admin/StandaloneDocumentCreator";

export const metadata = { title: "สร้างเอกสารใหม่ · Admin" };

export default async function CreateDocumentPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              สร้างเอกสารใหม่
            </h1>
            <p className="text-sm text-muted-foreground">
              สร้างเอกสาร PDF โดยกรอกข้อมูลลูกค้าเอง หรือเลือกจากระบบ
            </p>
          </header>
        </div>
        <StandaloneDocumentCreator />
      </div>
    </DashboardLayout>
  );
}
