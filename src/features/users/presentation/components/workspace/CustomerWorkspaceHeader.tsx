import Link from 'next/link'
import { ChevronRight, ExternalLink, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUserById } from '@/features/users'
import { WorkspaceTabs, type WorkspaceTab } from './WorkspaceTabs'

interface CustomerWorkspaceHeaderProps {
  userId: string
  /** '/admin' = ครบ 4 แท็บ · '/seo' = เฉพาะ Domain + Work Progress */
  basePath: '/admin' | '/seo'
}

/**
 * หัว workspace ลูกค้า (Admin · Workspace ลูกค้า — แท็บเดียวกันทุกหน้า)
 * breadcrumb → avatar + ชื่อ + ผู้ดูแล/domain → ปุ่มดูรายงาน → แท็บ
 */
export async function CustomerWorkspaceHeader({ userId, basePath }: CustomerWorkspaceHeaderProps) {
  const user = await getUserById(userId, { includeAdminFields: true })
  const seoDevId = user?.customerProfile?.seoDevId
  const seoDev = seoDevId ? await getUserById(seoDevId, { includeAdminFields: false }) : null

  const name = user?.customerProfile?.name || user?.name || 'ลูกค้า'
  const domain = user?.customerProfile?.domain
  const root = `${basePath}/customers/${userId}`
  const tabs: WorkspaceTab[] =
    basePath === '/admin'
      ? [
          { label: 'ข้อมูล Domain', href: `${root}/domain` },
          { label: 'Work Progress', href: `${root}/work-progress` },
          { label: 'แผนบทความ', href: `${root}/blog-plan` },
          { label: 'การชำระเงินและเอกสาร', href: `${root}/payments`, also: [`${root}/documents`] },
        ]
      : [
          { label: 'ข้อมูล Domain', href: `${root}/domain` },
          { label: 'Work Progress', href: `${root}/work-progress` },
        ]

  return (
    <header className="flex flex-col gap-4">
      <nav
        aria-label="breadcrumb"
        className="text-text-secondary flex items-center gap-1.5 text-[13px]"
      >
        <Link href={`${basePath}/users`} className="hover:text-foreground">
          {basePath === '/admin' ? 'ผู้ใช้งาน' : 'ลูกค้าที่ดูแล'}
        </Link>
        <ChevronRight aria-hidden className="size-3.5" />
        <span className="text-foreground truncate font-medium">{name}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            aria-hidden
            className="bg-info-subtle flex size-[52px] shrink-0 items-center justify-center rounded-full border-2 border-white text-xl font-semibold dark:border-white/20"
          >
            {name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="truncate text-[26px] leading-tight font-semibold">{name}</h1>
            <div className="text-text-secondary flex flex-wrap items-center gap-2 text-[13px]">
              <span className="inline-flex items-center gap-1.5">
                <UserCog aria-hidden className="size-3.5" />
                ผู้ดูแล: {seoDev?.name ?? 'ยังไม่ได้มอบหมาย'}
              </span>
              {domain && (
                <>
                  <span aria-hidden>·</span>
                  <span className="truncate">{domain}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" asChild className="self-start sm:self-auto">
          <Link href={`/customer/${userId}/report`}>
            <ExternalLink aria-hidden className="size-4" />
            ดูรายงานลูกค้า
          </Link>
        </Button>
      </div>

      <WorkspaceTabs tabs={tabs} />
    </header>
  )
}
