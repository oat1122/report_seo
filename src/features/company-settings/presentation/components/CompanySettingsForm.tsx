'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Save, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup } from '@/components/ui/field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useGetCompanySettings,
  useUpsertCompanySettings,
  useUploadLogo,
} from '../hooks/useCompanySettings'

export function CompanySettingsForm() {
  const { data: settings, isLoading } = useGetCompanySettings()
  const upsertMutation = useUpsertCompanySettings()
  const uploadLogoMutation = useUploadLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    address: '',
    taxId: '',
    phone: '',
    email: '',
  })

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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>ข้อมูลบริษัท</CardTitle>
          <CardDescription>
            ข้อมูลนี้จะแสดงบนเอกสาร PDF (ใบวางบิล, ใบแจ้งหนี้, ใบเสร็จ, ใบกำกับภาษี)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Label htmlFor="cs-name">ชื่อบริษัท</Label>
              <Input
                id="cs-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="บริษัท ตัวอย่าง จำกัด"
              />
            </Field>

            <Field>
              <Label htmlFor="cs-address">ที่อยู่</Label>
              <Textarea
                id="cs-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              />
            </Field>

            <Field>
              <Label htmlFor="cs-taxId">เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                id="cs-taxId"
                name="taxId"
                value={form.taxId}
                onChange={handleChange}
                placeholder="0000000000000"
                maxLength={13}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="cs-phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="cs-phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0xx-xxx-xxxx"
                />
              </Field>
              <Field>
                <Label htmlFor="cs-email">อีเมล</Label>
                <Input
                  id="cs-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                />
              </Field>
            </div>

            <Button
              onClick={handleSave}
              disabled={upsertMutation.isPending || !form.name || !form.address || !form.taxId}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto"
            >
              {upsertMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              บันทึก
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>โลโก้บริษัท</CardTitle>
          <CardDescription>รูปภาพ JPG/PNG ขนาดไม่เกิน 5MB</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="border-border bg-muted/30 flex size-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
            {settings?.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element -- dynamic upload path not in remotePatterns */
              <img src={settings.logoUrl} alt="โลโก้บริษัท" className="size-full object-contain" />
            ) : (
              <ImagePlus className="text-muted-foreground size-10" />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleLogoUpload}
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLogoMutation.isPending}
          >
            {uploadLogoMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            {settings?.logoUrl ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
