import { getSession } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { DashboardPageLayout } from "@/components/shared/DashboardPageLayout";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const adminCards = [
    {
      title: "จัดการผู้ใช้งาน",
      description: "เพิ่ม แก้ไข และลบผู้ใช้งานในระบบ",
      href: "/admin/users",
      color: "secondary" as const,
    },
    {
      title: "ตั้งค่าระบบ",
      description: "กำหนดค่าการทำงานของระบบ",
      href: "/admin/settings",
      color: "success" as const,
    },
    {
      title: "รายงาน",
      description: "ดูสถิติและรายงานต่างๆ",
      href: "/admin/reports",
      color: "warning" as const,
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
