'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, BellRing, Loader2, X } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_GROUPS,
  type NotificationType,
} from '../../domain/NotificationTypes'
import { useNotificationPreferences, useUpdatePreferences } from '../hooks/useNotifications'

interface NotificationPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationPreferencesDialog({
  open,
  onOpenChange,
}: NotificationPreferencesDialogProps) {
  const { data: preferences, isLoading, isError, refetch } = useNotificationPreferences()
  const updatePreferences = useUpdatePreferences()
  const [localState, setLocalState] = useState<Record<string, boolean>>({})
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      initializedRef.current = false
      return
    }
    if (preferences && !initializedRef.current) {
      const state: Record<string, boolean> = {}
      for (const pref of preferences) {
        state[pref.type] = pref.enabled
      }
      setLocalState(state)
      initializedRef.current = true
    }
  }, [preferences, open])

  const handleToggle = (type: string) => {
    setLocalState((prev) => ({ ...prev, [type]: !(prev[type] ?? true) }))
  }

  const handleSave = () => {
    const items = Object.entries(localState).map(([type, enabled]) => ({
      type,
      enabled,
    }))
    updatePreferences.mutate(items, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 max-sm:pb-0 sm:max-w-[520px]"
      >
        <header className="flex items-start gap-3.5 px-6 pt-[22px] pb-4">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <BellRing className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle className="text-xl leading-snug font-semibold">
              ตั้งค่าการแจ้งเตือน
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-[13px]">
              เลือกประเภทที่ต้องการรับแจ้งเตือน ปิดได้ทีละรายการ
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="outline" size="icon-sm" aria-label="ปิด" className="shrink-0">
              <X aria-hidden />
            </Button>
          </DialogClose>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-10" role="status">
              <Loader2 aria-hidden className="text-text-secondary size-5 animate-spin" />
              <span className="sr-only">กำลังโหลดการตั้งค่า</span>
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="bg-danger-subtle text-danger-strong flex flex-col items-start gap-3 rounded-[14px] p-4 text-sm"
            >
              <span className="flex items-start gap-2">
                <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
                โหลดการตั้งค่าการแจ้งเตือนไม่สำเร็จ ลองใหม่อีกครั้ง
              </span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                ลองอีกครั้ง
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {Object.entries(NOTIFICATION_TYPE_GROUPS).map(([groupLabel, types]) => (
                <fieldset key={groupLabel} className="flex min-w-0 flex-col gap-2">
                  <legend className="text-text-secondary mb-2 text-[11px] font-medium tracking-[0.14em] uppercase">
                    {groupLabel}
                  </legend>
                  <div className="bg-glass-tile border-border/60 divide-border/60 flex flex-col divide-y overflow-hidden rounded-[16px] border">
                    {types.map((type) => {
                      const id = `notif-pref-${type}`
                      return (
                        <div
                          key={type}
                          className="flex min-h-14 items-center justify-between gap-4 px-4 py-2.5"
                        >
                          <label htmlFor={id} className="flex-1 cursor-pointer text-sm">
                            {NOTIFICATION_TYPE_LABELS[type as NotificationType]}
                          </label>
                          <Switch
                            id={id}
                            checked={localState[type] ?? true}
                            onCheckedChange={() => handleToggle(type)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </div>

        <footer className="border-border bg-muted/40 flex flex-col-reverse gap-2.5 border-t px-6 py-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end dark:bg-white/5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending || isLoading || isError}
          >
            {updatePreferences.isPending && <Loader2 aria-hidden className="animate-spin" />}
            {updatePreferences.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
