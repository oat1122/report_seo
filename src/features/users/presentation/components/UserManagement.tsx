'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useGetUsers, useGetSeoDevs } from '@/hooks/api/useUsersApi'
import { Role } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { DataTableSkeleton } from '@/components/skeletons'
import { UserTable } from './UserTable'
import { UserModal } from './UserModal'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { useUserModalLogic } from '@/hooks/ui/useUserModalLogic'
import { useUserConfirmDialog } from '@/hooks/ui/useUserConfirmDialog'

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

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">การจัดการผู้ใช้งาน</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
              </p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => handleOpenUserModal()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Plus className="size-4" />
            เพิ่มผู้ใช้งาน
          </Button>
        </div>

        {usersError && (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
          >
            {usersError.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
          </div>
        )}

        {loading ? (
          <DataTableSkeleton rows={8} cols={5} />
        ) : (
          <UserTable
            users={users}
            onEdit={handleOpenUserModal}
            onDelete={handleDeleteUser}
            onRestore={handleRestoreUser}
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
          title={confirmState.title}
          message={confirmState.message}
        />
      </div>
    </DashboardLayout>
  )
}

export default UserManagement
