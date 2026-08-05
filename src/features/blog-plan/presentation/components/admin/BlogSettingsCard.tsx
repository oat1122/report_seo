'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card>
      <CardHeader>
        <CardTitle>ตั้งค่าแผนบทความ</CardTitle>
        <CardDescription>
          กำหนดโควตาต่อเดือน มอบหมายผู้เขียน และเลือกว่าลูกค้ารายนี้ต้องตรวจงานก่อนหรือไม่
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="border-border flex flex-wrap items-start gap-3 rounded-xl border p-4">
          <Switch
            id="blog-requires-approval"
            checked={requiresApproval}
            onCheckedChange={setRequiresApproval}
          />
          <div className="flex min-w-56 flex-1 flex-col gap-1">
            <Label htmlFor="blog-requires-approval">ให้ลูกค้าตรวจงานก่อน</Label>
            <span className="text-muted-foreground text-sm">
              {requiresApproval
                ? 'เปิดอยู่ — 5 ขั้น: ส่งหัวข้อ → ลูกค้าตรวจ → ส่งบทความ → ลูกค้าตรวจ → ส่งไฟล์ final + ภาพปก'
                : 'ปิดอยู่ — ขั้นเดียว: ผู้เขียนเลือกคีย์เวิร์ดแล้วอัปไฟล์ final + ภาพปกได้เลย'}
            </span>
            <span className="text-muted-foreground text-xs">
              เปลี่ยนแล้วมีผลกับบทความที่ยังไม่เสร็จของลูกค้ารายนี้ด้วย
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex w-32 flex-col gap-1.5">
            <Label htmlFor="articles-per-month">บทความ/เดือน</Label>
            <Input
              id="articles-per-month"
              type="number"
              min={0}
              max={100}
              value={quota}
              onChange={(event) => setQuota(event.target.value)}
            />
          </div>

          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <Label htmlFor="blog-writer">ผู้เขียนที่รับผิดชอบ</Label>
            <Select value={writerId} onValueChange={setWriterId}>
              <SelectTrigger id="blog-writer">
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

          <Button
            disabled={!isDirty || updateSettings.isPending}
            onClick={() =>
              updateSettings.mutate({
                articlesPerMonth: Number(quota) || 0,
                blogWriterId: writerId === UNASSIGNED ? null : writerId,
                blogRequiresApproval: requiresApproval,
              })
            }
          >
            บันทึก
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
