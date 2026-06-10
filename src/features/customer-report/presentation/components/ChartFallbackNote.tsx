import { Info } from 'lucide-react'

/**
 * Caption แจ้งเมื่อกราฟ fallback ไปแสดง all-time เพราะข้อมูลในช่วงที่เลือกไม่พอ
 * (กัน user ตีความว่ากราฟคือ "ช่วง 7D/30D/90D" ทั้งที่เป็นทั้งหมด)
 */
export const ChartFallbackNote = () => (
  <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1 text-center text-xs italic">
    <Info className="size-3 shrink-0" />
    ข้อมูลในช่วงที่เลือกไม่พอ · แสดงทั้งหมด
  </p>
)
