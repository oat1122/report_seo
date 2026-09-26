'use client'

import { useEffect } from 'react'

/**
 * กันข้อความที่พิมพ์ค้างหาย: เตือนตอนปิดแท็บ/รีเฟรช และคืนฟังก์ชันให้ถามยืนยันก่อนออกจากฟอร์ม
 * ponytail: App Router ดักปุ่ม back ของเบราว์เซอร์ไม่ได้ — กันได้แค่ปิดแท็บกับปุ่มยกเลิกในแอป
 */
export function useUnsavedGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  return () => !isDirty || window.confirm('ข้อความที่พิมพ์ค้างไว้จะหาย ออกจากหน้านี้เลยไหม?')
}
