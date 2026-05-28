'use client'

import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { KeywordReportHistory } from '@/types/history'

interface KeywordHistoryModalProps {
  open: boolean
  onClose: () => void
  history: KeywordReportHistory[]
  keywordName: string
  isLoading?: boolean
}

export const KeywordHistoryModal = ({
  open,
  onClose,
  history,
  keywordName,
  isLoading = false,
}: KeywordHistoryModalProps) => {
  const sorted = [...history].sort(
    (a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime(),
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto sm:max-w-[min(92vw,960px)]">
        <DialogHeader>
          <DialogTitle>ประวัติการเปลี่ยนแปลง: {keywordName}</DialogTitle>
          <DialogDescription className="sr-only">ตารางประวัติของคีย์เวิร์ดนี้</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-info size-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่บันทึก</TableHead>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-center">Traffic</TableHead>
                <TableHead className="text-center">KD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length > 0 ? (
                sorted.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.dateRecorded).toLocaleString('th-TH')}</TableCell>
                    <TableCell className="text-center">{record.position || '-'}</TableCell>
                    <TableCell className="text-center">{record.traffic.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{record.kd}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-6 text-center">
                    ไม่พบข้อมูลประวัติ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
