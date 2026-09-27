import { describe, expect, it } from 'vitest'
import { updateCategorySchema, updateMarkTypeSchema, updateStatusSchema, upsertStatusSchema } from '../master'
import { addTemplateItemSchema, listTemplatesQuerySchema, updateTemplateItemSchema } from '../template'
import { listPlansQuerySchema } from '../plan'

// zod v4: .partial() ยังเติม default ของ field ข้างใน — PATCH ต้องไม่ทับค่าที่ไม่ได้ส่งมา
describe('update schemas do not inject defaults', () => {
  it('master PATCH {isActive} keeps other fields untouched', () => {
    expect(updateStatusSchema.parse({ isActive: true })).toEqual({ isActive: true })
    expect(updateCategorySchema.parse({ isActive: true })).toEqual({ isActive: true })
    expect(updateMarkTypeSchema.parse({ isActive: true })).toEqual({ isActive: true })
  })

  it('template item PATCH does not reset weight', () => {
    expect(updateTemplateItemSchema.parse({ defaultPeriods: {} })).toEqual({ defaultPeriods: {} })
  })

  it('create schemas still apply defaults', () => {
    expect(upsertStatusSchema.parse({ code: 'AB', name: 'x' })).toMatchObject({
      isTerminal: false,
      isDefault: false,
      isActive: true,
      orderIndex: 0,
    })
    const item = addTemplateItemSchema.parse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      activity: 'a',
    })
    expect(item.weight).toBe(1)
  })
})

describe('boolean query params', () => {
  it("parses 'false' as false (z.coerce.boolean would say true)", () => {
    expect(listTemplatesQuerySchema.parse({ includeInactive: 'false' }).includeInactive).toBe(false)
    expect(listPlansQuerySchema.parse({ includeArchived: 'false' }).includeArchived).toBe(false)
    expect(listPlansQuerySchema.parse({ includeArchived: 'true' }).includeArchived).toBe(true)
    expect(listPlansQuerySchema.parse({}).includeArchived).toBe(false)
    // route (withApiHandler) parse แล้ว use case parse ซ้ำ — รอบสองได้ boolean
    const once = listPlansQuerySchema.parse({ includeArchived: 'false' })
    expect(listPlansQuerySchema.parse(once).includeArchived).toBe(false)
  })
})
