'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { FileStack, LayoutGrid } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MasterTablesShell } from './master/MasterTablesShell'
import { TemplateList } from './template/TemplateList'

type TabValue = 'master' | 'templates'
const TAB_VALUES: readonly TabValue[] = ['master', 'templates'] as const
const isTabValue = (v: string | null): v is TabValue =>
  v !== null && (TAB_VALUES as readonly string[]).includes(v)

const TEMPLATES_BASE_PATH = '/admin/settings/work-progress/templates'

function WorkProgressSettingsTabsInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: TabValue = isTabValue(rawTab) ? rawTab : 'master'

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
      orientation="vertical"
      className="w-full"
    >
      <div className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-6">
        <aside className="md:contents">
          <div className="bg-background/80 md:border-border md:bg-card sticky top-16 z-20 -mx-4 px-4 py-2 backdrop-blur md:top-20 md:mx-0 md:self-start md:rounded-xl md:border md:p-3 md:backdrop-blur-none">
            <TabsList
              aria-label="Work Progress settings sections"
              className="bg-muted flex w-full gap-1 overflow-x-auto md:flex-col md:overflow-visible md:bg-transparent md:p-0"
            >
              <TabsTrigger value="master" className="gap-1.5 md:w-full md:justify-start">
                <LayoutGrid className="size-4" />
                Master Tables
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-1.5 md:w-full md:justify-start">
                <FileStack className="size-4" />
                Templates
              </TabsTrigger>
            </TabsList>
          </div>
        </aside>

        <div className="min-w-0">
          <TabsContent value="master" className="mt-0">
            <MasterTablesShell />
          </TabsContent>
          <TabsContent value="templates" className="mt-0">
            <TemplateList basePath={TEMPLATES_BASE_PATH} />
          </TabsContent>
        </div>
      </div>
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
