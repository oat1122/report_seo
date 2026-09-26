// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StageSubmitView } from '../StageSubmitView'
import { buildArticle } from '../../../../application/use-cases/__tests__/fakes'
import { BLOG_MESSAGE_MAX_LENGTH } from '../../../../schemas'
import type { BlogArticle, BlogStageCode } from '../../../../domain/BlogArticle'

function renderView(overrides: Partial<Parameters<typeof StageSubmitView>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  const props = {
    article: buildArticle(),
    stageCode: 'SUBMIT_TOPIC' as BlogStageCode,
    onCancel,
    onSubmit,
    ...overrides,
  }
  const view = render(<StageSubmitView {...props} />)
  return { onSubmit, onCancel, rerender: view.rerender, props }
}

const submitButton = () => screen.getByRole<HTMLButtonElement>('button', { name: 'ส่งให้ลูกค้า' })

describe('StageSubmitView', () => {
  it('stage ที่รับไฟล์ได้ = โชว์ปุ่มแนบไฟล์พร้อมข้อจำกัดของชนิดไฟล์นั้น', () => {
    renderView({ stageCode: 'SUBMIT_TOPIC' })
    expect(screen.getByRole('button', { name: /เลือกไฟล์/ })).toBeTruthy()
    expect(screen.getByText('Word/PDF ไม่เกิน 20MB')).toBeTruthy()
  })

  it('ขั้นไฟล์ final = ขอทั้งไฟล์บทความและภาพปก และส่งไม่ได้จนกว่าจะแนบครบ', async () => {
    const user = userEvent.setup()
    renderView({ stageCode: 'SUBMIT_FINAL' })

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
    renderView({ stageCode: 'CLIENT_FEEDBACK_TOPIC' })
    expect(screen.queryByRole('button', { name: /เลือกไฟล์/ })).toBeNull()
  })

  it('ยังไม่กรอกอะไร = ส่งไม่ได้ (use case ฝั่ง server ก็ปฏิเสธเคสนี้)', async () => {
    const user = userEvent.setup()
    renderView()

    expect(submitButton().disabled).toBe(true)

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), 'เสนอ 3 หัวข้อ')
    expect(submitButton().disabled).toBe(false)
  })

  it('ช่องว่างล้วนไม่นับว่ากรอกแล้ว', async () => {
    const user = userEvent.setup()
    renderView()

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), '   ')
    expect(submitButton().disabled).toBe(true)
  })

  it('ส่งค่าที่ trim แล้วออกไปให้ผู้เรียก', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderView()

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), '  เสนอหัวข้อ  ')
    await user.type(screen.getByLabelText('ลิงก์ (ถ้ามี)'), '  https://docs.google.com/x  ')
    await user.click(submitButton())

    expect(onSubmit).toHaveBeenCalledWith({
      message: 'เสนอหัวข้อ',
      linkUrl: 'https://docs.google.com/x',
      files: {},
    })
  })

  it('ลิงก์ที่ไม่มี https:// = เติมให้ก่อนส่ง (server บังคับว่าต้องมี scheme)', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderView()

    await user.type(screen.getByLabelText('ลิงก์ (ถ้ามี)'), 'docs.google.com/d/abc')
    await user.click(submitButton())

    expect(onSubmit).toHaveBeenCalledWith({
      message: '',
      linkUrl: 'https://docs.google.com/d/abc',
      files: {},
    })
  })

  it('ลิงก์ที่ใช้ไม่ได้จริง = บอกตรงช่องและกดส่งไม่ได้ ไม่ปล่อยไปโดน 400', async () => {
    const user = userEvent.setup()
    renderView()

    await user.type(screen.getByLabelText('ลิงก์ (ถ้ามี)'), 'ลิงก์ อะไรไม่รู้')

    expect(screen.getByText(/ลิงก์นี้ยังใช้ไม่ได้/)).toBeTruthy()
    expect(submitButton().disabled).toBe(true)
  })

  it('ข้อความยาวเกินเพดาน = ถูกกันไว้ที่ maxLength ของช่อง ไม่ปล่อยไปโดน 400', () => {
    renderView()
    const message = screen.getByLabelText<HTMLTextAreaElement>('ข้อความถึงลูกค้า')

    expect(message.maxLength).toBe(BLOG_MESSAGE_MAX_LENGTH)
    expect(screen.getByText(`0 / ${BLOG_MESSAGE_MAX_LENGTH.toLocaleString('th-TH')}`)).toBeTruthy()
  })

  it('เคยส่ง stage นี้ไปแล้ว = บอกผู้ใช้ว่ากำลังส่งรอบที่เท่าไร', () => {
    const article: BlogArticle = buildArticle({
      submissions: [1, 2].map((round) => ({
        id: `sub-${round}`,
        stageCode: 'SUBMIT_TOPIC' as BlogStageCode,
        round,
        message: `รอบ ${round}`,
        linkUrl: null,
        createdAt: new Date('2026-08-02T00:00:00.000Z'),
        authorName: 'ทีมเขียน',
        files: [],
      })),
    })
    renderView({ article })

    expect(screen.getByRole('heading', { name: 'ส่งใหม่ (รอบ 3)' })).toBeTruthy()
  })

  it('กำลังส่งอยู่ = กันกดซ้ำ', async () => {
    const user = userEvent.setup()
    renderView({ isPending: true })

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), 'เนื้อหา')
    expect(submitButton().disabled).toBe(true)
  })

  it('เปลี่ยนไปส่ง stage อื่น = เคลียร์ฟอร์มที่ค้างไว้', async () => {
    const user = userEvent.setup()
    const { rerender, props } = renderView()

    const message = screen.getByLabelText<HTMLTextAreaElement>('ข้อความถึงลูกค้า')
    await user.type(message, 'ค้างจาก stage ก่อน')
    expect(message.value).toBe('ค้างจาก stage ก่อน')

    rerender(<StageSubmitView {...props} stageCode="SUBMIT_ARTICLE" />)

    expect(screen.getByLabelText<HTMLTextAreaElement>('ข้อความถึงลูกค้า').value).toBe('')
    expect(submitButton().disabled).toBe(true)
  })

  it('มีข้อความค้างแล้วกดยกเลิก = ถามยืนยันก่อน ไม่ยืนยันก็ไม่ออก', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { onCancel } = renderView()

    await user.type(screen.getByLabelText('ข้อความถึงลูกค้า'), 'เขียนค้างไว้')
    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()

    confirmSpy.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }))
    expect(onCancel).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('ยังไม่ได้พิมพ์อะไร = กดยกเลิกออกได้เลย ไม่ต้องถาม', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm')
    const { onCancel } = renderView()

    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }))

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
