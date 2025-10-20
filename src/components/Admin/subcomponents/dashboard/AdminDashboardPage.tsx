import { getSession } from "@/lib/auth-utils";
import { Dashboard } from "@/components/Admin/subcomponents/dashboard/Dashboard";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default async function AdminDashboardPage() {
  // ดึงข้อมูล session โดยตรง ไม่ต้อง redirect แล้ว
  const session = await getSession();

  // Middleware จะป้องกันไม่ให้ user ที่ไม่มี session เข้ามาได้
  // แต่เราควรเช็คเผื่อไว้สำหรับการแสดงผล
  if (!session) {
    return null; // หรือแสดงหน้า Loading/Error
  }

  return (
    <DashboardLayout>
      <Dashboard user={session.user} />
    </DashboardLayout>
  );
}
