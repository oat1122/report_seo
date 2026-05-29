'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import type { CustomerInfoValue } from './customer-info'

interface Props {
  value: CustomerInfoValue
  onChange: (patch: Partial<CustomerInfoValue>) => void
  // email บัญชีลูกค้า (read-only) — แสดงเฉย ๆ ถ้ามี ไม่ส่งกลับ API
  email?: string | null
}

export function CustomerInfoFields({ value, onChange, email }: Props) {
  return (
    <>
      <Field>
        <Label>
          ชื่อลูกค้า <span className="text-destructive">*</span>
        </Label>
        <Input
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="ชื่อบริษัท / บุคคล"
        />
      </Field>

      <Field>
        <Label>ที่อยู่</Label>
        <Textarea
          value={value.address}
          onChange={(e) => onChange({ address: e.target.value })}
          rows={2}
          placeholder="ที่อยู่สำหรับออกเอกสาร"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <Label>เลขผู้เสียภาษี</Label>
          <Input
            value={value.taxId}
            onChange={(e) => onChange({ taxId: e.target.value })}
            placeholder="เลขประจำตัวผู้เสียภาษี"
            maxLength={13}
          />
        </Field>
        <Field>
          <Label>ผู้ติดต่อ</Label>
          <Input
            value={value.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="ชื่อผู้ติดต่อ"
          />
        </Field>
        <Field>
          <Label>เบอร์โทร</Label>
          <Input
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="เบอร์ติดต่อ"
            maxLength={20}
          />
        </Field>
      </div>

      {email && (
        <p className="text-muted-foreground text-xs">
          อีเมล (จากบัญชีลูกค้า): <span className="font-medium">{email}</span>
        </p>
      )}
    </>
  )
}
