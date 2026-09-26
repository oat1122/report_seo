'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, ImagePlus, Loader2, Save, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormSkeleton } from '@/components/skeletons'
import {
  useGetCompanySettings,
  useUpsertCompanySettings,
  useUploadLogo,
} from '../hooks/useCompanySettings'

type CompanyForm = {
  name: string
  address: string
  taxId: string
  phone: string
  email: string
}

const EMPTY_FORM: CompanyForm = { name: '', address: '', taxId: '', phone: '', email: '' }

export function CompanySettingsForm() {
  const { data: settings, isLoading, isError, refetch } = useGetCompanySettings()
  const upsertMutation = useUpsertCompanySettings()
  const uploadLogoMutation = useUploadLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<CompanyForm>(EMPTY_FORM)

  const formFromSettings = (): CompanyForm =>
    settings
      ? {
          name: settings.name || '',
          address: settings.address || '',
          taxId: settings.taxId || '',
          phone: settings.phone || '',
          email: settings.email || '',
        }
      : EMPTY_FORM

  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name || '',
        address: settings.address || '',
        taxId: settings.taxId || '',
        phone: settings.phone || '',
        email: settings.email || '',
      })
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = () => {
    upsertMutation.mutate(
      {
        name: form.name,
        address: form.address,
        taxId: form.taxId,
        phone: form.phone || null,
        email: form.email || null,
      },
      {
        onSuccess: () => toast.success('บันทึกข้อมูลบริษัทเรียบร้อย'),
      },
    )
  }

  // ยกเลิก = คืนค่าฟอร์มเป็นข้อมูลที่บันทึกไว้ล่าสุด
  const handleReset = () => setForm(formFromSettings())

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadLogoMutation.mutate(file, {
      onSuccess: () => toast.success('อัปโหลดโลโก้เรียบร้อย'),
    })
    e.target.value = ''
  }

  if (isLoading) {
    return (
      <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <FormSkeleton rows={5} />
        <FormSkeleton rows={2} />
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="bg-danger-subtle text-danger-strong flex flex-col gap-3 rounded-[16px] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="flex items-start gap-2">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          โหลดข้อมูลบริษัทไม่สำเร็จ ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง
        </span>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          ลองอีกครั้ง
        </Button>
      </div>
    )
  }

  const saved = formFromSettings()
  const isDirty = (Object.keys(form) as (keyof CompanyForm)[]).some((k) => form[k] !== saved[k])
  const missingRequired = !form.name || !form.address || !form.taxId

  return (
    <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>ข้อมูลบริษัท</h2>
          </CardTitle>
          <CardDescription>
            ข้อมูลนี้จะแสดงบนเอกสาร PDF (ใบวางบิล ใบแจ้งหนี้ ใบเสร็จรับเงิน ใบกำกับภาษี)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cs-name" data-required>
              ชื่อบริษัท
            </Label>
            <Input
              id="cs-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="บริษัท ตัวอย่าง จำกัด"
              aria-required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cs-address" data-required>
              ที่อยู่
            </Label>
            <Textarea
              id="cs-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              aria-required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cs-taxId" data-required>
                เลขประจำตัวผู้เสียภาษี
              </Label>
              <Input
                id="cs-taxId"
                name="taxId"
                value={form.taxId}
                onChange={handleChange}
                placeholder="0000000000000"
                inputMode="numeric"
                maxLength={13}
                aria-required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cs-phone">เบอร์โทรศัพท์</Label>
              <Input
                id="cs-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="0xx-xxx-xxxx"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cs-email">อีเมล</Label>
            <Input
              id="cs-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@example.com"
            />
          </div>

          <div className="flex flex-col gap-3 pt-1.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-text-secondary text-xs">
              {missingRequired
                ? 'กรอกชื่อบริษัท ที่อยู่ และเลขผู้เสียภาษีให้ครบก่อนบันทึก'
                : isDirty
                  ? 'มีการแก้ไขที่ยังไม่บันทึก'
                  : 'ข้อมูลเป็นปัจจุบัน'}
            </span>
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!isDirty || upsertMutation.isPending}
              >
                ยกเลิก
              </Button>
              <Button onClick={handleSave} disabled={upsertMutation.isPending || missingRequired}>
                {upsertMutation.isPending ? (
                  <Loader2 aria-hidden className="animate-spin" />
                ) : (
                  <Save aria-hidden />
                )}
                {upsertMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-[18px]">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>โลโก้บริษัท</h2>
            </CardTitle>
            <CardDescription>รูปภาพ JPG/PNG ขนาดไม่เกิน 5MB</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-[18px]">
            <div className="border-border flex size-[140px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border bg-white dark:bg-white/5">
              {settings?.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- dynamic upload path not in remotePatterns */
                <img
                  src={settings.logoUrl}
                  alt="โลโก้บริษัทปัจจุบัน"
                  className="size-full object-contain p-3"
                />
              ) : (
                <ImagePlus aria-hidden className="text-muted-foreground size-10" />
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleLogoUpload}
                aria-hidden
                tabIndex={-1}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLogoMutation.isPending}
                className="self-start"
              >
                {uploadLogoMutation.isPending ? (
                  <Loader2 aria-hidden className="animate-spin" />
                ) : (
                  <Upload aria-hidden />
                )}
                {uploadLogoMutation.isPending
                  ? 'กำลังอัปโหลด...'
                  : settings?.logoUrl
                    ? 'เปลี่ยนโลโก้'
                    : 'อัปโหลดโลโก้'}
              </Button>
              <span className="text-text-secondary text-xs">
                แนะนำพื้นหลังโปร่งใส ขนาดอย่างน้อย 500×500 px
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>ตัวอย่างหัวเอกสาร</h2>
            </CardTitle>
            <CardDescription>หน้าตาหัวเอกสารบน PDF · อัปเดตตามข้อมูลที่กรอก</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              aria-hidden
              className="border-border shadow-popover flex flex-col gap-3 rounded-[12px] border bg-white p-[18px] dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {settings?.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- dynamic upload path not in remotePatterns */
                    <img src={settings.logoUrl} alt="" className="size-10 object-contain" />
                  ) : (
                    <Image src="/img/brand/logo-mark.png" alt="" width={40} height={39} />
                  )}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-xs font-semibold">
                      {form.name || 'ชื่อบริษัท'}
                    </span>
                    <span className="text-text-secondary line-clamp-2 text-[10px]">
                      {form.address || 'ที่อยู่บริษัท'}
                      {form.taxId && ` · เลขผู้เสียภาษี ${form.taxId}`}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-[13px] font-semibold">ใบแจ้งหนี้</span>
                  <span className="text-text-secondary text-[10px]">INVOICE</span>
                </div>
              </div>
              <div className="bg-border h-px" />
              <div className="flex flex-col gap-1.5">
                <span className="bg-border h-1.5 w-3/5 rounded-[3px]" />
                <span className="bg-border h-1.5 w-[85%] rounded-[3px]" />
                <span className="bg-border h-1.5 w-[45%] rounded-[3px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
