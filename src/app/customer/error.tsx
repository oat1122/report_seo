'use client'

import { useEffect } from 'react'
import { CircleAlert, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// error boundary ของ /customer — render นอก shell (layout อยู่ใน page) จึงจัดกึ่งกลางเอง
export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Customer area error:', error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-16">
      <Card role="alert" className="w-full">
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden
            className="bg-danger-subtle text-danger-strong flex size-14 items-center justify-center rounded-2xl"
          >
            <CircleAlert className="size-7" />
          </span>
          <h1 className="text-[22px] font-semibold">โหลดหน้านี้ไม่สำเร็จ</h1>
          <p className="text-text-secondary text-sm">
            ระบบมีปัญหาชั่วคราว ลองโหลดใหม่อีกครั้ง หากยังไม่ได้ให้รีเฟรชหน้าเว็บ
            หรือแจ้งทีมงานพร้อมรหัสอ้างอิงด้านล่าง
          </p>
          {error.digest && (
            <p className="text-text-secondary font-mono text-xs">รหัสอ้างอิง: {error.digest}</p>
          )}
          <Button onClick={reset} className="mt-2 w-full sm:w-auto">
            <RefreshCw aria-hidden />
            ลองใหม่อีกครั้ง
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
