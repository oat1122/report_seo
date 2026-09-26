'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { FileStack, LayoutGrid } from 'lucide-react'
import { EASE_OUT, FadeSwap, motion } from '@/components/motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { MasterTablesShell } from './master/MasterTablesShell'
import { TemplateList } from './template/TemplateList'
import { useTemplates } from '../hooks/useTemplates'

type TabValue = 'master' | 'templates'
const TAB_VALUES: readonly TabValue[] = ['master', 'templates'] as const
const isTabValue = (v: string | null): v is TabValue =>
  v !== null && (TAB_VALUES as readonly string[]).includes(v)

const TEMPLATES_BASE_PATH = '/admin/settings/work-progress/templates'

const TAB_META: Record<TabValue, { label: string; icon: typeof LayoutGrid; description: string }> =
  {
    master: {
      label: 'Master Tables',
      icon: LayoutGrid,
      description: 'จัดการ master tables และ templates ที่ใช้ใน plan ของลูกค้าทุกคน',
    },
    templates: {
      label: 'Templates',
      icon: FileStack,
      description: 'Template ใช้สร้างแผนใหม่แบบ 1-click พร้อม items ที่กำหนดล่วงหน้า',
    },
  }

function WorkProgressSettingsTabsInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: TabValue = isTabValue(rawTab) ? rawTab : 'master'
  const { data: templates } = useTemplates()

  const handleTabChange = (val: string) => {
    if (!isTabValue(val)) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', val)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex w-full min-w-0 flex-col gap-5"
    >
      <header className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">
          ตั้งค่า Work Progress
        </h1>
        <p className="text-text-secondary text-sm">{TAB_META[activeTab].description}</p>
      </header>

      {/* segmented ของ UI kit · มือถือเป็นกริด 2 ช่อง (Handoff rule 7) · pill เลื่อนด้วย layoutId */}
      <TabsList
        aria-label="ส่วนการตั้งค่า Work Progress"
        className="grid w-full grid-cols-2 self-start sm:inline-flex sm:w-auto"
      >
        {TAB_VALUES.map((value) => {
          const { label, icon: Icon } = TAB_META[value]
          const isActive = activeTab === value
          return (
            <TabsTrigger
              key={value}
              value={value}
              className="h-11 data-active:bg-transparent data-active:shadow-none sm:h-10 dark:data-active:bg-transparent"
            >
              {isActive && (
                <motion.span
                  layoutId="wp-settings-tab-pill"
                  aria-hidden
                  className="shadow-info-strong/30 dark:bg-muted absolute inset-0 rounded-[10px] bg-white shadow-md"
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
              )}
              <span className="relative z-[1] inline-flex items-center gap-1.5">
                <Icon className="size-4" aria-hidden />
                {label}
                {value === 'templates' && templates && (
                  <span
                    className={cn(
                      'text-foreground inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-normal tabular-nums',
                      isActive ? 'bg-info-subtle' : 'bg-muted',
                    )}
                  >
                    {templates.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <TabsContent value="master" className="min-w-0">
        <FadeSwap>
          <MasterTablesShell />
        </FadeSwap>
      </TabsContent>
      <TabsContent value="templates" className="min-w-0">
        <FadeSwap>
          <TemplateList basePath={TEMPLATES_BASE_PATH} />
        </FadeSwap>
      </TabsContent>
    </Tabs>
  )
}

export function WorkProgressSettingsTabs() {
  return (
    <Suspense fallback={null}>
      <WorkProgressSettingsTabsInner />
    </Suspense>
  )
}
