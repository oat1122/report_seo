'use client'

import React, { useEffect, useState } from 'react'
import { CircleAlert, Eye, EyeOff, KeyRound, RefreshCw, UserPen, UserPlus, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from 'next-auth/react'
import { Role } from '@/types/auth'
import { User, UserFormState } from '@/types/user'
import { getRoleLabel } from '@/lib/role-display'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface UserModalProps {
  open: boolean
  isEditing: boolean
  currentUser: UserFormState
  onClose: () => void
  onSave: () => void
  onSavePassword: () => void
  onFormChange: (name: string, value: string | Role | boolean) => void
  seoDevs: User[]
  isSeoDevView?: boolean
}

const NONE_SEO_DEV = '__none__'

type TabValue = 'account' | 'password'

// ลำดับ + คำอธิบายบทบาทตาม artboard Admin-CRUD-UserCreate
const ROLE_CHOICES: { role: Role; description: string }[] = [
  { role: Role.ADMIN, description: 'จัดการได้ทุกอย่าง' },
  { role: Role.CUSTOMER, description: 'ดูรายงานของตัวเอง' },
  { role: Role.SEO_DEV, description: 'ดูแลลูกค้าที่มอบหมาย' },
  { role: Role.BLOG_WRITER, description: 'เขียนบทความตามแผน' },
]

// สุ่มรหัสผ่านฝั่ง client (มีตัวใหญ่ ตัวเล็ก ตัวเลข สัญลักษณ์อย่างละตัว) — ผู้ใช้ยังแก้เองได้
function generatePassword(length = 10): string {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '#@!$%&*?']
  const all = sets.join('')
  const rand = crypto.getRandomValues(new Uint32Array(length * 2))
  const chars = sets.map((set, i) => set[rand[i] % set.length])
  for (let i = sets.length; i < length; i++) chars.push(all[rand[i] % all.length])
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand[length + i] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

// ความแข็งแรงของรหัสผ่าน 0–4 (ใช้แสดงผลเท่านั้น ไม่ได้บล็อกการบันทึก)
function passwordStrength(pw: string): number {
  if (!pw) return 0
  if (pw.length < 8) return 1
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH = [
  null,
  { label: 'อ่อน', bar: 'bg-destructive', text: 'text-danger-strong' },
  { label: 'ปานกลาง', bar: 'bg-warning-accent', text: 'text-warning-text' },
  { label: 'ดี', bar: 'bg-chart-2', text: 'text-success' },
  { label: 'แข็งแรง', bar: 'bg-chart-2', text: 'text-success' },
] as const

function RequiredMark() {
  return (
    <span aria-hidden className="text-danger-strong">
      *
    </span>
  )
}

function SectionLegend({ title, description }: { title: string; description?: string }) {
  return (
    <legend className="mb-3.5 flex flex-col gap-0.5 p-0">
      <span className="text-[15px] font-semibold">{title}</span>
      {description && <span className="text-text-secondary text-xs">{description}</span>}
    </legend>
  )
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  isEditing,
  currentUser,
  onClose,
  onSave,
  onSavePassword,
  onFormChange,
  seoDevs,
  isSeoDevView = false,
}) => {
  const { data: session } = useSession()
  const canEditRole = session?.user?.role === Role.ADMIN
  const isOwnProfile = session?.user?.id === currentUser.id

  const [tab, setTab] = useState<TabValue>('account')
  const [showPassword, setShowPassword] = useState(false)

  // Reset transient UI state whenever the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setTab('account')
      setShowPassword(false)
    }
  }, [open])

  const canChangePassword = !isSeoDevView || isOwnProfile
  const requiresCurrentPassword = isOwnProfile && !canEditRole
  const roleLocked = isSeoDevView && !canEditRole

  const handleCloseModal = () => {
    onFormChange('currentPassword', '')
    onFormChange('newPassword', '')
    onFormChange('confirmPassword', '')
    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    onFormChange(name, type === 'checkbox' ? checked : value)
  }

  const handleGeneratePassword = () => {
    onFormChange('password', generatePassword())
    setShowPassword(true)
  }

  const passwordSaveDisabled =
    !currentUser.newPassword ||
    !currentUser.confirmPassword ||
    (requiresCurrentPassword && !currentUser.currentPassword)

  const confirmMismatch =
    !!currentUser.confirmPassword && currentUser.confirmPassword !== currentUser.newPassword
  const strength = passwordStrength(currentUser.newPassword || '')
  const strengthStyle = STRENGTH[strength]

  const toggleVisibility = (
    <InputGroupButton
      size="icon-xs"
      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
      onClick={() => setShowPassword((v) => !v)}
    >
      {showPassword ? <EyeOff /> : <Eye />}
    </InputGroupButton>
  )

  // --- Account fields -------------------------------------------------------
  const accountFields = (
    <div className="flex flex-col gap-6">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <SectionLegend title="บัญชีผู้ใช้" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="user-name" data-required>
              ชื่อผู้ใช้
            </Label>
            <Input
              id="user-name"
              name="name"
              value={currentUser.name || ''}
              onChange={handleInputChange}
              placeholder="ชื่อที่แสดงในระบบ"
              aria-required
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="user-email" data-required>
              อีเมล
            </Label>
            <Input
              id="user-email"
              name="email"
              type="email"
              value={currentUser.email || ''}
              onChange={handleInputChange}
              placeholder="name@example.com"
              aria-required
            />
          </div>

          {!isEditing && (
            <div className="grid gap-2.5 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="user-password" data-required>
                  รหัสผ่านเริ่มต้น
                </Label>
                <InputGroup>
                  <InputGroupInput
                    id="user-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentUser.password || ''}
                    onChange={handleInputChange}
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    autoComplete="new-password"
                    aria-required
                    aria-describedby="user-password-hint"
                    className={cn(showPassword && 'font-mono tracking-[0.02em]')}
                  />
                  <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
                </InputGroup>
                <span id="user-password-hint" className="text-text-secondary text-xs">
                  อย่างน้อย 8 ตัวอักษร · ส่งให้ผู้ใช้แล้วให้เปลี่ยนหลังเข้าสู่ระบบ
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                className="sm:mt-[26px]"
              >
                <RefreshCw aria-hidden />
                สุ่มรหัสใหม่
              </Button>
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <SectionLegend title="บทบาท" />
        <RadioGroup
          value={currentUser.role || ''}
          onValueChange={(v) => onFormChange('role', v as Role)}
          disabled={roleLocked}
          aria-required
          className="grid grid-cols-2 gap-2.5 md:grid-cols-4"
        >
          {ROLE_CHOICES.map(({ role, description }) => {
            const id = `user-role-${role}`
            const disabled = roleLocked || (isSeoDevView && role !== Role.CUSTOMER)
            return (
              <label
                key={role}
                htmlFor={id}
                data-slot="field-label"
                className={cn(
                  'border-border has-data-checked:border-info-strong has-data-checked:bg-info-subtle has-data-checked:inset-ring-info-strong flex min-h-[72px] cursor-pointer flex-col gap-1 rounded-[14px] border bg-white px-3.5 py-3 transition-colors has-data-checked:inset-ring-1 dark:bg-white/5',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <RadioGroupItem
                    id={id}
                    value={role}
                    disabled={disabled}
                    className="size-4 data-checked:border-[5px]"
                  />
                  {getRoleLabel(role)}
                </span>
                <span className="text-text-secondary text-xs leading-snug">{description}</span>
              </label>
            )
          })}
        </RadioGroup>
      </fieldset>

      {currentUser.role === Role.CUSTOMER && (
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <SectionLegend title="ข้อมูลบริษัท" description="ใช้แสดงในรายงานและออกเอกสาร PDF" />
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="customer-company" data-required={!isEditing || undefined}>
                  ชื่อบริษัท
                </Label>
                <Input
                  id="customer-company"
                  name="companyName"
                  value={currentUser.companyName || ''}
                  onChange={handleInputChange}
                  required={!isEditing}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="customer-domain" data-required={!isEditing || undefined}>
                  โดเมน
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="customer-domain"
                    name="domain"
                    value={currentUser.domain || ''}
                    onChange={handleInputChange}
                    placeholder="example.com"
                    required={!isEditing}
                  />
                </InputGroup>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="customer-contactName">ชื่อผู้ติดต่อ</Label>
                <Input
                  id="customer-contactName"
                  name="contactName"
                  value={currentUser.contactName || ''}
                  onChange={handleInputChange}
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="customer-phone">เบอร์โทร</Label>
                <Input
                  id="customer-phone"
                  name="phone"
                  type="tel"
                  value={currentUser.phone || ''}
                  onChange={handleInputChange}
                  placeholder="0X-XXX-XXXX"
                  maxLength={20}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="customer-taxId">เลขผู้เสียภาษี</Label>
                <Input
                  id="customer-taxId"
                  name="taxId"
                  value={currentUser.taxId || ''}
                  onChange={handleInputChange}
                  placeholder="เลข 13 หลัก"
                  inputMode="numeric"
                  maxLength={13}
                />
              </div>

              {!isSeoDevView && (
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="customer-seodev">ผู้ดูแล (SEO Dev)</Label>
                  <Select
                    value={currentUser.seoDevId || NONE_SEO_DEV}
                    onValueChange={(v) => onFormChange('seoDevId', v === NONE_SEO_DEV ? '' : v)}
                  >
                    <SelectTrigger id="customer-seodev" className="w-full">
                      <SelectValue placeholder="-- ไม่กำหนด --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_SEO_DEV}>-- ไม่กำหนด --</SelectItem>
                      {seoDevs.map((dev) => (
                        <SelectItem key={dev.id} value={dev.id}>
                          {dev.name || dev.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="customer-address">ที่อยู่ (สำหรับออกเอกสาร)</Label>
              <Textarea
                id="customer-address"
                name="address"
                value={currentUser.address || ''}
                onChange={handleInputChange}
                rows={2}
                placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              />
            </div>
          </div>
        </fieldset>
      )}
    </div>
  )

  // --- Password fields ------------------------------------------------------
  const passwordFields = !canChangePassword ? (
    <p className="text-text-secondary border-border rounded-[14px] border border-dashed p-4 text-sm">
      คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้ใช้รายนี้ — ติดต่อผู้ดูแลระบบหากต้องการรีเซ็ตรหัสผ่าน
    </p>
  ) : (
    <div className="flex flex-col gap-6">
      {requiresCurrentPassword && (
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="user-current-password" data-required>
            รหัสผ่านปัจจุบัน
          </Label>
          <InputGroup>
            <InputGroupInput
              id="user-current-password"
              name="currentPassword"
              type={showPassword ? 'text' : 'password'}
              value={currentUser.currentPassword || ''}
              onChange={handleInputChange}
              autoComplete="current-password"
              aria-required
            />
            <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
          </InputGroup>
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="user-new-password" data-required>
            รหัสผ่านใหม่
          </Label>
          <InputGroup>
            <InputGroupInput
              id="user-new-password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={currentUser.newPassword || ''}
              onChange={handleInputChange}
              autoComplete="new-password"
              aria-required
              aria-describedby="user-new-password-strength"
            />
            <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
          </InputGroup>
        </div>
        <div id="user-new-password-strength" className="flex flex-col gap-1.5">
          <div aria-hidden className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cn(
                  'h-1.5 rounded-full transition-colors',
                  strengthStyle && step <= strength ? strengthStyle.bar : 'bg-border',
                )}
              />
            ))}
          </div>
          <span className="text-text-secondary text-xs">
            {strengthStyle ? (
              <>
                ความปลอดภัย:{' '}
                <strong className={cn('font-semibold', strengthStyle.text)}>
                  {strengthStyle.label}
                </strong>
                {strength < 4 && ' · ใช้อย่างน้อย 8 ตัวอักษร ผสมตัวพิมพ์ใหญ่ ตัวเลข และสัญลักษณ์'}
              </>
            ) : (
              'ใช้อย่างน้อย 8 ตัวอักษร'
            )}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="user-confirm-password" data-required>
          ยืนยันรหัสผ่านใหม่
        </Label>
        <InputGroup>
          <InputGroupInput
            id="user-confirm-password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={currentUser.confirmPassword || ''}
            onChange={handleInputChange}
            autoComplete="new-password"
            aria-required
            aria-invalid={confirmMismatch || undefined}
            aria-describedby={confirmMismatch ? 'user-confirm-password-error' : undefined}
          />
          <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
        </InputGroup>
        {confirmMismatch && (
          <span
            id="user-confirm-password-error"
            className="text-danger-strong flex items-center gap-1.5 text-xs"
          >
            <CircleAlert aria-hidden className="size-3.5" />
            รหัสผ่านไม่ตรงกับช่องด้านบน
          </span>
        )}
      </div>
    </div>
  )

  const displayName = currentUser.name || currentUser.email || 'ผู้ใช้งาน'
  const editSubtitle = [
    displayName,
    currentUser.name ? currentUser.email : null,
    currentUser.role && getRoleLabel(currentUser.role),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent
        showCloseButton={false}
        size={isEditing ? 'md' : 'lg'}
        className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 max-sm:pb-0"
      >
        <header
          className={cn(
            'flex items-start gap-3.5 px-6 pt-[22px]',
            isEditing ? 'pb-3' : 'pb-[18px]',
          )}
        >
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            {isEditing ? <UserPen className="size-5" /> : <UserPlus className="size-5" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle className="text-xl leading-snug font-semibold">
              {isEditing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary truncate text-[13px]">
              {isEditing
                ? editSubtitle
                : 'สร้างบัญชีและกำหนดบทบาท · ข้อมูลบริษัทจะแสดงเมื่อเลือกบทบาท “ลูกค้า”'}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="outline" size="icon-sm" aria-label="ปิด" className="shrink-0">
              <X aria-hidden />
            </Button>
          </DialogClose>
        </header>

        {isEditing ? (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabValue)}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="px-6">
              <TabsList variant="line" className="w-full justify-start">
                <TabsTrigger value="account">ข้อมูลทั่วไป</TabsTrigger>
                <TabsTrigger value="password">
                  <KeyRound aria-hidden />
                  เปลี่ยนรหัสผ่าน
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="account" className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-6">
              {accountFields}
            </TabsContent>
            <TabsContent value="password" className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-6">
              {passwordFields}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-1 pb-6">{accountFields}</div>
        )}

        <footer className="border-border bg-muted/40 flex flex-col-reverse gap-3 border-t px-6 py-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
          <span className="text-text-secondary text-xs">
            <RequiredMark /> จำเป็นต้องกรอก
          </span>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <Button variant="outline" onClick={handleCloseModal}>
              ยกเลิก
            </Button>

            {tab === 'password' ? (
              <Button
                onClick={onSavePassword}
                disabled={!canChangePassword || passwordSaveDisabled}
              >
                <KeyRound aria-hidden />
                บันทึกรหัสผ่านใหม่
              </Button>
            ) : (
              <Button onClick={onSave}>
                {!isEditing && <UserPlus aria-hidden />}
                {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างผู้ใช้งาน'}
              </Button>
            )}
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
