'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import axios from '@/lib/axios'
import type { ApiSuccess } from '@/infrastructure/http'
import { useBlogSettings, useUpdateBlogSettings } from '../../hooks/useBlogPlan'

interface WriterOption {
  id: string
  name: string | null
  email: string
}

const UNASSIGNED = 'UNASSIGNED'

function useBlogWriterOptions() {
  return useQuery({
    queryKey: ['blog-writers'],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<WriterOption[]>>('/users/blog-writers')
      return data.data
    },
    staleTime: 5 * 60_000,
  })
}

export function BlogSettingsCard({ customerId }: { customerId: string }) {
  const { data: settings } = useBlogSettings(customerId)
  const { data: writers } = useBlogWriterOptions()
  const updateSettings = useUpdateBlogSettings(customerId)

  const [quota, setQuota] = useState('0')
  const [writerId, setWriterId] = useState(UNASSIGNED)
  const [requiresApproval, setRequiresApproval] = useState(true)

  useEffect(() => {
    if (!settings) return
    setQuota(String(settings.articlesPerMonth))
    setWriterId(settings.blogWriterId ?? UNASSIGNED)
    setRequiresApproval(settings.blogRequiresApproval)
  }, [settings])

  const isDirty =
    settings !== undefined &&
    (Number(quota) !== settings.articlesPerMonth ||
      writerId !== (settings.blogWriterId ?? UNASSIGNED) ||
      requiresApproval !== settings.blogRequiresApproval)

  return (
    <Card
      role="region"
      aria-label="ตั้งค่าแผนบทความ"
      className="gap-4 px-5 py-4.5 sm:px-6 xl:grid xl:grid-cols-[minmax(0,1.6fr)_9.5rem_minmax(0,1fr)_auto] xl:items-end xl:gap-[18px]"
    >
      <div className="flex items-start gap-3">
        <Switch
          id="blog-requires-approval"
          className="mt-0.5"
          checked={requiresApproval}
          onCheckedChange={setRequiresApproval}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Label htmlFor="blog-requires-approval" className="text-sm font-medium">
            ให้ลูกค้าตรวจงานก่อน
          </Label>
          <span className="text-text-secondary text-xs leading-relaxed">
            {requiresApproval
              ? '5 ขั้นตอน: ส่งหัวข้อ → ลูกค้าตรวจ → ส่งบทความ → ลูกค้าตรวจ → ส่งไฟล์ final + ภาพปก'
              : 'ขั้นเดียว: ผู้เขียนเลือกคีย์เวิร์ดแล้วอัปไฟล์ final + ภาพปกได้เลย'}
            {' · '}เปลี่ยนแล้วมีผลกับบทความที่ยังไม่เสร็จของลูกค้ารายนี้ด้วย
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] xl:contents">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="articles-per-month" className="text-[13px] font-medium">
            บทความ/เดือน
          </Label>
          <Input
            id="articles-per-month"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            className="h-11 rounded-[12px] tabular-nums"
            value={quota}
            onChange={(event) => setQuota(event.target.value)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="blog-writer" className="text-[13px] font-medium">
            ผู้เขียนที่รับผิดชอบ
          </Label>
          <Select value={writerId} onValueChange={setWriterId}>
            <SelectTrigger id="blog-writer" className="h-11 w-full rounded-[12px]">
              <SelectValue placeholder="เลือกผู้เขียน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>— ยังไม่มอบหมาย —</SelectItem>
              {writers?.map((writer) => (
                <SelectItem key={writer.id} value={writer.id}>
                  {writer.name ?? writer.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        className="h-11 rounded-[12px] px-5 sm:w-fit sm:self-end"
        disabled={!isDirty || updateSettings.isPending}
        onClick={() =>
          updateSettings.mutate({
            articlesPerMonth: Number(quota) || 0,
            blogWriterId: writerId === UNASSIGNED ? null : writerId,
            blogRequiresApproval: requiresApproval,
          })
        }
      >
        {updateSettings.isPending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {updateSettings.isPending ? 'กำลังบันทึก…' : 'บันทึก'}
      </Button>
    </Card>
  )
}
