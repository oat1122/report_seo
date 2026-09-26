import type { User } from '@/types/user'

/** ค้นจากชื่อ อีเมล และ domain ของลูกค้า (ไม่สนตัวพิมพ์เล็ก/ใหญ่) */
export function matchesUserSearch(user: User, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [user.name ?? '', user.email, user.customerProfile?.domain ?? ''].some((v) =>
    v.toLowerCase().includes(q),
  )
}
