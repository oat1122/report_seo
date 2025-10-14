import { requireStaff } from "@/lib/auth-utils";
import { StaffOnly } from "@/components/Login/subcomponents/RoleGuard";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";

export default async function SeoDashboard() {
  // Server-side protection - allows both ADMIN and SEO_DEV
  const session = await requireStaff();

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            SEO Developer Dashboard
          </h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              ยินดีต้อนรับ,{" "}
              <span className="font-semibold">{session.user.name}</span>!
            </p>
            <p className="text-green-600 text-sm">
              บทบาท: {session.user.role} | อีเมล: {session.user.email}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                จัดการลูกค้า
              </h3>
              <p className="text-blue-600 text-sm">
                ดูแลและจัดการข้อมูลลูกค้าที่ได้รับมอบหมาย
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                สร้างรายงาน SEO
              </h3>
              <p className="text-purple-600 text-sm">
                สร้างและจัดการรายงาน Keyword และ Domain
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                อัปโหลดข้อมูล
              </h3>
              <p className="text-yellow-600 text-sm">
                นำเข้าข้อมูล Keywords และ Metrics
              </p>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-teal-800 mb-2">
                ตรวจสอบการชำระเงิน
              </h3>
              <p className="text-teal-600 text-sm">
                อนุมัติหรือปฏิเสธหลักฐานการโอนเงิน
              </p>
            </div>
          </div>

          {/* Client-side protection example */}
          <StaffOnly>
            <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                เครื่องมือ SEO ขั้นสูง
              </h3>
              <p className="text-indigo-600">
                ฟังก์ชันนี้สำหรับเจ้าหน้าที่ SEO และ Admin เท่านั้น
              </p>
            </div>
          </StaffOnly>
        </div>
      </div>
    </DashboardLayout>
  );
}
