'use client'

import Link from 'next/link'
import { ArrowRight, SearchX, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardGridSkeleton } from '@/components/skeletons'
import { Stagger, StaggerItem } from '@/components/motion'
import type { CustomerHubCard } from '../../domain/AdminHubSummary'
import { CustomerSummaryCard } from './CustomerSummaryCard'

interface CustomerOverviewSectionProps {
  /** รายการที่ผ่านตัวกรองคำค้นแล้ว */
  customers: CustomerHubCard[] | undefined
  /** จำนวนลูกค้าทั้งหมดก่อนกรอง */
  totalCount: number | undefined
  isLoading: boolean
  isFiltered: boolean
}

export function CustomerOverviewSection({
  customers,
  totalCount,
  isLoading,
  isFiltered,
}: CustomerOverviewSectionProps) {
  const shown = customers?.length ?? 0

  return (
    <section aria-labelledby="hub-customers" className="flex min-w-0 flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="hub-customers" className="text-lg font-semibold md:text-[19px]">
          ลูกค้าทั้งหมด
          {totalCount != null && <span className="tabular-nums"> ({totalCount})</span>}
          {isFiltered && customers && (
            <span className="text-text-secondary ml-2 text-[13px] font-normal">
              พบ {shown.toLocaleString('th-TH')} ราย
            </span>
          )}
        </h2>
        <Link
          href="/admin/users"
          className="hover:text-info-strong focus-visible:ring-ring/70 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-[10px] px-1 text-[13px] font-medium outline-none focus-visible:ring-[3px]"
        >
          ดูทั้งหมด
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <CardGridSkeleton cols={2} count={4} />
      ) : !customers || totalCount === 0 ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-[20px] border border-dashed bg-white/50 px-6 py-10 text-center dark:bg-white/5">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 items-center justify-center rounded-[14px]"
          >
            <UserPlus className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">ยังไม่มีลูกค้าในระบบ</p>
            <p className="text-text-secondary text-[13px]">
              เพิ่มผู้ใช้งานบทบาท “ลูกค้า” เพื่อเริ่มติดตามผลในหน้านี้
            </p>
          </div>
          <Button variant="soft" asChild>
            <Link href="/admin/users">ไปหน้าผู้ใช้งาน</Link>
          </Button>
        </div>
      ) : shown === 0 ? (
        <div className="border-border flex flex-col items-center gap-2 rounded-[20px] border border-dashed bg-white/50 px-6 py-10 text-center dark:bg-white/5">
          <SearchX aria-hidden className="text-text-secondary size-6" />
          <p className="text-[15px] font-medium">ไม่พบลูกค้าที่ตรงกับคำค้น</p>
          <p className="text-text-secondary text-[13px]">
            ลองพิมพ์ชื่อลูกค้า domain หรือชื่อผู้ดูแลอีกครั้ง
          </p>
        </div>
      ) : (
        <Stagger className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {customers.map((c) => (
            <StaggerItem
              key={c.id}
              className="h-full"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <CustomerSummaryCard customer={c} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  )
}
