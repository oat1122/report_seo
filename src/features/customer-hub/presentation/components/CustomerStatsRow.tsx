'use client'

import type { ReactNode } from 'react'
import { Globe, HeartPulse, KeyRound, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CustomerHubSummary } from '../../domain/CustomerHubSummary'

interface CustomerStatsRowProps {
  metrics: CustomerHubSummary['metrics'] | undefined
  isLoading: boolean
}

type MetricKey = keyof NonNullable<CustomerHubSummary['metrics']>

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

interface StatConfig {
  key: MetricKey
  label: string
  icon: typeof Globe
  tile: string
  render: (value: number) => ReactNode
}

const stats: StatConfig[] = [
  {
    key: 'domainRating',
    label: 'Domain Rating',
    icon: Globe,
    tile: 'bg-info/10 text-info',
    render: (v) => v,
  },
  {
    key: 'healthScore',
    label: 'Health Score',
    icon: HeartPulse,
    tile: 'bg-success/10 text-success',
    render: (v) => (
      <>
        {v}
        <span className="text-muted-foreground ml-0.5 text-base font-medium">/100</span>
      </>
    ),
  },
  {
    key: 'organicTraffic',
    label: 'Organic Traffic',
    icon: TrendingUp,
    tile: 'bg-info/10 text-info',
    render: (v) => compact(v),
  },
  {
    key: 'organicKeywords',
    label: 'Organic Keywords',
    icon: KeyRound,
    tile: 'bg-info/10 text-info',
    render: (v) => v.toLocaleString('en-US'),
  },
]

export function CustomerStatsRow({ metrics, isLoading }: CustomerStatsRowProps) {
  return (
    <section>
      <h2 className="text-foreground/80 mb-3 text-sm font-semibold">ภาพรวมผลลัพธ์ SEO</h2>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {stats.map(({ key, label, icon: Icon, tile, render }) => (
          <Card key={key} className="rounded-2xl">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className={cn('flex size-10 items-center justify-center rounded-[10px]', tile)}>
                <Icon className="size-5" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl leading-none font-bold tabular-nums">
                    {metrics ? render(metrics[key]) : '—'}
                  </p>
                )}
                <p className="text-muted-foreground mt-1.5 text-xs">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
