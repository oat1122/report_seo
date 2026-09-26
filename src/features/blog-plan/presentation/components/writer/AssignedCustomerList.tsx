'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Globe, Users } from 'lucide-react'
import { motion, Stagger, StaggerItem } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import axios from '@/lib/axios'
import type { ApiSuccess } from '@/infrastructure/http'

interface AssignedCustomer {
  id: string
  name: string | null
  email: string
  customerProfile: { name: string; domain: string } | null
}

export function AssignedCustomerList() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['blog-assigned-customers'],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<AssignedCustomer[]>>('/users/blog-customers')
      return data.data
    },
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        <Skeleton className="h-24 w-full rounded-[20px]" />
        <Skeleton className="h-24 w-full rounded-[20px]" />
        <Skeleton className="h-24 w-full rounded-[20px]" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="items-center gap-3 px-6 py-10 text-center">
        <p className="text-sm font-medium">โหลดรายชื่อลูกค้าไม่สำเร็จ</p>
        <p className="text-text-secondary text-[13px]">
          อาจเป็นที่การเชื่อมต่อ ลองโหลดใหม่อีกครั้ง ถ้ายังไม่ได้ให้ติดต่อผู้ดูแลระบบ
        </p>
        <Button variant="outline" className="h-11 rounded-[12px] px-4" onClick={() => refetch()}>
          โหลดใหม่
        </Button>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="items-center gap-3 px-6 py-12 text-center">
        <span
          aria-hidden
          className="bg-info-subtle text-info-strong flex size-14 items-center justify-center rounded-[18px]"
        >
          <Users className="size-6" />
        </span>
        <p className="text-sm font-medium">ยังไม่มีลูกค้าที่มอบหมายให้คุณ</p>
        <p className="text-text-secondary text-[13px]">ติดต่อผู้ดูแลระบบเพื่อขอมอบหมายลูกค้า</p>
      </Card>
    )
  }

  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((customer) => {
        const name = customer.customerProfile?.name ?? customer.name ?? customer.email
        return (
          <StaggerItem key={customer.id}>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link
                href={`/blog/customers/${customer.id}`}
                className="focus-visible:ring-ring/60 block rounded-[20px] focus-visible:ring-[3px] focus-visible:outline-none"
              >
                <Card className="flex-row items-center gap-3.5 px-4.5 py-4">
                  <span
                    aria-hidden
                    className="bg-info-subtle flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-white text-base font-semibold dark:border-white/20"
                  >
                    {name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-semibold">{name}</span>
                    <span className="text-text-secondary flex items-center gap-1.5 truncate text-xs">
                      <Globe aria-hidden className="size-3.5 shrink-0" />
                      {customer.customerProfile?.domain ?? customer.email}
                    </span>
                  </div>
                  <ArrowRight aria-hidden className="text-text-secondary size-4 shrink-0" />
                </Card>
              </Link>
            </motion.div>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
