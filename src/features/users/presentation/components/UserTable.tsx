'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { User } from '@/types/user'
import { Role } from '@/types/auth'
import { getRoleLabel } from '@/lib/role-display'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTable, DataTableColumn } from '@/components/shared/DataTable'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isSeoDevView?: boolean
  /** จำนวนลูกค้าที่ SEO Dev แต่ละคนดูแล (key = user id) — แสดงใต้ชื่อ */
  managedCounts?: Record<string, number>
  /** คำนามที่ใช้ในแถบแบ่งหน้า เช่น "ผู้ใช้งาน" / "ลูกค้า" */
  itemNoun?: string
}

// วันที่ ค.ศ. แบบสั้น เช่น "28 ก.ย. 2026"
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH-u-ca-gregory', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

const ROLE_BADGE: Record<
  Role,
  { variant: React.ComponentProps<typeof Badge>['variant']; className?: string }
> = {
  [Role.ADMIN]: { variant: 'default' },
  [Role.CUSTOMER]: { variant: 'info' },
  [Role.SEO_DEV]: { variant: 'secondary', className: 'bg-secondary/25 text-foreground' },
  [Role.BLOG_WRITER]: { variant: 'warning' },
}

const AVATAR_TONE: Record<Role, string> = {
  [Role.ADMIN]: 'bg-muted',
  [Role.CUSTOMER]: 'bg-info-subtle',
  [Role.SEO_DEV]: 'bg-secondary/25',
  [Role.BLOG_WRITER]: 'bg-warning-subtle',
}

function RoleBadge({ role }: { role: Role }) {
  const style = ROLE_BADGE[role] ?? { variant: 'neutral' as const }
  return (
    <Badge variant={style.variant} className={style.className}>
      {getRoleLabel(role)}
    </Badge>
  )
}

const IconAction = ({
  label,
  onClick,
  href,
  newTab = false,
  className,
  children,
}: {
  label: string
  onClick?: () => void
  href?: string
  newTab?: boolean
  className?: string
  children: React.ReactNode
}) => {
  const buttonProps = {
    variant: 'outline' as const,
    size: 'icon-sm' as const,
    'aria-label': label,
    className: cn('max-xl:size-11', className),
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Button {...buttonProps} asChild>
            <Link href={href} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
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
  isSeoDevView = false,
  managedCounts,
  itemNoun = 'ผู้ใช้งาน',
}) => {
  const { data: session } = useSession()
  const canViewReport = session?.user?.role === Role.ADMIN || session?.user?.role === Role.SEO_DEV
  const workspaceBase = session?.user?.role === Role.ADMIN ? '/admin' : '/seo'

  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageRows = users.slice(start, start + PAGE_SIZE)

  const workspaceHref = (user: User) => `${workspaceBase}/customers/${user.id}/domain`

  const subtitleOf = (user: User): string | null => {
    if (user.role === Role.CUSTOMER) return user.customerProfile?.domain || null
    if (user.role === Role.SEO_DEV && managedCounts) {
      return `ดูแล ${(managedCounts[user.id] ?? 0).toLocaleString('th-TH')} ราย`
    }
    return null
  }

  const renderIdentity = (user: User) => {
    const name = user.name || user.email
    const subtitle = subtitleOf(user)
    const isCustomerLink = user.role === Role.CUSTOMER && !user.deletedAt
    return (
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white text-sm font-semibold dark:border-white/20',
            AVATAR_TONE[user.role] ?? 'bg-muted',
          )}
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col gap-px">
          {isCustomerLink ? (
            <Link
              href={workspaceHref(user)}
              className="hover:text-info-strong truncate text-sm font-medium underline-offset-4 hover:underline"
            >
              {user.name || '-'}
            </Link>
          ) : (
            <span className="truncate text-sm font-medium">{user.name || '-'}</span>
          )}
          {subtitle && <span className="text-text-secondary truncate text-xs">{subtitle}</span>}
        </div>
      </div>
    )
  }

  const renderActions = (user: User, layout: 'row' | 'card') => {
    if (user.deletedAt) {
      if (isSeoDevView) return null
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRestore(user.id)}
          className={cn(layout === 'card' && 'h-11 w-full')}
        >
          <ArchiveRestore aria-hidden />
          กู้คืน
        </Button>
      )
    }

    const isCustomer = user.role === Role.CUSTOMER
    return (
      <div
        className={cn(
          'flex gap-1.5',
          layout === 'row' ? 'justify-end' : 'flex-wrap items-center justify-end',
        )}
      >
        {isCustomer && (
          <Button
            variant="soft"
            size="sm"
            asChild
            className={cn(layout === 'card' && 'h-11 flex-1')}
          >
            <Link href={workspaceHref(user)}>
              <LayoutGrid aria-hidden />
              เปิด workspace
            </Link>
          </Button>
        )}
        {isCustomer && canViewReport && (
          <IconAction label="ดูรายงานของลูกค้า" href={`/customer/${user.id}/report`} newTab>
            <ExternalLink aria-hidden className="size-4" />
          </IconAction>
        )}
        {!isSeoDevView && (
          <>
            <IconAction label={`แก้ไข ${user.name || user.email}`} onClick={() => onEdit(user)}>
              <Pencil aria-hidden className="size-4" />
            </IconAction>
            <IconAction
              label={`ลบ ${user.name || user.email}`}
              onClick={() => onDelete(user.id)}
              className="text-danger-strong hover:bg-danger-subtle hover:text-danger-strong"
            >
              <Trash2 aria-hidden className="size-4" />
            </IconAction>
          </>
        )}
      </div>
    )
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'ชื่อผู้ใช้',
      cell: (user) => renderIdentity(user),
    },
    {
      key: 'email',
      header: 'อีเมล',
      headerClassName: 'w-[22%]',
      cell: (user) => (
        <span className="text-text-secondary block truncate text-[13px]">{user.email}</span>
      ),
    },
    {
      key: 'role',
      header: 'บทบาท',
      headerClassName: 'w-[150px]',
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          <RoleBadge role={user.role} />
          {user.deletedAt && <Badge variant="danger">ลบแล้ว</Badge>}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'วันที่สร้าง',
      headerClassName: 'w-[120px]',
      cell: (user) => (
        <span className="text-text-secondary text-[13px] tabular-nums">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'จัดการ',
      align: 'right',
      headerClassName: isSeoDevView ? 'w-[200px]' : 'w-[290px]',
      cell: (user) => renderActions(user, 'row'),
    },
  ]

  return (
    <section
      aria-label={`รายชื่อ${itemNoun}`}
      className="border-glass-border bg-glass-card shadow-card rounded-[20px] border p-2 backdrop-blur-[14px]"
    >
      {/* จอกว้าง (xl+): ตาราง */}
      <div className="hidden xl:block">
        <DataTable
          className="min-w-[840px] table-fixed"
          columns={columns}
          rows={pageRows}
          getRowKey={(user) => user.id}
          emptyState={`ไม่พบ${itemNoun}ที่ตรงกับตัวกรอง`}
          rowClassName={(user) => (user.deletedAt ? 'opacity-60' : undefined)}
        />
      </div>

      {/* ต่ำกว่า xl: การ์ด (มือถือ 1 คอลัมน์ · แท็บเล็ต 2 คอลัมน์) */}
      <ul className="grid gap-2 md:grid-cols-2 xl:hidden">
        {pageRows.length === 0 && (
          <li className="text-text-secondary px-4 py-8 text-center text-sm md:col-span-2">
            ไม่พบ{itemNoun}ที่ตรงกับตัวกรอง
          </li>
        )}
        {pageRows.map((user) => (
          <li
            key={user.id}
            className={cn(
              'bg-glass-tile flex flex-col gap-3 rounded-[16px] p-3.5',
              user.deletedAt && 'opacity-60',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              {renderIdentity(user)}
              <div className="flex shrink-0 flex-col items-end gap-1">
                <RoleBadge role={user.role} />
                {user.deletedAt && <Badge variant="danger">ลบแล้ว</Badge>}
              </div>
            </div>
            <dl className="text-text-secondary grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-[13px]">
              <dt>อีเมล</dt>
              <dd className="text-foreground truncate">{user.email}</dd>
              <dt>วันที่สร้าง</dt>
              <dd className="text-foreground tabular-nums">{formatDate(user.createdAt)}</dd>
            </dl>
            {renderActions(user, 'card')}
          </li>
        ))}
      </ul>

      {users.length > 0 && (
        <nav
          aria-label="แบ่งหน้า"
          className="flex items-center justify-between gap-3 px-3.5 pt-3 pb-1"
        >
          <span className="text-text-secondary text-xs tabular-nums">
            แสดง {(start + 1).toLocaleString('th-TH')}–
            {Math.min(start + PAGE_SIZE, users.length).toLocaleString('th-TH')} จาก{' '}
            {users.length.toLocaleString('th-TH')} {itemNoun}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="หน้าก่อน"
              className="max-md:size-11"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <span className="text-text-secondary min-w-14 text-center text-xs tabular-nums">
              {currentPage} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="หน้าถัดไป"
              className="max-md:size-11"
              disabled={currentPage >= pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </nav>
      )}
    </section>
  )
}
