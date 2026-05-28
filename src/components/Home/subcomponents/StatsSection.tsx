import { stats } from '@/components/Home/constants/data'

export const StatsSection = () => {
  return (
    <section className="bg-primary text-primary-foreground py-12">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="grid gap-8 text-center md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-bold md:text-5xl">{stat.value}</p>
              <p className="mt-2 text-base opacity-80 md:text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
