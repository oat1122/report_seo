'use client'

import React, { useEffect, useState } from 'react'
import { Building2, Eye, EyeOff, KeyRound, UserRound } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from 'next-auth/react'
import { Role } from '@/types/auth'
import { User, UserFormState } from '@/types/user'
import { getRoleLabel } from '@/lib/role-display'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  const passwordSaveDisabled =
    !currentUser.newPassword ||
    !currentUser.confirmPassword ||
    (requiresCurrentPassword && !currentUser.currentPassword)

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
    <FieldGroup>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <Label htmlFor="user-name">ชื่อผู้ใช้</Label>
          <Input
            id="user-name"
            name="name"
            value={currentUser.name || ''}
            onChange={handleInputChange}
            placeholder="ชื่อที่แสดงในระบบ"
          />
        </Field>

        <Field>
          <Label htmlFor="user-email">อีเมล</Label>
          <Input
            id="user-email"
            name="email"
            type="email"
            value={currentUser.email || ''}
            onChange={handleInputChange}
            placeholder="name@example.com"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {!isEditing && (
          <Field>
            <Label htmlFor="user-password">รหัสผ่านเริ่มต้น</Label>
            <InputGroup>
              <InputGroupInput
                id="user-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                onChange={handleInputChange}
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
              <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
            </InputGroup>
          </Field>
        )}

        <Field>
          <Label htmlFor="user-role">บทบาท</Label>
          <Select
            value={currentUser.role || ''}
            onValueChange={(v) => onFormChange('role', v as Role)}
            disabled={isSeoDevView && !canEditRole}
          >
            <SelectTrigger id="user-role" className="w-full">
              <SelectValue placeholder="เลือกบทบาท" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Role).map((role) => (
                <SelectItem
                  key={role}
                  value={role}
                  disabled={isSeoDevView && role !== Role.CUSTOMER}
                >
                  {getRoleLabel(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {currentUser.role === Role.CUSTOMER && (
        <div className="bg-muted/40 rounded-xl border p-4">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="text-muted-foreground size-4" />
            <p className="text-sm font-semibold">ข้อมูลบริษัท</p>
          </div>

          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <Label htmlFor="customer-company">ชื่อบริษัท</Label>
                <Input
                  id="customer-company"
                  name="companyName"
                  value={currentUser.companyName || ''}
                  onChange={handleInputChange}
                  required={!isEditing}
                />
              </Field>

              <Field>
                <Label htmlFor="customer-domain">โดเมน</Label>
                <Input
                  id="customer-domain"
                  name="domain"
                  value={currentUser.domain || ''}
                  onChange={handleInputChange}
                  placeholder="example.com"
                  required={!isEditing}
                />
              </Field>

              <Field>
                <Label htmlFor="customer-contactName">ชื่อผู้ติดต่อ</Label>
                <Input
                  id="customer-contactName"
                  name="contactName"
                  value={currentUser.contactName || ''}
                  onChange={handleInputChange}
                  placeholder="ชื่อ-นามสกุล"
                />
              </Field>

              <Field>
                <Label htmlFor="customer-phone">เบอร์โทร</Label>
                <Input
                  id="customer-phone"
                  name="phone"
                  value={currentUser.phone || ''}
                  onChange={handleInputChange}
                  placeholder="เบอร์ติดต่อ"
                  maxLength={20}
                />
              </Field>

              <Field>
                <Label htmlFor="customer-taxId">เลขผู้เสียภาษี</Label>
                <Input
                  id="customer-taxId"
                  name="taxId"
                  value={currentUser.taxId || ''}
                  onChange={handleInputChange}
                  placeholder="0000000000000"
                  maxLength={13}
                />
              </Field>

              {!isSeoDevView && (
                <Field>
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
                </Field>
              )}
            </div>

            <Field>
              <Label htmlFor="customer-address">ที่อยู่ (สำหรับออกเอกสาร)</Label>
              <Textarea
                id="customer-address"
                name="address"
                value={currentUser.address || ''}
                onChange={handleInputChange}
                rows={2}
                placeholder="ที่อยู่สำหรับออกใบแจ้งหนี้ / ใบเสร็จ"
              />
            </Field>
          </FieldGroup>
        </div>
      )}
    </FieldGroup>
  )

  // --- Password fields ------------------------------------------------------
  const passwordFields = (
    <FieldGroup>
      {!canChangePassword && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
          คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้ใช้รายนี้
        </p>
      )}

      {canChangePassword && (
        <>
          {requiresCurrentPassword && (
            <Field>
              <Label htmlFor="user-current-password">รหัสผ่านปัจจุบัน</Label>
              <InputGroup>
                <InputGroupInput
                  id="user-current-password"
                  name="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={currentUser.currentPassword || ''}
                  onChange={handleInputChange}
                />
                <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
              </InputGroup>
            </Field>
          )}

          <Field>
            <Label htmlFor="user-new-password">รหัสผ่านใหม่</Label>
            <InputGroup>
              <InputGroupInput
                id="user-new-password"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={currentUser.newPassword || ''}
                onChange={handleInputChange}
              />
              <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
            </InputGroup>
            <FieldDescription>ใช้อย่างน้อย 8 ตัวอักษร</FieldDescription>
          </Field>

          <Field>
            <Label htmlFor="user-confirm-password">ยืนยันรหัสผ่านใหม่</Label>
            <InputGroup>
              <InputGroupInput
                id="user-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={currentUser.confirmPassword || ''}
                onChange={handleInputChange}
              />
              <InputGroupAddon align="inline-end">{toggleVisibility}</InputGroupAddon>
            </InputGroup>
          </Field>
        </>
      )}
    </FieldGroup>
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[min(94vw,620px)]">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg">
            {isEditing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'จัดการข้อมูลและการเข้าถึงของผู้ใช้รายนี้'
              : 'กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่'}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="gap-0">
            <div className="px-5 pt-4">
              <TabsList variant="line" className="w-full">
                <TabsTrigger value="account">
                  <UserRound />
                  ข้อมูลทั่วไป
                </TabsTrigger>
                <TabsTrigger value="password">
                  <KeyRound />
                  เปลี่ยนรหัสผ่าน
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="account" className="p-5">
              {accountFields}
            </TabsContent>
            <TabsContent value="password" className="p-5">
              {passwordFields}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-5">{accountFields}</div>
        )}

        <DialogFooter className="mx-0 mb-0 mt-0">
          <Button variant="outline" size="lg" onClick={handleCloseModal}>
            ยกเลิก
          </Button>

          {tab === 'password' ? (
            <Button
              size="lg"
              onClick={onSavePassword}
              disabled={!canChangePassword || passwordSaveDisabled}
              className="bg-info text-info-foreground hover:bg-info/90"
            >
              บันทึกรหัสผ่านใหม่
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onSave}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างผู้ใช้งาน'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
