import { BarChart3, CreditCard, Upload, Users } from 'lucide-react'
import { requireStaff } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { DashboardPageLayout } from '@/components/shared/DashboardPageLayout'

export default async function SeoDashboard() {
  const session = await requireStaff()

  const seoDevCards = [
    {
      title: 'จัดการลูกค้า',
      description: 'ดูแลและจัดการข้อมูลลูกค้าที่ได้รับมอบหมาย',
      href: '/seo/users',
      color: 'info' as const,
      icon: Users,
    },
    {
      title: 'สร้างรายงาน SEO',
      description: 'สร้างและจัดการรายงาน Keyword และ Domain',
      href: '/seo/reports',
      color: 'secondary' as const,
      icon: BarChart3,
    },
    {
      title: 'อัปโหลดข้อมูล',
      description: 'นำเข้าข้อมูล Keywords และ Metrics',
      href: '/seo/upload',
      color: 'warning' as const,
      icon: Upload,
    },
    {
      title: 'ตรวจสอบการชำระเงิน',
      description: 'อนุมัติหรือปฏิเสธหลักฐานการโอนเงิน',
      href: '/seo/payments',
      color: 'success' as const,
      icon: CreditCard,
    },
  ]

  return (
    <DashboardLayout>
      <DashboardPageLayout user={session.user} title="แดชบอร์ด SEO Developer" cards={seoDevCards} />
    </DashboardLayout>
  )
}
