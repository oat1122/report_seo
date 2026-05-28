import { Tag, Gift } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import PromotionGrid from './PromotionGrid'

export default function PromotionSection() {
  return (
    <section aria-labelledby="promotion-heading" className="my-10">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <Badge className="bg-info/15 text-info hover:bg-info/20 gap-1 px-3 py-1.5 text-sm font-bold">
          <Tag className="size-4" />
          โปรโมชันพิเศษ
        </Badge>
        <div className="flex items-center gap-2">
          <Gift className="text-info size-7" />
          <h2 id="promotion-heading" className="text-2xl font-extrabold md:text-3xl">
            แพ็กเกจสุดพิเศษสำหรับคุณ
          </h2>
        </div>
        <p className="text-muted-foreground text-base">
          เลือกแพ็กเกจที่เหมาะสมกับความต้องการของคุณ
        </p>
      </div>

      <PromotionGrid />
    </section>
  )
}
