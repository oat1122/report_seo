'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { useMobileDrawer } from '@/hooks/ui/useMobileDrawer'
import { navItems } from '@/components/Home/constants/data'

export const Header = () => {
  const router = useRouter()
  const { mobileOpen, handleDrawerToggle, handleDrawerClose } = useMobileDrawer()

  const handleLoginClick = () => {
    router.push('/login')
  }

  return (
    <header className="bg-background sticky top-0 z-40 shadow-sm">
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <div className="flex h-16 items-center gap-3">
          <Sheet
            open={mobileOpen}
            onOpenChange={(o) => (o ? handleDrawerToggle() : handleDrawerClose())}
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="open drawer"
                className="group lg:hidden"
              >
                <AnimatedIcon
                  name="menu"
                  trigger="hover"
                  size={20}
                  fallback={<Menu className="size-5" />}
                />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60">
              <SheetHeader>
                <SheetTitle>SEO PRIME</SheetTitle>
                <SheetDescription className="sr-only">เมนูหลัก</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item}>
                    <Button variant="ghost" className="justify-center">
                      {item}
                    </Button>
                  </SheetClose>
                ))}
                <Button
                  className="bg-info text-info-foreground hover:bg-info/90 mt-4"
                  onClick={() => {
                    handleDrawerClose()
                    handleLoginClick()
                  }}
                >
                  เข้าสู่ระบบ
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center">
            <Image
              src="/img/LOGO_SEO_PRIME4_0-removebg.png"
              alt="SEO PRIME Logo"
              width={80}
              height={28}
              priority
            />
          </div>

          <Button
            className="bg-info text-info-foreground hover:bg-info/90 hidden lg:inline-flex"
            onClick={handleLoginClick}
          >
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    </header>
  )
}
