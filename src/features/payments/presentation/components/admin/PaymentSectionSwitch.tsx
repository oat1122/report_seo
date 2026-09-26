'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Wallet } from 'lucide-react'
import { motion } from '@/components/motion'
import { cn } from '@/lib/utils'

/** สวิตช์รองใต้แท็บ "การชำระเงินและเอกสาร" — สลับระหว่างหน้า /payments กับ /documents */
export function PaymentSectionSwitch({ customerId }: { customerId: string }) {
  const pathname = usePathname()
  const root = `/admin/customers/${customerId}`
  const items = [
    { label: 'การชำระเงิน', href: `${root}/payments`, icon: Wallet },
    { label: 'เอกสาร', href: `${root}/documents`, icon: FileText },
  ]

  return (
    <nav
      aria-label="การชำระเงินหรือเอกสาร"
      className="border-glass-border grid grid-cols-2 gap-1 self-stretch rounded-[14px] border bg-white/60 p-1 sm:inline-grid sm:self-start dark:bg-white/5"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'focus-visible:ring-ring/60 relative flex h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-sm whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-none sm:h-9',
              active ? 'text-foreground font-medium' : 'text-text-secondary hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId="payment-section-pill"
                className="shadow-card absolute inset-0 rounded-[10px] bg-white dark:bg-white/10"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <Icon aria-hidden className="relative size-4" />
            <span className="relative">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
