'use client'

import Link from 'next/link'
import { ArrowRight, Download, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CustomerHubHeroProps {
  userName: string
  domain: string | null | undefined
}

export function CustomerHubHero({ userName, domain }: CustomerHubHeroProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 py-1">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-[25px]">
          {userName ? `ยินดีต้อนรับกลับมา, ${userName} 👋` : 'ยินดีต้อนรับกลับมา 👋'}
        </h1>
        {domain && (
          <span className="flex items-center gap-1.5 text-sm">
            <Globe className="text-info size-4" />
            <span className="text-foreground/70 font-medium">{domain}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="outline" size="lg" disabled className="gap-2">
          <Download className="size-4" />
          ดาวน์โหลดรายงาน
          <Badge className="bg-info/15 text-info hover:bg-info/15 ml-0.5 px-2 py-0.5 text-[10px] font-semibold">
            เร็วๆ นี้
          </Badge>
        </Button>
        <Button size="lg" className="gap-2" asChild>
          <Link href="/customer/report">
            ดูรายงาน SEO ฉบับเต็ม
            <ArrowRight className="text-secondary size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
