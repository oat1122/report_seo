import { requireAdmin } from "@/lib/auth-utils";
import { AdminOnly } from "@/components/RoleGuard";

export default async function AdminDashboard() {
  // Server-side protection
  const session = await requireAdmin();

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-text-dark mb-4">
          Admin Dashboard
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            ยินดีต้อนรับ,{" "}
            <span className="font-semibold">{session.user.name}</span>!
          </p>
          <p className="text-blue-600 text-sm">
            บทบาท: {session.user.role} | อีเมล: {session.user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              จัดการผู้ใช้งาน
            </h3>
            <p className="text-purple-600 text-sm">
              เพิ่ม แก้ไข และลบผู้ใช้งานในระบบ
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ตั้งค่าระบบ
            </h3>
            <p className="text-green-600 text-sm">กำหนดค่าการทำงานของระบบ</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              รายงานภาพรวม
            </h3>
            <p className="text-yellow-600 text-sm">ดูสถิติการใช้งานทั้งหมด</p>
          </div>
        </div>

        {/* Client-side protection example */}
        <AdminOnly>
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ฟังก์ชันสำหรับ Admin เท่านั้น
            </h3>
            <p className="text-red-600">
              เนื้อหานี้จะปรากฏเฉพาะผู้ใช้ที่มีบทบาท Admin เท่านั้น
            </p>
          </div>
        </AdminOnly>
      </div>
    </div>
  );
}
