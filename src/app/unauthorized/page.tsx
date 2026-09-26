import Image from 'next/image'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-6">
        <span className="flex items-center gap-2.5">
          <Image src="/img/brand/logo-mark.png" alt="" width={46} height={45} priority />
          <Image
            src="/img/brand/logo-wordmark.png"
            alt="SEO PRIME"
            width={142}
            height={18}
            priority
          />
        </span>

        <section
          aria-labelledby="unauthorized-title"
          className="border-glass-border bg-glass-card shadow-card flex w-full flex-col gap-5 rounded-[24px] border p-6 backdrop-blur-[14px] sm:p-8"
        >
          <span
            aria-hidden
            className="bg-danger-subtle text-danger-strong flex size-[52px] items-center justify-center rounded-[16px]"
          >
            <ShieldAlert className="size-6" />
          </span>

          <div className="flex flex-col gap-1.5">
            <h1 id="unauthorized-title" className="text-[26px] leading-tight font-semibold">
              ไม่มีสิทธิ์เข้าถึง
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              บัญชีนี้ไม่มีสิทธิ์เข้าหน้าที่คุณเปิด กลับไปหน้าหลักของบัญชี
              หรือเข้าสู่ระบบด้วยบัญชีอื่น หากคิดว่าผิดพลาดกรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2.5 sm:grid sm:grid-cols-2">
            <Button variant="outline" asChild>
              <Link href="/login">เข้าสู่ระบบใหม่</Link>
            </Button>
            <Button asChild>
              <Link href="/">กลับไปหน้าหลัก</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
