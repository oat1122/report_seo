import { Rocket } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import { Button } from '@/components/ui/button'

export const CTASection = () => {
  return (
    <section className="py-12 text-center">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-primary mb-3 text-3xl font-bold md:text-4xl">บริการ SEO ช่วยอะไร?</h2>
        <p className="text-muted-foreground mb-6 text-lg">
          ช่วยยกระดับเว็บไซต์ของคุณให้เป็นที่รู้จักมากขึ้นในโลกออนไลน์
          ด้วยการปรับปรุงเนื้อหาและโครงสร้างของเว็บไซต์ให้เหมาะสมกับการค้นหา เพิ่มการเข้าถึง
          และทำให้เว็บไซต์ของคุณทำงานได้เต็มประสิทธิภาพ
        </p>
        <Button
          size="lg"
          className="group bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          <AnimatedIcon
            name="rocket"
            trigger="hover"
            size={18}
            color="bg-secondary-foreground"
            fallback={<Rocket className="text-secondary-foreground size-[18px] shrink-0" />}
          />
          เช็คราคาแพ็คเกจ
        </Button>
      </div>
    </section>
  )
}
