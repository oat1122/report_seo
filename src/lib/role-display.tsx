import { Role } from '@/types/auth'
import { ShieldUser, Building2, Code, PenLine, User } from 'lucide-react'

export const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return <ShieldUser className="size-4" />
    case Role.CUSTOMER:
      return <Building2 className="size-4" />
    case Role.SEO_DEV:
      return <Code className="size-4" />
    case Role.BLOG_WRITER:
      return <PenLine className="size-4" />
    default:
      return <User className="size-4" />
  }
}

export const getRoleColor = (role: Role): 'error' | 'info' | 'secondary' | 'default' => {
  switch (role) {
    case Role.ADMIN:
      return 'error'
    case Role.CUSTOMER:
      return 'info'
    case Role.SEO_DEV:
      return 'secondary'
    case Role.BLOG_WRITER:
      return 'info'
    default:
      return 'default'
  }
}

export const getRoleBadgeClass = (role: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return 'bg-destructive/10 text-destructive border-destructive/30'
    case Role.CUSTOMER:
      return 'bg-info/10 text-info border-info/30'
    case Role.SEO_DEV:
      return 'bg-secondary/20 text-secondary-foreground dark:text-secondary border-secondary/40'
    case Role.BLOG_WRITER:
      return 'bg-info/10 text-info border-info/30'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export const getRoleLabel = (role: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return 'ผู้ดูแลระบบ'
    case Role.CUSTOMER:
      return 'ลูกค้า'
    case Role.SEO_DEV:
      return 'SEO Developer'
    case Role.BLOG_WRITER:
      return 'Blog Writer'
    default:
      return role
  }
}
