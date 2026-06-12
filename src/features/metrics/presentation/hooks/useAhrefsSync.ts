'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import axios from '@/infrastructure/http/axios'
import type { BatchSyncSummary, CustomerSyncResult } from '@/features/metrics'

type ApiData<T> = { data: T }

// ซิงก์ทุกลูกค้า — ใช้ในปุ่ม global หน้า admin hub (ต้องใส่ PIN ก่อน ตรวจฝั่ง server)
export const useSyncAllMetrics = () => {
  const queryClient = useQueryClient()

  return useMutation<BatchSyncSummary, Error, { pin: string }>({
    mutationFn: async ({ pin }) => {
      const { data } = await axios.post<ApiData<BatchSyncSummary>>('/admin/metrics/sync', { pin })
      return data.data
    },
    onSuccess: (summary) => {
      toast.success(
        `ซิงก์ Ahrefs สำเร็จ: อัปเดต ${summary.updated} • ข้าม ${summary.skipped} • ผิดพลาด ${summary.errors}`,
      )
      queryClient.invalidateQueries({ queryKey: ['admin', 'hub-summary'] })
    },
    // error ถูก toast อัตโนมัติจาก axios interceptor
  })
}

// ซิงก์ลูกค้ารายเดียว — userId คือ Customer.userId (เทียบเท่า path /admin/metrics/sync/[customerId])
export const useSyncCustomerMetrics = () => {
  const queryClient = useQueryClient()

  return useMutation<CustomerSyncResult, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const { data } = await axios.post<ApiData<CustomerSyncResult>>(`/admin/metrics/sync/${userId}`)
      return data.data
    },
    onSuccess: (result, { userId }) => {
      if (result.status === 'updated') {
        toast.success('อัปเดตค่าจาก Ahrefs สำเร็จ')
      } else if (result.status === 'skipped_no_metrics') {
        toast.info('ข้าม: ลูกค้ายังไม่มีข้อมูล Metrics เริ่มต้น')
      } else {
        toast.error(`ซิงก์ไม่สำเร็จ: ${result.error ?? 'unknown'}`)
      }
      queryClient.invalidateQueries({ queryKey: ['metrics', userId] })
      queryClient.invalidateQueries({ queryKey: ['customerReport', userId] })
      queryClient.invalidateQueries({ queryKey: ['history', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'hub-summary'] })
    },
  })
}
