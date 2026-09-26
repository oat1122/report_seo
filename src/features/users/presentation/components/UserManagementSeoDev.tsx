'use client'

import React, { useDeferredValue, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { DataTableSkeleton } from '@/components/skeletons'
import { useGetManagedCustomers } from '@/hooks/api/useUsersApi'
import { UserTable } from './UserTable'
import { UserListToolbar } from './UserListToolbar'
import { matchesUserSearch } from './user-filters'

const UserManagementSeoDev: React.FC = () => {
  const {
    data: managedCustomers = [],
    isLoading: loading,
    error: usersError,
  } = useGetManagedCustomers()

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const filtered = useMemo(
    () => managedCustomers.filter((u) => matchesUserSearch(u, deferredSearch)),
    [managedCustomers, deferredSearch],
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">ลูกค้าที่ดูแล</h1>
          <p className="text-text-secondary text-[13px] md:text-sm">
            จัดการลูกค้าที่อยู่ในความดูแลของคุณ · เปิด workspace เพื่อดู Domain และ Work Progress
          </p>
        </header>

        <UserListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="ค้นหาชื่อลูกค้า อีเมล หรือ domain..."
        />

        {usersError && (
          <div
            role="alert"
            className="bg-danger-subtle text-danger-strong flex items-start gap-2 rounded-[16px] px-4 py-3 text-sm"
          >
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              {usersError.message || 'โหลดรายชื่อลูกค้าไม่สำเร็จ'} — ลองรีเฟรชหน้าอีกครั้ง
            </span>
          </div>
        )}

        {loading ? (
          <DataTableSkeleton rows={8} cols={5} />
        ) : (
          <UserTable
            key={deferredSearch}
            users={filtered}
            onEdit={() => {}}
            onDelete={() => {}}
            onRestore={() => {}}
            isSeoDevView
            itemNoun="ลูกค้า"
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default UserManagementSeoDev
