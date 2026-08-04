import { Role } from '@/types/auth'
import type { Customer } from './Customer'

export interface SessionUser {
  id: string
  role: Role
}

export class CustomerAccessContext {
  constructor(
    public readonly user: SessionUser,
    public readonly customer: Customer,
  ) {}

  get isAdmin(): boolean {
    return this.user.role === Role.ADMIN
  }

  get isOwner(): boolean {
    return this.user.id === this.customer.userId
  }

  get isAssignedSeoDev(): boolean {
    return this.user.role === Role.SEO_DEV && this.customer.seoDevId === this.user.id
  }

  get isAssignedBlogWriter(): boolean {
    return this.user.role === Role.BLOG_WRITER && this.customer.blogWriterId === this.user.id
  }

  get canRead(): boolean {
    return this.isAdmin || this.isOwner || this.isAssignedSeoDev
  }

  get canManage(): boolean {
    return this.isAdmin || this.isAssignedSeoDev
  }

  /**
   * แยกจาก canRead/canManage โดยตั้งใจ — blog writer ต้องเห็นแค่ blog plan + keyword
   * ของลูกค้าที่ถูก assign ห้ามหลุดไปอ่าน/แก้ metrics, payment, work progress
   */
  get canReadBlogPlan(): boolean {
    return this.canRead || this.isAssignedBlogWriter
  }

  get canManageBlogPlan(): boolean {
    return this.isAdmin || this.isAssignedBlogWriter
  }

  /** ให้ความเห็น/อนุมัติบทความ = สิทธิ์ของฝั่งลูกค้า (admin ทำแทนได้) */
  get canRespondToBlogPlan(): boolean {
    return this.isAdmin || this.isOwner
  }
}
