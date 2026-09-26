'use client'

import React, { useDeferredValue, useMemo, useState } from 'react'
import { AlertCircle, ArchiveRestore, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useGetUsers, useGetSeoDevs } from '@/hooks/api/useUsersApi'
import { Role } from '@/types/auth'
import { getRoleLabel } from '@/lib/role-display'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { DataTableSkeleton } from '@/components/skeletons'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { useUserModalLogic } from '@/hooks/ui/useUserModalLogic'
import { useUserConfirmDialog } from '@/hooks/ui/useUserConfirmDialog'
import { UserTable } from './UserTable'
import { UserModal } from './UserModal'
import { UserListToolbar, type RoleFilterValue } from './UserListToolbar'
import { matchesUserSearch } from './user-filters'

const ROLE_ORDER: Role[] = [Role.CUSTOMER, Role.SEO_DEV, Role.ADMIN, Role.BLOG_WRITER]

const UserManagement: React.FC = () => {
  const { data: session } = useSession()

  const { data: users = [], isLoading: loading, error: usersError } = useGetUsers(true)
  const { data: seoDevs = [] } = useGetSeoDevs()

  const {
    isModalOpen,
    isEditing,
    currentUser,
    handleOpenUserModal,
    handleCloseUserModal,
    handleSaveUser,
    handlePasswordUpdate,
    handleFormChange,
  } = useUserModalLogic()

  const {
    confirmState,
    handleDeleteUser,
    handleRestoreUser,
    handleConfirmAction,
    handleCloseConfirm,
  } = useUserConfirmDialog()

  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>('ALL')
  const [showDeleted, setShowDeleted] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const visibleUsers = useMemo(
    () => (showDeleted ? users : users.filter((u) => !u.deletedAt)),
    [users, showDeleted],
  )

  const roleOptions = useMemo(
    () => [
      { value: 'ALL' as const, label: 'ทั้งหมด', count: visibleUsers.length },
      ...ROLE_ORDER.map((role) => ({
        value: role,
        label: getRoleLabel(role),
        count: visibleUsers.filter((u) => u.role === role).length,
      })),
    ],
    [visibleUsers],
  )

  const filteredUsers = useMemo(
    () =>
      visibleUsers.filter(
        (u) =>
          (roleFilter === 'ALL' || u.role === roleFilter) && matchesUserSearch(u, deferredSearch),
      ),
    [visibleUsers, roleFilter, deferredSearch],
  )

  // จำนวนลูกค้าที่ SEO Dev แต่ละคนดูแล — นับจาก customerProfile.seoDevId ของลูกค้าที่ยังไม่ถูกลบ
  const managedCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const u of users) {
      const devId = u.customerProfile?.seoDevId
      if (u.role === Role.CUSTOMER && devId && !u.deletedAt)
        counts[devId] = (counts[devId] ?? 0) + 1
    }
    return counts
  }, [users])

  const confirmTarget = users.find((u) => u.id === confirmState.targetId)
  const targetLabel = confirmTarget ? confirmTarget.name || confirmTarget.email : 'ผู้ใช้งานนี้'
  const targetMeta = confirmTarget
    ? `${confirmTarget.email} · ${getRoleLabel(confirmTarget.role)}`
    : confirmState.message
  const isRestore = confirmState.actionType === 'restore'

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">
              การจัดการผู้ใช้งาน
            </h1>
            <p className="text-text-secondary max-w-[70ch] text-[13px] md:text-sm">
              จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ · ลูกค้าเปิด workspace เพื่อดู Domain, Work
              Progress, บทความ และการชำระเงินในที่เดียว
            </p>
          </div>
          <Button variant="brand" onClick={() => handleOpenUserModal()} className="shrink-0">
            <Plus aria-hidden />
            เพิ่มผู้ใช้งาน
          </Button>
        </header>

        <UserListToolbar
          roleOptions={roleOptions}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          search={search}
          onSearchChange={setSearch}
          extra={
            <div className="flex min-h-11 items-center gap-3">
              <Switch
                id="users-show-deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <label htmlFor="users-show-deleted" className="cursor-pointer text-sm font-medium">
                แสดงที่ลบแล้ว
              </label>
            </div>
          }
        />

        {usersError && (
          <div
            role="alert"
            className="bg-danger-subtle text-danger-strong flex items-start gap-2 rounded-[16px] px-4 py-3 text-sm"
          >
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              {usersError.message || 'โหลดรายชื่อผู้ใช้งานไม่สำเร็จ'} — ลองรีเฟรชหน้าอีกครั้ง
            </span>
          </div>
        )}

        {loading ? (
          <DataTableSkeleton rows={8} cols={5} />
        ) : (
          <UserTable
            key={`${roleFilter}|${showDeleted}|${deferredSearch}`}
            users={filteredUsers}
            onEdit={handleOpenUserModal}
            onDelete={handleDeleteUser}
            onRestore={handleRestoreUser}
            managedCounts={managedCounts}
          />
        )}

        {isModalOpen && currentUser && (
          <UserModal
            open={isModalOpen}
            isEditing={isEditing}
            currentUser={currentUser}
            onClose={handleCloseUserModal}
            onSave={() => handleSaveUser(session?.user as { id: string; role: Role })}
            onSavePassword={handlePasswordUpdate}
            onFormChange={handleFormChange}
            seoDevs={seoDevs}
          />
        )}

        <ConfirmAlert
          open={confirmState.isOpen}
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmAction}
          title={isRestore ? `กู้คืน ${targetLabel}?` : `ลบผู้ใช้งาน ${targetLabel}?`}
          message={targetMeta}
          tone={isRestore ? 'default' : 'destructive'}
          icon={isRestore ? <ArchiveRestore /> : undefined}
          confirmLabel={isRestore ? 'กู้คืนผู้ใช้งาน' : 'ลบผู้ใช้งาน'}
          consequences={
            isRestore
              ? [
                  { tone: 'safe', text: 'ผู้ใช้กลับมาเข้าสู่ระบบได้อีกครั้ง' },
                  { tone: 'safe', text: 'ข้อมูลเดิมของบัญชีนี้ยังอยู่ครบ' },
                ]
              : [
                  { tone: 'danger', text: 'ผู้ใช้จะเข้าสู่ระบบไม่ได้ทันที' },
                  { tone: 'safe', text: 'รายงาน แผนงาน และเอกสารยังเก็บไว้ครบ' },
                  { tone: 'safe', text: 'กู้คืนได้จากตัวกรอง “แสดงที่ลบแล้ว”' },
                ]
          }
        />
      </div>
    </DashboardLayout>
  )
}

export default UserManagement
