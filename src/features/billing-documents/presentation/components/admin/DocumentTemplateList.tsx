'use client'

import { useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, LayoutTemplate } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useListDocumentTemplates,
  useDeleteDocumentTemplate,
} from '../../hooks/useDocumentTemplates'
import { DocumentTemplateEditor } from './DocumentTemplateEditor'
import type { DocumentTemplate } from '../../../domain/DocumentTemplate'

export function DocumentTemplateList() {
  const { data: templates = [], isLoading } = useListDocumentTemplates()
  const deleteMutation = useDeleteDocumentTemplate()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<DocumentTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentTemplate | null>(null)

  const handleEdit = (template: DocumentTemplate) => {
    setEditTemplate(template)
    setEditorOpen(true)
  }

  const handleCreate = () => {
    setEditTemplate(null)
    setEditorOpen(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('ลบ template เรียบร้อย')
        setDeleteTarget(null)
      },
    })
  }

  const scopeLabel = (scope: string) => (scope === 'GENERAL' ? 'กลาง' : 'เฉพาะแผน')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="size-5" />
                Template เอกสาร
              </CardTitle>
              <CardDescription>กำหนดรายการสินค้า/บริการที่จะแสดงในเอกสาร PDF</CardDescription>
            </div>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-1 size-4" />
              สร้าง Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              ยังไม่มี template — กด &quot;สร้าง Template&quot; เพื่อเริ่มต้น
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead className="w-24">ประเภท</TableHead>
                  <TableHead className="w-24">สถานะ</TableHead>
                  <TableHead className="w-36">สร้างเมื่อ</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant={t.scope === 'GENERAL' ? 'secondary' : 'outline'}>
                        {scopeLabel(t.scope)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.isActive ? 'default' : 'destructive'}>
                        {t.isActive ? 'ใช้งาน' : 'ปิด'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(t.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(t)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(t)}>
                          <Trash2 className="text-destructive size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DocumentTemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editTemplate={editTemplate}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบ Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Template &quot;{deleteTarget?.name}&quot; จะถูกลบถาวร
              แผนชำระที่เชื่อมโยงจะสูญเสียการเชื่อมต่อ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
