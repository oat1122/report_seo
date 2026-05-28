'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { OverallMetricsHistory } from '@/types/history'
import { formatDuration } from '@/lib/duration'
import { cn } from '@/lib/utils'
import { HistoryBulkToolbar } from './HistoryBulkToolbar'

interface VisibilityPayload {
  historyId?: string
  historyIds?: string[]
  isVisible: boolean
}

interface HistoryMetricsTabProps {
  history: OverallMetricsHistory[]
  isLoading?: boolean
  canManage?: boolean
  onToggleVisibility?: (payload: VisibilityPayload) => void
}

export const HistoryMetricsTab = ({
  history,
  isLoading = false,
  canManage = false,
  onToggleVisibility,
}: HistoryMetricsTabProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const visibleCount = history.filter((h) => h.isVisible).length

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? history.map((h) => h.id) : [])

  const handleBulkSet = (isVisible: boolean) => {
    if (selectedIds.length === 0) return
    onToggleVisibility?.({ historyIds: selectedIds, isVisible })
    setSelectedIds([])
  }

  const handleToggleSingle = (historyId: string, nextVisible: boolean) =>
    onToggleVisibility?.({ historyId, isVisible: nextVisible })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="text-info size-8 animate-spin" />
      </div>
    )
  }

  const colSpan = canManage ? 11 : 9
  const allSelected = history.length > 0 && selectedIds.length === history.length
  const someSelected = selectedIds.length > 0 && !allSelected

  return (
    <div className="space-y-3">
      {canManage && history.length > 0 && (
        <HistoryBulkToolbar
          visibleCount={visibleCount}
          totalCount={history.length}
          selectedCount={selectedIds.length}
          onShow={() => handleBulkSet(true)}
          onHide={() => handleBulkSet(false)}
        />
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {canManage && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected || (someSelected ? 'indeterminate' : false)}
                    onCheckedChange={(c) => handleSelectAll(c === true)}
                    aria-label="เลือกทั้งหมด"
                  />
                </TableHead>
              )}
              {canManage && <TableHead className="text-center">แสดง</TableHead>}
              <TableHead>วันที่บันทึก</TableHead>
              <TableHead className="text-right">DR</TableHead>
              <TableHead className="text-right">Health</TableHead>
              <TableHead className="text-right">Age</TableHead>
              <TableHead className="text-right">Spam</TableHead>
              <TableHead className="text-right">Traffic</TableHead>
              <TableHead className="text-right">Keywords</TableHead>
              <TableHead className="text-right">Backlinks</TableHead>
              <TableHead className="text-right">Ref Domains</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length > 0 ? (
              history.map((record) => {
                const isSelected = selectedIds.includes(record.id)
                return (
                  <TableRow
                    key={record.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className={cn(!record.isVisible && 'opacity-55')}
                  >
                    {canManage && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelected(record.id)}
                          aria-label="เลือกแถว"
                        />
                      </TableCell>
                    )}
                    {canManage && (
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Checkbox
                                checked={record.isVisible}
                                onCheckedChange={(c) => handleToggleSingle(record.id, c === true)}
                                aria-label="แสดงในรายงานลูกค้า"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {record.isVisible ? 'กดเพื่อซ่อนจากลูกค้า' : 'กดเพื่อเปิดให้ลูกค้าเห็น'}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    )}
                    <TableCell>{new Date(record.dateRecorded).toLocaleString('th-TH')}</TableCell>
                    <TableCell className="text-right">{record.domainRating}</TableCell>
                    <TableCell className="text-right">{record.healthScore}</TableCell>
                    <TableCell className="text-right">
                      {formatDuration(record.ageInYears, record.ageInMonths || 0)}
                    </TableCell>
                    <TableCell className="text-right">{record.spamScore}%</TableCell>
                    <TableCell className="text-right">
                      {record.organicTraffic.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.organicKeywords.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.backlinks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.refDomains.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-muted-foreground py-6 text-center">
                  ไม่พบข้อมูลประวัติ Overall Metrics
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
