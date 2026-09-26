import {
  Activity,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  NotebookPen,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Role } from '@/types/auth'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** ค่า ?tab= ที่ต้องตรงด้วย (เมนูส่วนของรายงานลูกค้า) */
  tab?: string
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export interface ShellConfig {
  eyebrow: string
  variant: 'customer' | 'admin'
  groups: NavGroup[]
}

const REPORT = '/customer/report'

/** เดา role จาก path ระหว่างรอ session โหลด — กัน nav/rim กระพริบเป็นของลูกค้าตอนโหลดครั้งแรก */
export function roleFromPath(pathname: string): Role | undefined {
  if (pathname.startsWith('/admin')) return Role.ADMIN
  if (pathname.startsWith('/seo')) return Role.SEO_DEV
  if (pathname.startsWith('/blog')) return Role.BLOG_WRITER
  if (pathname.startsWith('/customer')) return Role.CUSTOMER
  return undefined
}

export function getShellConfig(role: Role | undefined, userId: string | undefined): ShellConfig {
  switch (role) {
    case Role.ADMIN:
      return {
        eyebrow: 'ADMIN DASHBOARD',
        variant: 'admin',
        groups: [
          {
            label: 'ภาพรวม',
            items: [{ label: 'Admin Hub', href: '/admin', icon: LayoutDashboard }],
          },
          { label: 'ลูกค้า', items: [{ label: 'ผู้ใช้งาน', href: '/admin/users', icon: Users }] },
          {
            label: 'การเงิน',
            items: [{ label: 'เอกสารการเงิน', href: '/admin/documents', icon: FileText }],
          },
          {
            label: 'ตั้งค่า',
            items: [
              { label: 'ข้อมูลบริษัท', href: '/admin/settings/company', icon: Building2 },
              {
                label: 'Work Progress',
                href: '/admin/settings/work-progress',
                icon: SlidersHorizontal,
              },
            ],
          },
        ],
      }
    case Role.SEO_DEV:
      return {
        eyebrow: 'SEO DEV DASHBOARD',
        variant: 'admin',
        groups: [
          { label: 'ภาพรวม', items: [{ label: 'หน้าหลัก', href: '/seo', icon: LayoutDashboard }] },
          { label: 'ลูกค้า', items: [{ label: 'ลูกค้าที่ดูแล', href: '/seo/users', icon: Users }] },
        ],
      }
    case Role.BLOG_WRITER:
      return {
        eyebrow: 'BLOG WRITER',
        variant: 'admin',
        groups: [{ items: [{ label: 'ลูกค้าที่ดูแล', href: '/blog', icon: NotebookPen }] }],
      }
    default:
      return {
        eyebrow: 'CUSTOMER REPORT',
        variant: 'customer',
        groups: [
          {
            label: 'รายงาน',
            items: [
              {
                label: 'Overview',
                href: `${REPORT}?tab=overview`,
                icon: LayoutDashboard,
                tab: 'overview',
              },
              {
                label: 'Domain Health',
                href: `${REPORT}?tab=health`,
                icon: Activity,
                tab: 'health',
              },
              {
                label: 'Keyword Performance',
                href: `${REPORT}?tab=keywords`,
                icon: Search,
                tab: 'keywords',
              },
              {
                label: 'AI & Recommendations',
                href: `${REPORT}?tab=ai`,
                icon: Sparkles,
                tab: 'ai',
              },
              {
                label: 'Work Progress',
                href: `${REPORT}?tab=work-progress`,
                icon: ClipboardList,
                tab: 'work-progress',
              },
            ],
          },
          {
            label: 'บริการ',
            items: [
              { label: 'หน้าหลัก', href: '/customer', icon: Home },
              ...(userId
                ? [
                    {
                      label: 'แผนบทความ',
                      href: `/customer/${userId}/blog-plan`,
                      icon: NotebookPen,
                    },
                    {
                      label: 'การชำระเงิน',
                      href: `/customer/${userId}/payments`,
                      icon: CreditCard,
                    },
                  ]
                : []),
            ],
          },
        ],
      }
  }
}

/** ตรวจว่าเมนูไหน active — เลือกตัวที่ path ยาวสุดที่ตรง เพื่อไม่ให้ /admin ทับ /admin/users */
export function findActiveHref(
  groups: NavGroup[],
  pathname: string,
  tab: string | null,
): string | undefined {
  const items = groups.flatMap((g) => g.items)
  const path = pathname.replace(/\/$/, '') || '/'
  const isReport = path === REPORT || /^\/customer\/[^/]+\/report$/.test(path)
  if (isReport) {
    const current = tab ?? 'overview'
    return items.find((i) => i.tab === current)?.href
  }
  let best: NavItem | undefined
  for (const item of items) {
    if (item.tab) continue
    const base = item.href
    if (path === base || path.startsWith(`${base}/`)) {
      if (!best || base.length > best.href.length) best = item
    }
  }
  return best?.href
}
