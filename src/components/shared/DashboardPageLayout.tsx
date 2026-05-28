import React from 'react'
import Link from 'next/link'
import { Role } from '@/types/auth'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type CardColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'

interface DashboardCard {
  title: string
  description: string
  href: string
  color: CardColor
  disabled?: boolean
}

interface DashboardPageLayoutProps {
  user: {
    name?: string | null
    email?: string | null
    role?: Role
  }
  title: string
  cards: DashboardCard[]
}

const cardColorClass: Record<CardColor, string> = {
  primary: 'bg-primary/5 border-primary/30 hover:border-primary',
  secondary: 'bg-secondary/10 border-secondary/40 hover:border-secondary',
  info: 'bg-info/10 border-info/30 hover:border-info',
  success: 'bg-success/10 border-success/30 hover:border-success',
  warning: 'bg-warning/10 border-warning/30 hover:border-warning',
  error: 'bg-destructive/10 border-destructive/30 hover:border-destructive',
}

export const DashboardPageLayout: React.FC<DashboardPageLayoutProps> = ({ user, title, cards }) => {
  return (
    <div className="mx-auto w-full max-w-6xl py-8">
      <Card className="rounded-2xl">
        <CardContent className="p-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight">{title}</h1>

          <div className="border-info/30 bg-info/10 mb-6 rounded-lg border p-4">
            <p>
              ยินดีต้อนรับ, <span className="font-bold">{user.name}</span>!
            </p>
            <p className="text-muted-foreground text-sm">
              บทบาท: {user.role} | อีเมล: {user.email}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
              if (card.disabled) {
                return (
                  <Card
                    key={card.href}
                    className="border-border bg-muted cursor-not-allowed border opacity-60"
                  >
                    <CardContent className="p-6">
                      <h3 className="text-muted-foreground mb-2 text-xl font-semibold">
                        {card.title}
                      </h3>
                      <p className="text-muted-foreground">{card.description}</p>
                    </CardContent>
                  </Card>
                )
              }
              return (
                <Link key={card.href} href={card.href} className="no-underline">
                  <Card
                    className={cn(
                      'h-full cursor-pointer border transition-all hover:-translate-y-0.5 hover:shadow-md',
                      cardColorClass[card.color],
                    )}
                  >
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-xl font-semibold">{card.title}</h3>
                      <p className="text-foreground/80">{card.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
