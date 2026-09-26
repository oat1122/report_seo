// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { KeywordReport, KeywordReportForm } from '@/types/metrics'
import { KeywordReportTable } from '../KeywordReportTable'

const buildKeyword = (overrides: Partial<KeywordReport> = {}): KeywordReport => ({
  id: 'kw-1',
  keyword: 'รับทำ seo',
  position: 3,
  traffic: 1450,
  kd: 'MEDIUM',
  isTopReport: true,
  dateRecorded: '2026-09-27T01:00:00.000Z',
  customerId: 'user-1',
  images: [],
  ...overrides,
})

const emptyDraft: KeywordReportForm = {
  keyword: '',
  position: 0,
  traffic: 0,
  kd: 'EASY',
  isTopReport: false,
}

function renderTable(overrides: Partial<Parameters<typeof KeywordReportTable>[0]> = {}) {
  const handlers = {
    onDraftChange: vi.fn(),
    onDraftKdChange: vi.fn(),
    onSave: vi.fn(),
    onCancelEdit: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onViewHistory: vi.fn(),
  }
  render(
    <TooltipProvider>
      <KeywordReportTable
        customerId="user-1"
        keywords={[buildKeyword(), buildKeyword({ id: 'kw-2', keyword: 'seo ราคา' })]}
        isLoading={false}
        editingKeywordId={null}
        draft={emptyDraft}
        {...handlers}
        {...overrides}
      />
    </TooltipProvider>,
  )
  return handlers
}

describe('KeywordReportTable', () => {
  it('ลบต้องผ่าน dialog ยืนยันก่อน แล้วจึงเรียก onDelete ด้วย id ของแถวนั้น', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderTable()

    // ตาราง desktop + การ์ดมือถืออยู่ใน DOM ทั้งคู่ (ซ่อนด้วย CSS container query)
    await user.click(screen.getAllByRole('button', { name: 'ลบ seo ราคา' })[0])
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog').textContent).toContain('ลบ Keyword “seo ราคา”?')

    await user.click(screen.getByRole('button', { name: 'ลบ' }))
    expect(onDelete).toHaveBeenCalledWith('kw-2')
  })

  it('แก้ไขในแถวแล้วล้างชื่อ keyword = บอกข้อผิดพลาดใต้ช่อง และไม่บันทึก', async () => {
    const user = userEvent.setup()
    const { onSave } = renderTable({ editingKeywordId: 'kw-1', draft: emptyDraft })

    await user.click(screen.getAllByRole('button', { name: 'บันทึก' })[0])

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getAllByText('กรอก Keyword ก่อนบันทึก').length).toBeGreaterThan(0)
  })

  it('ค้นหาไม่เจอ = บอกคำที่ค้นและล้างคำค้นหาได้', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.type(screen.getByRole('searchbox', { name: 'ค้นหา keyword' }), 'ไม่มีจริง')
    expect(screen.getByText('ไม่พบ Keyword ที่ตรงกับ “ไม่มีจริง”')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'ล้างคำค้นหา' }))
    expect(screen.getAllByText('seo ราคา').length).toBeGreaterThan(0)
  })
})
