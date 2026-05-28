'use client'

import { useEffect } from 'react'
import { CircleAlert, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card className="rounded-2xl border-2">
        <CardContent className="p-6 text-center md:p-10">
          <div className="bg-destructive/10 mx-auto mb-4 flex size-18 items-center justify-center rounded-full">
            <CircleAlert className="text-destructive size-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">เกิดข้อผิดพลาด</h2>
          <p className="text-muted-foreground mb-1 text-base">
            ขออภัย ระบบไม่สามารถโหลดหน้านี้ได้ในขณะนี้
          </p>
          {error.digest && (
            <p className="text-muted-foreground/70 mb-4 font-mono text-xs">ref: {error.digest}</p>
          )}
          <Button onClick={reset} className="mt-4">
            <RefreshCw className="size-4" />
            ลองใหม่อีกครั้ง
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
