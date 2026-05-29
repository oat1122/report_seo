'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { BillingCycle, BillingCycleWithPlan, UpdateBillingCycleInput } from '../../index'

type ApiData<T> = { data: T }

export const useListBillingCycles = (customerId: string, planId?: string) =>
  useQuery<BillingCycleWithPlan[], Error>({
    queryKey: ['payments', 'cycles', customerId, planId],
    queryFn: async () => {
      const url = planId
        ? `/customers/${customerId}/payments/plans/${planId}/cycles`
        : `/customers/${customerId}/payments/cycles`
      const { data } = await axios.get<ApiData<BillingCycleWithPlan[]>>(url)
      return data.data
    },
    enabled: !!customerId,
  })

// ดาวน์โหลดใบแจ้งหนี้ของงวด (เลือกแบบรวม VAT / ไม่รวม VAT) — สตรีม PDF แล้ว trigger download
export const useDownloadCycleInvoice = (customerId: string) =>
  useMutation<void, Error, { cycleId: string; includeVat: boolean }>({
    mutationFn: async ({ cycleId, includeVat }) => {
      const res = await axios.get<Blob>(
        `/customers/${customerId}/payments/cycles/${cycleId}/invoice`,
        { params: { vat: includeVat ? 'true' : 'false' }, responseType: 'blob' },
      )

      const disposition = res.headers['content-disposition'] as string | undefined
      const match = disposition?.match(/filename="?([^"]+)"?/)
      const filename = match?.[1] ?? `invoice-${cycleId}.pdf`

      const url = URL.createObjectURL(res.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    },
  })

export const useUpdateBillingCycle = () => {
  const queryClient = useQueryClient()
  return useMutation<
    BillingCycle,
    Error,
    { customerId: string; cycleId: string; data: UpdateBillingCycleInput }
  >({
    mutationFn: async ({ customerId, cycleId, data: body }) => {
      const { data } = await axios.patch<ApiData<BillingCycle>>(
        `/customers/${customerId}/payments/cycles/${cycleId}`,
        body,
      )
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['payments', 'cycles', variables.customerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['payments', 'plans', variables.customerId],
      })
    },
  })
}
