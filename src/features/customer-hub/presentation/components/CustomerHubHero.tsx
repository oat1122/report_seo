'use client'

interface CustomerHubHeroProps {
  userName: string
}

export function CustomerHubHero({ userName }: CustomerHubHeroProps) {
  return (
    <section className="from-info to-info/80 text-info-foreground mb-8 rounded-2xl bg-gradient-to-br p-6 md:p-10">
      <h1 className="mb-1 text-3xl font-extrabold md:text-4xl">ยินดีต้อนรับ</h1>
      <p className="mb-2 text-xl font-semibold opacity-95 md:text-2xl">{userName}</p>
      <p className="max-w-xl text-base opacity-90">
        ดูรายงาน SEO ติดตามประสิทธิภาพเว็บไซต์ และรับโปรโมชันพิเศษได้ที่นี่
      </p>
    </section>
  )
}
