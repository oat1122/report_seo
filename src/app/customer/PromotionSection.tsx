import { Gift } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import PromotionGrid from './PromotionGrid'

export default function PromotionSection() {
  return (
    <section aria-labelledby="promotion-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Badge variant="info" className="gap-1.5">
          <Gift aria-hidden className="text-info-strong" />
          โปรโมชันพิเศษ
        </Badge>
        <h2 id="promotion-heading" className="text-xl font-semibold md:text-2xl">
          แพ็กเกจสุดพิเศษสำหรับคุณ
        </h2>
        <p className="text-text-secondary text-sm">
          เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ — กดที่รูปเพื่อดูรายละเอียดขนาดเต็ม
        </p>
      </div>

      <PromotionGrid />
    </section>
  )
}
