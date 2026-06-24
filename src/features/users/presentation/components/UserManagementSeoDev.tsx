'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { useGetManagedCustomers } from '@/hooks/api/useUsersApi'
import { UserTable } from './UserTable'

const UserManagementSeoDev: React.FC = () => {
  const {
    data: managedCustomers = [],
    isLoading: loading,
    error: usersError,
  } = useGetManagedCustomers()

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Customer Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">จัดการลูกค้าที่อยู่ในความดูแลของคุณ</p>
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
          <div className="flex min-h-96 items-center justify-center">
            <Loader2 className="text-secondary size-10 animate-spin" />
          </div>
        ) : (
          <UserTable
            users={managedCustomers}
            onEdit={() => {}}
            onDelete={() => {}}
            onRestore={() => {}}
            isSeoDevView
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default UserManagementSeoDev
