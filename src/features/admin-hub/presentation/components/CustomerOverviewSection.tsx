'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { useSyncAllMetrics } from '@/features/metrics/presentation/hooks/useAhrefsSync'
import type { CustomerHubCard } from '../../domain/AdminHubSummary'
import { CustomerSummaryCard } from './CustomerSummaryCard'

interface CustomerOverviewSectionProps {
  customers: CustomerHubCard[] | undefined
  isLoading: boolean
}

export function CustomerOverviewSection({ customers, isLoading }: CustomerOverviewSectionProps) {
  const syncAll = useSyncAllMetrics()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">ลูกค้าทั้งหมด</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          ลูกค้าทั้งหมด
          {customers && (
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({customers.length})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setConfirmOpen(true)}
            disabled={syncAll.isPending}
          >
            {syncAll.isPending ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 size-3" />
            )}
            ซิงก์ Ahrefs ทั้งหมด
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/admin/users">
              ดูทั้งหมด
              <ArrowRight className="ml-1 size-3" />
            </Link>
          </Button>
        </div>
      </div>

      {customers && customers.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {customers.map((c) => (
            <CustomerSummaryCard key={c.id} customer={c} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-8 text-center text-sm">ยังไม่มีข้อมูลลูกค้า</p>
      )}

      <ConfirmAlert
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          syncAll.mutate()
          setConfirmOpen(false)
        }}
        title="ซิงก์ Ahrefs ทั้งหมด?"
        message="ระบบจะดึงข้อมูลล่าสุดจาก Ahrefs ให้ลูกค้าทุกราย อาจใช้เวลาสักครู่ ยืนยันหรือไม่?"
      />
    </div>
  )
}
