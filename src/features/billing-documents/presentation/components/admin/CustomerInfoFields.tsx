'use client'

import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CustomerInfoValue } from './customer-info'

interface Props {
  value: CustomerInfoValue
  onChange: (patch: Partial<CustomerInfoValue>) => void
  // email บัญชีลูกค้า (read-only) — แสดงเฉย ๆ ถ้ามี ไม่ส่งกลับ API
  email?: string | null
}

export function CustomerInfoFields({ value, onChange, email }: Props) {
  const id = useId()
  const nameMissing = value.name.trim().length === 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-name`} data-required>
            ชื่อลูกค้า
          </Label>
          <Input
            id={`${id}-name`}
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="ชื่อบริษัท / บุคคล"
            aria-required
            aria-describedby={nameMissing ? `${id}-name-hint` : undefined}
          />
          {nameMissing && (
            <span id={`${id}-name-hint`} className="text-text-secondary text-xs">
              ต้องระบุชื่อลูกค้าก่อนสร้างเอกสาร
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor={`${id}-tax`}>เลขผู้เสียภาษี</Label>
          <Input
            id={`${id}-tax`}
            value={value.taxId}
            onChange={(e) => onChange({ taxId: e.target.value })}
            placeholder="เลข 13 หลัก"
            inputMode="numeric"
            maxLength={13}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor={`${id}-contact`}>ผู้ติดต่อ</Label>
          <Input
            id={`${id}-contact`}
            value={value.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="ชื่อผู้ติดต่อ"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor={`${id}-phone`}>เบอร์โทร</Label>
          <Input
            id={`${id}-phone`}
            type="tel"
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="0X-XXX-XXXX"
            maxLength={20}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor={`${id}-address`}>ที่อยู่</Label>
        <Textarea
          id={`${id}-address`}
          value={value.address}
          onChange={(e) => onChange({ address: e.target.value })}
          rows={2}
          placeholder="ที่อยู่สำหรับออกเอกสาร"
        />
      </div>

      {email && (
        <p className="text-text-secondary text-xs">
          อีเมล (จากบัญชีลูกค้า): <span className="text-foreground font-medium">{email}</span>
        </p>
      )}
    </div>
  )
}
