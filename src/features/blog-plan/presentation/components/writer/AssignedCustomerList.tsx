'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
  const { data, isLoading } = useQuery({
    queryKey: ['blog-assigned-customers'],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<AssignedCustomer[]>>('/users/blog-customers')
      return data.data
    },
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          ยังไม่มีลูกค้าที่มอบหมายให้คุณ — ติดต่อผู้ดูแลระบบ
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {data.map((customer) => (
        <Link key={customer.id} href={`/blog/customers/${customer.id}`}>
          <Card className="hover:border-secondary/50 transition-colors">
            <CardContent className="flex items-center gap-3">
              <Building2 className="text-muted-foreground size-5 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {customer.customerProfile?.name ?? customer.name ?? customer.email}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {customer.customerProfile?.domain ?? customer.email}
                </span>
              </div>
              <ArrowRight className="text-muted-foreground size-4 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
