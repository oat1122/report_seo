import { requireCustomer } from "@/lib/auth-utils";
import { CustomerOnly } from "@/components/RoleGuard";

export default async function CustomerDashboard() {
  // Server-side protection
  const session = await requireCustomer();

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-text-dark mb-4">
          Customer Dashboard
        </h1>

        <div className="bg-primary-purple/10 border border-primary-purple/20 rounded-lg p-4 mb-6">
          <p className="text-primary-purple">
            ยินดีต้อนรับ,{" "}
            <span className="font-semibold">{session.user.name}</span>!
          </p>
          <p className="text-primary-purple/80 text-sm">
            บทบาท: {session.user.role} | อีเมล: {session.user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              รายงาน SEO ของคุณ
            </h3>
            <p className="text-blue-600 text-sm">
              ดูรายงาน Keyword และ Domain Rating ล่าสุด
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              อัปโหลดหลักฐานการชำระเงิน
            </h3>
            <p className="text-green-600 text-sm">
              อัปโหลดสลิปการโอนเงินเพื่อการอนุมัติ
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              ติดต่อเจ้าหน้าที่ SEO
            </h3>
            <p className="text-purple-600 text-sm">
              สอบถามหรือขอคำปรึกษาเกี่ยวกับ SEO
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ประวัติการใช้งาน
            </h3>
            <p className="text-yellow-600 text-sm">
              ดูประวัติรายงานและการชำระเงิน
            </p>
          </div>
        </div>

        {/* Client-side protection example */}
        <CustomerOnly>
          <div className="mt-8 bg-secondary-green/10 border border-secondary-green/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-secondary-green mb-2">
              ข้อมูลเฉพาะลูกค้า
            </h3>
            <p className="text-secondary-green/80">
              เนื้อหาส่วนตัวที่เฉพาะลูกค้าเท่านั้นที่เห็นได้
            </p>
          </div>
        </CustomerOnly>
      </div>
    </div>
  );
}
