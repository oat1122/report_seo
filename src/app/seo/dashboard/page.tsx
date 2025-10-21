import { getSession } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { DashboardPageLayout } from "@/components/shared/DashboardPageLayout";

export default async function SeoDashboard() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const seoDevCards = [
    {
      title: "จัดการลูกค้า",
      description: "ดูแลและจัดการข้อมูลลูกค้าที่ได้รับมอบหมาย",
      href: "/seo/users",
      color: "info" as const,
    },
    {
      title: "สร้างรายงาน SEO",
      description: "สร้างและจัดการรายงาน Keyword และ Domain",
      href: "/seo/reports",
      color: "secondary" as const,
    },
    {
      title: "อัปโหลดข้อมูล",
      description: "นำเข้าข้อมูล Keywords และ Metrics",
      href: "/seo/upload",
      color: "warning" as const,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardPageLayout
        user={session.user}
        title="SEO Developer Dashboard"
        cards={seoDevCards}
      />
    </DashboardLayout>
  );
}
