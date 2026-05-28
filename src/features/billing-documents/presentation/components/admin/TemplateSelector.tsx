'use client'

import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useListDocumentTemplates } from '../../hooks/useDocumentTemplates'

interface Props {
  value: string | null
  onValueChange: (value: string | null) => void
  label?: string
}

const NO_TEMPLATE = '__none__'

export function TemplateSelector({ value, onValueChange, label = 'Template เอกสาร' }: Props) {
  const { data: templates = [], isLoading } = useListDocumentTemplates()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-3.5 animate-spin" />
          กำลังโหลด...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value ?? NO_TEMPLATE}
        onValueChange={(v) => onValueChange(v === NO_TEMPLATE ? null : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="เลือก template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_TEMPLATE}>ไม่เลือก</SelectItem>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
              {t.scope === 'GENERAL' ? ' (กลาง)' : ' (เฉพาะแผน)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
