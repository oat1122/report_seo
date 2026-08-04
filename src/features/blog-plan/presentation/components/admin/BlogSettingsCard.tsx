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

  useEffect(() => {
    if (!settings) return
    setQuota(String(settings.articlesPerMonth))
    setWriterId(settings.blogWriterId ?? UNASSIGNED)
  }, [settings])

  const isDirty =
    settings !== undefined &&
    (Number(quota) !== settings.articlesPerMonth ||
      writerId !== (settings.blogWriterId ?? UNASSIGNED))

  return (
    <Card>
      <CardHeader>
        <CardTitle>ตั้งค่าแผนบทความ</CardTitle>
        <CardDescription>กำหนดโควตาต่อเดือนและมอบหมายผู้เขียนให้ลูกค้ารายนี้</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-4">
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
            })
          }
        >
          บันทึก
        </Button>
      </CardContent>
    </Card>
  )
}
