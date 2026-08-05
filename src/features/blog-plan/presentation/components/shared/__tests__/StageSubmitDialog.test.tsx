// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StageSubmitDialog } from '../StageSubmitDialog'
import type { BlogStageCode } from '../../../../domain/BlogArticle'

function renderDialog(overrides: Partial<Parameters<typeof StageSubmitDialog>[0]> = {}) {
  const onSubmit = vi.fn()
  const onOpenChange = vi.fn()
  const props = {
    stageCode: 'SUBMIT_TOPIC' as BlogStageCode | null,
    previousRounds: 0,
    onOpenChange,
    onSubmit,
    ...overrides,
  }
  const view = render(<StageSubmitDialog {...props} />)
  return { onSubmit, onOpenChange, rerender: view.rerender, props }
}

const submitButton = () => screen.getByRole<HTMLButtonElement>('button', { name: 'ส่งให้ลูกค้า' })

describe('StageSubmitDialog', () => {
  it('stage ที่รับไฟล์ได้ = โชว์ปุ่มแนบไฟล์พร้อมข้อจำกัดของชนิดไฟล์นั้น', () => {
    renderDialog({ stageCode: 'SUBMIT_TOPIC' })
    expect(screen.getByRole('button', { name: /เลือกไฟล์/ })).toBeTruthy()
    expect(screen.getByText('Word/PDF ไม่เกิน 20MB')).toBeTruthy()
  })

  it('ขั้นไฟล์ final = ขอทั้งไฟล์บทความและภาพปก และส่งไม่ได้จนกว่าจะแนบครบ', async () => {
    const user = userEvent.setup()
    renderDialog({ stageCode: 'SUBMIT_FINAL' })

    expect(screen.getByText('Word/PDF ไม่เกิน 20MB')).toBeTruthy()
    expect(screen.getByText('JPG/PNG ไม่เกิน 5MB')).toBeTruthy()

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), 'ไฟล์ final ครับ')
    expect(submitButton().disabled).toBe(true)

    await user.upload(
      screen.getByLabelText<HTMLInputElement>('ไฟล์บทความ'),
      new File(['doc'], 'final.docx', { type: 'application/msword' }),
    )
    expect(submitButton().disabled).toBe(true)

    await user.upload(
      screen.getByLabelText<HTMLInputElement>('ภาพปก'),
      new File(['img'], 'cover.png', { type: 'image/png' }),
    )
    expect(submitButton().disabled).toBe(false)
  })

  it('stage ที่แนบไฟล์ไม่ได้ = ไม่โชว์ปุ่มแนบไฟล์เลย', () => {
    renderDialog({ stageCode: 'CLIENT_FEEDBACK_TOPIC' })
    expect(screen.queryByRole('button', { name: /เลือกไฟล์/ })).toBeNull()
  })

  it('ยังไม่กรอกอะไร = ส่งไม่ได้ (use case ฝั่ง server ก็ปฏิเสธเคสนี้)', async () => {
    const user = userEvent.setup()
    renderDialog()

    expect(submitButton().disabled).toBe(true)

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), 'เสนอ 3 หัวข้อ')
    expect(submitButton().disabled).toBe(false)
  })

  it('ช่องว่างล้วนไม่นับว่ากรอกแล้ว', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), '   ')
    expect(submitButton().disabled).toBe(true)
  })

  it('ส่งค่าที่ trim แล้วออกไปให้ผู้เรียก', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderDialog()

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), '  เสนอหัวข้อ  ')
    await user.type(screen.getByLabelText('ลิงก์ (ถ้ามี)'), '  https://docs.google.com/x  ')
    await user.click(submitButton())

    expect(onSubmit).toHaveBeenCalledWith({
      message: 'เสนอหัวข้อ',
      linkUrl: 'https://docs.google.com/x',
      files: {},
    })
  })

  it('เคยส่งไปแล้ว = บอกผู้ใช้ว่ากำลังส่งรอบที่เท่าไร', () => {
    renderDialog({ previousRounds: 2 })
    expect(screen.getByText('ส่งใหม่ (รอบ 3)')).toBeTruthy()
  })

  it('กำลังส่งอยู่ = กันกดซ้ำ', async () => {
    const user = userEvent.setup()
    renderDialog({ isPending: true })

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), 'เนื้อหา')
    expect(submitButton().disabled).toBe(true)
  })

  it('เปลี่ยนไปส่ง stage อื่น = เคลียร์ฟอร์มที่ค้างไว้', async () => {
    const user = userEvent.setup()
    const { rerender, props } = renderDialog()

    const message = screen.getByLabelText<HTMLTextAreaElement>('ข้อความถึงลูกค้า')
    await user.type(message, 'ค้างจาก stage ก่อน')
    expect(message.value).toBe('ค้างจาก stage ก่อน')

    rerender(<StageSubmitDialog {...props} stageCode="SUBMIT_ARTICLE" />)

    expect(screen.getByLabelText<HTMLTextAreaElement>('ข้อความถึงลูกค้า').value).toBe('')
    expect(submitButton().disabled).toBe(true)
  })
})
