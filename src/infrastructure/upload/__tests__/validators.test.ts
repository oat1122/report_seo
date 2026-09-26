import { describe, expect, it } from 'vitest'
import { sanitizeFilename } from '../validators'
import { displayFilename } from '@/lib/filename'

const SUFFIX = /_\d{13}_[0-9a-f]{8}/

describe('sanitizeFilename', () => {
  it('เก็บอักษรไทยไว้ ไม่แปลงเป็นขีดล่างทั้งแถบ', () => {
    const result = sanitizeFilename('รับผลิตถังไซโลสำหรับโรงงานอุตสาหกรรม เลือกอย่างไรให้เหมาะ.docx')

    expect(result).toMatch(/^รับผลิตถังไซโลสำหรับโรงงานอุตสาหกรรม_เลือกอย่างไรให้เหมาะ/)
    expect(result).toMatch(SUFFIX)
    expect(result.endsWith('.docx')).toBe(true)
  })

  it('กัน path traversal และ separator', () => {
    const result = sanitizeFilename('../../etc/passwd.pdf')

    expect(result).not.toContain('..')
    expect(result).not.toContain('/')
    expect(result).not.toContain('\\')
  })

  it('ตัด control/format char ที่ใช้ปลอมนามสกุล (RTL override)', () => {
    const result = sanitizeFilename('invoice‮gnp.exe')

    expect(result).not.toContain('‮')
    expect(result.endsWith('.exe')).toBe(true)
  })

  it('ไม่ยาวเกิน limit ของ filesystem แม้ชื่อไทยยาว (3 ไบต์/ตัว)', () => {
    const result = sanitizeFilename(`${'ก'.repeat(300)}.pdf`)

    expect(Buffer.byteLength(result, 'utf8')).toBeLessThanOrEqual(255)
    expect(result.endsWith('.pdf')).toBe(true)
  })

  it('ชื่อไม่มีนามสกุลยังได้ suffix และไม่มีจุดค้าง', () => {
    const result = sanitizeFilename('เอกสาร')

    expect(result).toMatch(/^เอกสาร_\d{13}_[0-9a-f]{8}$/)
  })

  it('ตัดจุดนำหน้าเพื่อไม่ให้กลายเป็น hidden file', () => {
    expect(sanitizeFilename('.env')).not.toMatch(/^\./)
  })
})

describe('displayFilename', () => {
  it('ตัด suffix ที่ sanitizeFilename ใส่ไว้ออกครบ (round-trip)', () => {
    const original = 'รับผลิตถังไซโล.docx'

    expect(displayFilename(sanitizeFilename(original))).toBe(original)
  })

  it('idempotent และไม่แตะชื่อเก่าที่ไม่มี suffix', () => {
    const clean = 'รายงานประจำเดือน.pdf'

    expect(displayFilename(clean)).toBe(clean)
    expect(displayFilename(displayFilename(sanitizeFilename(clean)))).toBe(clean)
  })
})
