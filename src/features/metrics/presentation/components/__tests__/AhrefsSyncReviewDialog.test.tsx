// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AhrefsFullMetrics } from '@/features/metrics'
import { AhrefsSyncReviewDialog } from '../AhrefsSyncReviewDialog'

const { mutateAsync } = vi.hoisted(() => ({ mutateAsync: vi.fn() }))

vi.mock('@/features/customer-report/presentation/hooks/useCustomerReport', () => ({
  useGetCustomerReport: () => ({
    data: {
      metrics: {
        domainRating: 39,
        healthScore: 80,
        organicTraffic: 10540,
        organicKeywords: 1049,
        backlinks: 3224,
        refDomains: 196,
      },
    },
    isLoading: false,
  }),
}))
vi.mock('../../hooks/useMetrics', () => ({
  useSaveMetrics: () => ({ mutateAsync, isPending: false }),
}))
vi.mock('react-toastify', () => ({ toast: { success: vi.fn() } }))

// Ahrefs ไม่มี Health Score ให้ (null) — ช่องนั้นต้องเริ่มแบบไม่เลือก
const proposed: AhrefsFullMetrics = {
  domainRating: 42,
  healthScore: null,
  organicTraffic: 12480,
  organicKeywords: 1146,
  backlinks: 3420,
  refDomains: 214,
}

function renderDialog() {
  const onOpenChange = vi.fn()
  render(
    <AhrefsSyncReviewDialog
      open
      onOpenChange={onOpenChange}
      userId="user-1"
      customerName="ลูกค้า A"
      proposed={proposed}
    />,
  )
  return { onOpenChange }
}

describe('AhrefsSyncReviewDialog', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({})
  })

  it('เริ่มต้นเลือกทุกค่าที่ Ahrefs มีให้ และโชว์ส่วนต่างแบบมีเครื่องหมาย', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: 'บันทึก 5 ค่า' })).toBeTruthy()
    // DR 39 → 42 (ตาราง + การ์ดมือถืออยู่ใน DOM ทั้งคู่)
    expect(screen.getAllByText('+3').length).toBeGreaterThan(0)
  })

  it('บันทึกเฉพาะค่าที่เลือก — ค่าที่เอาติ๊กออกคงค่าเดิมไว้', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await user.click(screen.getAllByRole('checkbox', { name: 'บันทึก Backlinks' })[0])
    await user.click(screen.getByRole('button', { name: 'บันทึก 4 ค่า' }))

    expect(mutateAsync).toHaveBeenCalledWith({
      customerId: 'user-1',
      metrics: { domainRating: 42, organicTraffic: 12480, organicKeywords: 1146, refDomains: 214 },
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('แก้ค่าเกินช่วงแล้วบันทึกไม่ได้จนกว่าจะแก้', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนแปลงค่า' }))
    const [drInput] = screen.getAllByRole('spinbutton', { name: 'ค่าใหม่ Domain Rating' })
    await user.clear(drInput)
    await user.type(drInput, '150')

    expect(screen.getAllByText('ต้องไม่เกิน 100').length).toBeGreaterThan(0)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'บันทึก 5 ค่า' }).disabled).toBe(
      true,
    )
  })

  it('บันทึกไม่สำเร็จ = คง dialog ไว้พร้อมบอกให้ลองใหม่', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('network'))
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'บันทึก 5 ค่า' }))

    expect(screen.getByRole('alert').textContent).toContain('บันทึกไม่สำเร็จ')
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
