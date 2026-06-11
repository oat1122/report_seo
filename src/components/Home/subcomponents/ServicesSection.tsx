import Image from 'next/image'
import { TrendingUp } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import { Card, CardContent } from '@/components/ui/card'
import { services } from '@/components/Home/constants/data'

export const ServicesSection = () => {
  return (
    <section className="bg-card py-12">
      <div className="mx-auto w-full max-w-5xl px-4 text-center">
        <h2 className="text-primary mb-2 text-3xl font-bold md:text-4xl">บริการ SEO ของเรา</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          เราทำอะไรบ้างเพื่อขับเคลื่อนธุรกิจของคุณสู่หน้าแรก
        </p>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="group h-full p-6 text-center">
              <CardContent className="flex flex-col items-center gap-3 p-0">
                <Image src={service.icon} alt={`${service.title} icon`} width={80} height={80} />
                <h3 className="text-primary flex items-center justify-center gap-1.5 text-lg font-semibold md:text-xl">
                  <AnimatedIcon
                    name="trending-up"
                    trigger="hover"
                    size={18}
                    color="bg-info"
                    fallback={<TrendingUp className="text-info size-[18px] shrink-0" />}
                  />
                  {service.title}
                </h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
