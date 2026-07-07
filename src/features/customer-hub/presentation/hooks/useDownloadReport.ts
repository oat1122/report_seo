'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { ReportExportFormat } from '@/features/customer-report'

// ดาวน์โหลดรายงาน SEO (pdf/xlsx) — สตรีม blob แล้ว trigger download
export const useDownloadReport = (userId: string) =>
  useMutation<void, Error, ReportExportFormat>({
    mutationFn: async (format) => {
      const res = await axios.get<Blob>(`/customers/${userId}/report/export`, {
        params: { format },
        responseType: 'blob',
      })

      const disposition = res.headers['content-disposition'] as string | undefined
      const match = disposition?.match(/filename="?([^"]+)"?/)
      const filename = match?.[1] ?? `seo-report.${format}`

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
