'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import axios from '@/infrastructure/http/axios'
import type { AhrefsPreviewResult, BatchSyncSummary } from '@/features/metrics'

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

// ดึงค่าจาก Ahrefs มา preview รายลูกค้า (ไม่เขียน DB) — userId คือ Customer.userId
// ผู้เรียกเอา result.fetched ไปเปิด AhrefsSyncReviewDialog เพื่อรีวิว/แก้/บันทึก
export const usePreviewCustomerMetrics = () =>
  useMutation<AhrefsPreviewResult, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const { data } = await axios.get<ApiData<AhrefsPreviewResult>>(
        `/admin/metrics/sync/${userId}/preview`,
      )
      return data.data
    },
    // error ถูก toast อัตโนมัติจาก axios interceptor
  })
