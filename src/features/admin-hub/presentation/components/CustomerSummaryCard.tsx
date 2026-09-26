'use client'

import Link from 'next/link'
import { Briefcase, CreditCard, Globe, PenLine, RefreshCw, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CustomerHubCard } from '../../domain/AdminHubSummary'

interface CustomerSummaryCardProps {
  customer: CustomerHubCard
}

// ป้าย "ลูกค้าใหม่" — สร้างบัญชีภายในช่วงนี้
const NEW_CUSTOMER_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('th-TH')
}

export function CustomerSummaryCard({ customer }: CustomerSummaryCardProps) {
  const { metrics, counts } = customer
  const base = `/admin/customers/${customer.userId}`
  const isNew = Date.now() - new Date(customer.createdAt).getTime() < NEW_CUSTOMER_DAYS * DAY_MS
  const initial = customer.name.trim().charAt(0).toUpperCase() || '?'

  const quickLinks: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'Domain', href: `${base}/domain`, icon: Globe },
    { label: 'Work', href: `${base}/work-progress`, icon: Briefcase },
    { label: 'Blog', href: `${base}/blog-plan`, icon: PenLine },
    { label: 'Payments', href: `${base}/payments`, icon: CreditCard },
  ]

  return (
    <article className="border-glass-border bg-glass-card shadow-card flex h-full flex-col gap-3 rounded-[20px] border p-3.5 backdrop-blur-[14px] sm:gap-3.5 sm:p-[18px]">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="bg-info-subtle flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white text-[15px] font-semibold sm:size-[42px] sm:text-base dark:border-white/20"
          >
            {initial}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="truncate text-base font-semibold">{customer.name}</h3>
            <p className="text-text-secondary truncate text-xs">
              {customer.domain}
              {customer.seoDevName && ` · ${customer.seoDevName}`}
            </p>
          </div>
        </div>
        {isNew && <Badge variant="info">ลูกค้าใหม่</Badge>}
      </div>

      {metrics ? (
        <dl className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <MetricTile label="DR" value={metrics.domainRating.toLocaleString('th-TH')} />
          <MetricTile label="Health" value={metrics.healthScore.toLocaleString('th-TH')} />
          <MetricTile label="Traffic" value={formatCompact(metrics.organicTraffic)} />
        </dl>
      ) : (
        <div className="border-border flex flex-wrap items-center justify-between gap-2.5 rounded-[12px] border border-dashed bg-white/50 px-3.5 py-3 dark:bg-white/5">
          <span className="text-text-secondary text-[13px]">ยังไม่มีข้อมูล Metrics</span>
          <Button variant="soft" size="sm" asChild>
            <Link
              href={`${base}/domain`}
              aria-label={`ซิงก์จาก Ahrefs ที่หน้า Domain ของ ${customer.name}`}
            >
              <RefreshCw aria-hidden />
              ซิงก์จาก Ahrefs
            </Link>
          </Button>
        </div>
      )}

      <ul aria-label="จำนวนข้อมูลในรายงาน" className="flex flex-wrap gap-1.5">
        <CountChip label="Keywords" value={counts.keywords} />
        <CountChip label="Recommend" value={counts.recommendations} />
        <CountChip label="AI Overview" value={counts.aiOverviews} />
      </ul>

      <p className="text-text-secondary flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span>
          Plans:{' '}
          <strong className="text-foreground font-semibold tabular-nums">
            {counts.workProgressPlans}
            {customer.workProgressAvgPercent !== null && ` (${customer.workProgressAvgPercent}%)`}
          </strong>
        </span>
        <span>
          แผนชำระ:{' '}
          <strong className="text-foreground font-semibold tabular-nums">
            {counts.paymentPlans}
          </strong>
        </span>
      </p>

      <nav
        aria-label={`ลิงก์ด่วนของ ${customer.name}`}
        className="border-border/70 mt-auto grid grid-cols-4 gap-1.5 border-t pt-3"
      >
        {quickLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            aria-label={`${label} — ${customer.name}`}
            className="focus-visible:ring-ring/70 hover:text-info-strong flex h-[50px] flex-col items-center justify-center gap-0.5 rounded-[12px] bg-white/65 text-[11px] transition-colors outline-none hover:bg-white focus-visible:ring-[3px] sm:h-10 sm:flex-row sm:gap-1.5 sm:rounded-[10px] sm:text-[13px] dark:bg-white/5 dark:hover:bg-white/10"
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </article>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-glass-tile flex min-w-0 flex-col gap-0.5 rounded-[12px] px-2.5 py-2 sm:gap-1 sm:px-3 sm:py-2.5">
      <dt className="text-text-secondary text-[11px]">{label}</dt>
      <dd className="truncate text-base leading-tight font-semibold tabular-nums sm:text-lg">
        {value}
      </dd>
    </div>
  )
}

function CountChip({ label, value }: { label: string; value: number }) {
  return (
    <li className="inline-flex h-6 items-center gap-1 rounded-full bg-white/85 px-2.5 text-xs font-medium whitespace-nowrap dark:bg-white/10">
      {label}{' '}
      <strong className="font-semibold tabular-nums">{value.toLocaleString('th-TH')}</strong>
    </li>
  )
}
