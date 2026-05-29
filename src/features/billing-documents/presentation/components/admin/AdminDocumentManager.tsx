'use client'

import { useState } from 'react'
import { FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AllDocumentsTable } from './AllDocumentsTable'
import { StandaloneDocumentCreator } from './StandaloneDocumentCreator'

export function AdminDocumentManager() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <FilePlus className="mr-2 size-4" />
          สร้างเอกสารใหม่
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AllDocumentsTable />
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>สร้างเอกสารใหม่</DialogTitle>
            <DialogDescription>
              สร้างเอกสาร PDF โดยกรอกข้อมูลลูกค้าเอง หรือเลือกจากระบบ
            </DialogDescription>
          </DialogHeader>
          <StandaloneDocumentCreator onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
