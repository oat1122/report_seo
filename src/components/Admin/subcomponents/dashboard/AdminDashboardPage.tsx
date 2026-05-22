import { requireAdmin } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { DashboardPageLayout } from "@/components/shared/DashboardPageLayout";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const adminCards = [
    {
      title: "จัดการผู้ใช้งาน",
      description: "เพิ่ม แก้ไข และลบผู้ใช้งานในระบบ",
      href: "/admin/users",
      color: "secondary" as const,
    },
    {
      title: "ตั้งค่า Work Progress",
      description: "จัดการ master tables และ templates ของ plan",
      href: "/admin/settings/work-progress",
      color: "success" as const,
    },
    {
      title: "รายงาน",
      description: "ดูสถิติและรายงานต่างๆ",
      href: "/admin/reports",
      color: "warning" as const,
      disabled: true,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardPageLayout
        user={session.user}
        title="Admin Dashboard"
        cards={adminCards}
      />
    </DashboardLayout>
  );
}
