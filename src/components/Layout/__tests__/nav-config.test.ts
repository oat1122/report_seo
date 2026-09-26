import { describe, expect, it } from 'vitest'
import { Role } from '@/types/auth'
import { findActiveHref, getShellConfig, roleFromPath } from '../nav-config'

describe('nav-config', () => {
  const admin = getShellConfig(Role.ADMIN, 'a1').groups
  const customer = getShellConfig(Role.CUSTOMER, 'c1').groups

  it('เลือกเมนูที่ path ยาวสุด ไม่ให้ /admin ทับ /admin/users', () => {
    expect(findActiveHref(admin, '/admin', null)).toBe('/admin')
    expect(findActiveHref(admin, '/admin/users', null)).toBe('/admin/users')
    expect(findActiveHref(admin, '/admin/settings/work-progress/templates/x', null)).toBe(
      '/admin/settings/work-progress',
    )
    expect(findActiveHref(admin, '/admin/customers/u1/domain', null)).toBe('/admin')
  })

  it('หน้า report ใช้ ?tab= (ไม่มี = overview) ทั้ง /customer/report และ /customer/[id]/report', () => {
    expect(findActiveHref(customer, '/customer/report', null)).toBe('/customer/report?tab=overview')
    expect(findActiveHref(customer, '/customer/report', 'ai')).toBe('/customer/report?tab=ai')
    expect(findActiveHref(customer, '/customer/c1/report', 'health')).toBe(
      '/customer/report?tab=health',
    )
    expect(findActiveHref(customer, '/customer/c1/blog-plan', null)).toBe('/customer/c1/blog-plan')
  })

  it('เดา role จาก path ระหว่างรอ session', () => {
    expect(roleFromPath('/admin/users')).toBe(Role.ADMIN)
    expect(roleFromPath('/seo')).toBe(Role.SEO_DEV)
    expect(roleFromPath('/login')).toBeUndefined()
  })
})
