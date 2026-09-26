'use client'

import { useState } from 'react'
import Image from 'next/image'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Role } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  className?: string
}

export default function LoginForm({ className }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง ตรวจสอบแล้วลองอีกครั้ง')
      } else if (result?.ok) {
        const session = await getSession()
        switch (session?.user?.role) {
          case Role.ADMIN:
            router.push('/admin')
            break
          case Role.SEO_DEV:
            router.push('/seo')
            break
          case Role.BLOG_WRITER:
            router.push('/blog')
            break
          case Role.CUSTOMER:
            router.push('/customer')
            break
          default:
            router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หากยังไม่ได้ให้ติดต่อผู้ดูแลระบบ')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const errorId = error ? 'login-error' : undefined

  return (
    <main className={cn('flex min-h-dvh items-center justify-center px-4 py-10', className)}>
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
          aria-labelledby="login-title"
          className="border-glass-border bg-glass-card shadow-card w-full rounded-[24px] border p-6 backdrop-blur-[14px] sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-1.5">
            <h1 id="login-title" className="text-[26px] leading-tight font-semibold">
              เข้าสู่ระบบ
            </h1>
            <p className="text-text-secondary text-sm">กรุณาใส่อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div
                id="login-error"
                role="alert"
                className="bg-danger-subtle text-danger-strong flex items-start gap-2 rounded-[12px] px-3.5 py-3 text-sm"
              >
                <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                disabled={isLoading}
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error || undefined}
                aria-describedby={errorId}
                className="bg-white/90"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <InputGroup className="bg-white/90">
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error || undefined}
                  aria-describedby={errorId}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-sm"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <Button type="submit" disabled={isLoading} className="mt-2 w-full">
              {isLoading && <Loader2 aria-hidden className="animate-spin" />}
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>

            <p className="text-text-secondary text-center text-[13px]">
              ยังไม่มีบัญชี? กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}
