'use client'

import { Camera } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface SnapshotEntry {
  keyword: string
  position: number | null
  traffic: number
  color: string
}

interface SnapshotViewProps {
  entries: SnapshotEntry[]
  /** ข้อความบอกบริบท เช่น "ยังมีข้อมูลแค่ 1 รอบ — แสดงเป็น snapshot" */
  note?: string
  className?: string
}

/**
 * แทน chart เมื่อข้อมูลมีน้อยเกินไป (1 จุด/รอบ) — แสดงเป็นตาราง snapshot
 * แทนการแสดง "ยังไม่มีข้อมูลเพียงพอ" ที่ไม่ได้ value
 */
export const SnapshotView = ({ entries, note, className }: SnapshotViewProps) => {
  if (entries.length === 0) return null

  return (
    <div className={cn('border-border bg-card rounded-xl border border-dashed p-4', className)}>
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
        <Camera className="size-4" />
        <span>{note ?? 'ยังมีข้อมูลแค่รอบเดียว — แสดงเป็น snapshot'}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead className="text-right">Position</TableHead>
            <TableHead className="text-right">Traffic</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.keyword}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="font-medium">{e.keyword}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {e.position == null ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  <Badge variant="outline" className="tabular-nums">
                    #{e.position}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {e.traffic.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
