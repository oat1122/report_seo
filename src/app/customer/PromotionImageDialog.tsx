'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface PromotionImageDialogProps {
  src: string | null
  onClose: () => void
}

export function PromotionImageDialog({ src, onClose }: PromotionImageDialogProps) {
  return (
    <Dialog open={!!src} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-[90vw] border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">โปรโมชันขนาดเต็ม</DialogTitle>
        <Button
          size="icon-sm"
          variant="secondary"
          onClick={onClose}
          aria-label="ปิดรูปภาพ"
          className="bg-foreground/70 text-background hover:bg-foreground/90 absolute top-2 right-2 z-10"
        >
          <X />
        </Button>
        {src && (
          <Image
            src={src}
            alt="โปรโมชันขนาดเต็ม"
            width={1200}
            height={800}
            className="h-auto max-h-[90vh] w-full cursor-zoom-out rounded-lg object-contain"
            onClick={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
