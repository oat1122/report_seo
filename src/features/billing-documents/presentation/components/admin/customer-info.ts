import type { UpdateCustomerInfoInput } from '../../../schemas'

// ค่าฟอร์มข้อมูลลูกค้าบนเอกสาร — ทุก field เป็น string เพื่อผูกกับ input โดยตรง
export interface CustomerInfoValue {
  name: string
  address: string
  taxId: string
  contactName: string
  phone: string
}

// snapshot ของลูกค้าในระบบ (DB) ใช้เทียบว่าข้อมูลในฟอร์มต่างจากใน DB ไหม
export interface DbCustomerSnapshot {
  id: string
  name: string
  address: string | null
  taxId: string | null
  contactName: string | null
  phone: string | null
}

export const emptyCustomerInfo: CustomerInfoValue = {
  name: '',
  address: '',
  taxId: '',
  contactName: '',
  phone: '',
}

export function customerInfoFromSnapshot(snapshot: DbCustomerSnapshot): CustomerInfoValue {
  return {
    name: snapshot.name,
    address: snapshot.address ?? '',
    taxId: snapshot.taxId ?? '',
    contactName: snapshot.contactName ?? '',
    phone: snapshot.phone ?? '',
  }
}

// trim + แปลงค่าว่างเป็น null สำหรับส่งเข้า API / เทียบกับ DB
export function toCustomerInfoInput(value: CustomerInfoValue): UpdateCustomerInfoInput {
  const normalize = (raw: string): string | null => {
    const trimmed = raw.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return {
    name: value.name.trim(),
    address: normalize(value.address),
    taxId: normalize(value.taxId),
    contactName: normalize(value.contactName),
    phone: normalize(value.phone),
  }
}

export function hasCustomerInfoDiff(value: CustomerInfoValue, snapshot: DbCustomerSnapshot): boolean {
  const input = toCustomerInfoInput(value)
  return (
    input.name !== snapshot.name ||
    (input.address ?? null) !== (snapshot.address ?? null) ||
    (input.taxId ?? null) !== (snapshot.taxId ?? null) ||
    (input.contactName ?? null) !== (snapshot.contactName ?? null) ||
    (input.phone ?? null) !== (snapshot.phone ?? null)
  )
}
