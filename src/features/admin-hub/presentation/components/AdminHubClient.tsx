'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { AlertCircle, Loader2, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSyncAllMetrics } from '@/features/metrics/presentation/hooks/useAhrefsSync'
import { useUnreadCount } from '@/features/notifications/presentation/hooks/useNotifications'
import type { CustomerHubCard } from '../../domain/AdminHubSummary'
import { useAdminHub } from '../hooks/useAdminHub'
import { HubStatsRow } from './HubStatsRow'
import { CustomerOverviewSection } from './CustomerOverviewSection'
import { HubNotificationsPanel } from './HubNotificationsPanel'
import { AhrefsSyncPinDialog } from './AhrefsSyncPinDialog'

// วันที่ ค.ศ. + เวลา "น." ตามกฎ Handoff 04 ข้อ 8
function formatUpdatedAt(timestamp: number) {
  const d = new Date(timestamp)
  const date = d.toLocaleDateString('th-TH-u-ca-gregory', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const time = d.toLocaleTimeString('th-TH-u-ca-gregory', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time} น.`
}

function matchesQuery(customer: CustomerHubCard, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [customer.name, customer.domain, customer.seoDevName ?? ''].some((v) =>
    v.toLowerCase().includes(q),
  )
}

export function AdminHubClient() {
  const { data, isLoading, isError, refetch, isRefetching, dataUpdatedAt } = useAdminHub()
  const { data: unreadCount } = useUnreadCount()
  const syncAll = useSyncAllMetrics()
  const [pinOpen, setPinOpen] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const customers = data?.customers
  const filteredCustomers = useMemo(
    () => customers?.filter((c) => matchesQuery(c, deferredSearch)),
    [customers, deferredSearch],
  )

  // ตัวเลขประกอบการ์ดสถิติ — คำนวณจากข้อมูลจริงใน hub summary เท่านั้น
  const derived = useMemo(() => {
    if (!data) return { newCustomersThisMonth: undefined, avgCustomersPerSeoDev: null }
    const now = new Date()
    const newCustomersThisMonth = data.customers.filter((c) => {
      const created = new Date(c.createdAt)
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
    }).length
    const assigned = data.customers.filter((c) => c.seoDevName).length
    const avgCustomersPerSeoDev =
      data.userCounts.SEO_DEV > 0 ? assigned / data.userCounts.SEO_DEV : null
    return { newCustomersThisMonth, avgCustomersPerSeoDev }
  }, [data])

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">Admin Hub</h1>
          <p className="text-text-secondary text-[13px] md:text-sm">
            ภาพรวมลูกค้าทั้งหมดและสิ่งที่ต้องจัดการ
            {data && dataUpdatedAt > 0 && ` · อัปเดต ${formatUpdatedAt(dataUpdatedAt)}`}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <label className="relative block sm:w-[280px]">
            <span className="sr-only">ค้นหาลูกค้า</span>
            <Search
              aria-hidden
              className="text-text-secondary pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาลูกค้า หรือ domain..."
              className="border-glass-border rounded-[14px] bg-white/75 pl-10 dark:bg-white/5"
            />
          </label>
          <Button
            variant="outline"
            onClick={() => setPinOpen(true)}
            disabled={syncAll.isPending}
            className="shrink-0"
          >
            {syncAll.isPending ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              <RefreshCw aria-hidden />
            )}
            {syncAll.isPending ? 'กำลังซิงก์ Ahrefs...' : 'ซิงก์ Ahrefs ทั้งหมด'}
          </Button>
        </div>
      </header>

      {isError && (
        <div
          role="alert"
          className="bg-danger-subtle text-danger-strong flex flex-col gap-3 rounded-[16px] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-start gap-2">
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
            โหลดข้อมูลภาพรวมไม่สำเร็จ ตรวจสอบการเชื่อมต่อแล้วกด “ลองอีกครั้ง”
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="self-start sm:self-auto"
          >
            {isRefetching && <Loader2 aria-hidden className="animate-spin" />}
            ลองอีกครั้ง
          </Button>
        </div>
      )}

      <HubStatsRow
        userCounts={data?.userCounts}
        unreadCount={unreadCount}
        isLoading={isLoading}
        newCustomersThisMonth={derived.newCustomersThisMonth}
        avgCustomersPerSeoDev={derived.avgCustomersPerSeoDev}
      />

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <CustomerOverviewSection
          customers={filteredCustomers}
          totalCount={customers?.length}
          isLoading={isLoading}
          isFiltered={deferredSearch.trim().length > 0}
        />
        <HubNotificationsPanel />
      </div>

      <AhrefsSyncPinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        isPending={syncAll.isPending}
        customerCount={customers?.length}
        onConfirm={(pin) => syncAll.mutateAsync({ pin }).then(() => setPinOpen(false))}
      />
    </div>
  )
}
