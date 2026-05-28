'use client'

import React from 'react'
import Link from 'next/link'
import {
  Pencil,
  Trash2,
  BarChart3,
  ArchiveRestore,
  ClipboardList,
  Eye,
  CreditCard,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { User } from '@/types/user'
import { Role } from '@/types/auth'
import { getRoleIcon, getRoleLabel, getRoleBadgeClass } from '@/lib/role-display'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTable, DataTableColumn } from '@/components/shared/DataTable'
import { cn } from '@/lib/utils'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onOpenMetrics: (user: User) => void
  isSeoDevView?: boolean
}

const formatThaiDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

const ActionTooltipButton = ({
  label,
  onClick,
  href,
  className,
  children,
}: {
  label: string
  onClick?: () => void
  href?: string
  className?: string
  children: React.ReactNode
}) => {
  const buttonProps = {
    variant: 'ghost' as const,
    size: 'icon-sm' as const,
    className: cn('hover:bg-muted', className),
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Button {...buttonProps} asChild>
            <Link href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          </Button>
        ) : (
          <Button {...buttonProps} onClick={onClick}>
            {children}
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onRestore,
  onOpenMetrics,
  isSeoDevView = false,
}) => {
  const { data: session } = useSession()
  const canViewReport = session?.user?.role === Role.ADMIN || session?.user?.role === Role.SEO_DEV
  const workProgressBase = session?.user?.role === Role.ADMIN ? '/admin' : '/seo'

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'ชื่อผู้ใช้',
      cell: (user) => <span className="font-semibold">{user.name || '-'}</span>,
    },
    {
      key: 'email',
      header: 'อีเมล',
      cell: (user) => <span className="text-muted-foreground text-sm">{user.email}</span>,
    },
    {
      key: 'role',
      header: 'บทบาท',
      cell: (user) => (
        <Badge className={cn('gap-1 rounded-md font-semibold', getRoleBadgeClass(user.role))}>
          {getRoleIcon(user.role)}
          {getRoleLabel(user.role)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'วันที่สร้าง',
      cell: (user) => (
        <span className="text-muted-foreground text-sm">{formatThaiDate(user.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'จัดการ',
      align: 'center',
      cell: (user) => {
        const isDeleted = !!user.deletedAt
        if (isDeleted) {
          if (isSeoDevView) return null
          return (
            <ActionTooltipButton
              label="กู้คืน"
              onClick={() => onRestore(user.id)}
              className="text-success hover:bg-success/10"
            >
              <ArchiveRestore className="size-4" />
            </ActionTooltipButton>
          )
        }
        return (
          <div className="flex justify-center gap-1">
            {user.role === Role.CUSTOMER && canViewReport && (
              <ActionTooltipButton
                label="ดูรายงานของลูกค้า"
                href={`/customer/${user.id}/report`}
                className="text-secondary hover:bg-secondary/10"
              >
                <Eye className="size-4" />
              </ActionTooltipButton>
            )}
            {user.role === Role.CUSTOMER && canViewReport && (
              <ActionTooltipButton
                label="Work Progress"
                href={`${workProgressBase}/customers/${user.id}/work-progress`}
                className="text-info hover:bg-info/10"
              >
                <ClipboardList className="size-4" />
              </ActionTooltipButton>
            )}
            {user.role === Role.CUSTOMER && (
              <ActionTooltipButton
                label="จัดการข้อมูล Domain"
                onClick={() => onOpenMetrics(user)}
                className="text-info hover:bg-info/10"
              >
                <BarChart3 className="size-4" />
              </ActionTooltipButton>
            )}
            {user.role === Role.CUSTOMER && !isSeoDevView && (
              <ActionTooltipButton
                label="จัดการการชำระเงิน"
                href={`/admin/customers/${user.id}/payments`}
                className="text-info hover:bg-info/10"
              >
                <CreditCard className="size-4" />
              </ActionTooltipButton>
            )}
            {!isSeoDevView && (
              <>
                <ActionTooltipButton
                  label="แก้ไข"
                  onClick={() => onEdit(user)}
                  className="text-info hover:bg-info/10"
                >
                  <Pencil className="size-4" />
                </ActionTooltipButton>
                <ActionTooltipButton
                  label="ลบ"
                  onClick={() => onDelete(user.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </ActionTooltipButton>
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="border-border overflow-hidden rounded-2xl border">
      <DataTable
        columns={columns}
        rows={users}
        getRowKey={(user) => user.id}
        emptyState="ไม่พบข้อมูลผู้ใช้งาน"
        rowClassName={(user) => (user.deletedAt ? 'opacity-50' : undefined)}
      />
    </div>
  )
}
