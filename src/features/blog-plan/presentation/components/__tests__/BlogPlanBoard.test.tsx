// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogPlanBoard } from '../BlogPlanBoard'
import { buildArticle } from '../../../application/use-cases/__tests__/fakes'
import type { BlogArticleStatus } from '../../../domain/BlogArticle'
import type { ArticleListPayload, MonthFilter } from '../../hooks/useBlogPlan'

// mock ทั้งโมดูล hook — board เป็นชั้น UI ล้วน ไม่ต้องพึ่ง React Query/axios จริง
vi.mock('../../hooks/useBlogPlan', () => {
  const mutation = () => ({ mutate: vi.fn(), isPending: false })
  return {
    useBlogArticles: vi.fn(),
    useBlogSettings: vi.fn(),
    useBlogKeywords: vi.fn(() => ({ data: [], isLoading: false })),
    useCreateArticle: mutation,
    useUpdateArticle: mutation,
    useDeleteArticle: mutation,
    useUpdateStage: mutation,
    useSubmitFeedback: mutation,
    useSubmitStageWork: mutation,
    useDeleteArticleFile: mutation,
    useMessageBlogWriter: mutation,
  }
})

const { useBlogArticles, useBlogSettings } = vi.mocked(await import('../../hooks/useBlogPlan'))

const CUSTOMER_ID = 'customer-1'

function articleWith(id: string, status: BlogArticleStatus) {
  return buildArticle({ id, status, title: `บทความ ${id}` })
}

/** ให้ hook คืนลิสต์เดียวกันทุก filter — เทสต์ที่สนใจการเปลี่ยนเดือนอ่านจาก mock.calls แทน */
function mockArticles(articles: ReturnType<typeof articleWith>[]) {
  useBlogArticles.mockImplementation((_customerId, _filter, enabled = true) => {
    const payload: ArticleListPayload = { articles, monthlyCount: articles.length }
    return { data: enabled ? payload : undefined, isLoading: false } as ReturnType<
      typeof useBlogArticles
    >
  })
}

function lastFilter(): MonthFilter {
  const calls = useBlogArticles.mock.calls
  return calls[calls.length - 1][1]
}

describe('BlogPlanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useBlogSettings.mockReturnValue({
      data: { articlesPerMonth: 4, blogWriterId: 'w-1', blogWriterName: 'นักเขียน 1' },
    } as ReturnType<typeof useBlogSettings>)
    mockArticles([])
  })

  // เทสต์ที่ตรึงเวลาไว้ต้องคืนนาฬิกาจริงเสมอ ไม่งั้นเทสต์ถัดไปเห็นเดือนผิด
  afterEach(() => {
    vi.useRealTimers()
  })

  it('กำลังโหลด = โชว์ skeleton ยังไม่โชว์ empty state', () => {
    useBlogArticles.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<
      typeof useBlogArticles
    >)

    const { container } = render(
      <BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />,
    )

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'ถึงคิวคุณแล้ว' })).toBeNull()
  })

  it('เดือนนี้ไม่มีบทความ = โชว์ empty state', () => {
    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)

    expect(screen.queryByRole('heading', { name: 'ถึงคิวคุณแล้ว' })).toBeNull()
    expect(screen.getByText(/ยังไม่มีบทความ/)).toBeTruthy()
  })

  it('ฝั่งทีมเขียน: งานที่ยังไม่ส่ง/ลูกค้าขอแก้ = ถึงคิวเรา, ที่ส่งไปแล้ว = รอลูกค้า', () => {
    mockArticles([
      articleWith('a1', 'DRAFT'),
      articleWith('a2', 'CHANGES_REQUESTED'),
      articleWith('a3', 'WAITING_CLIENT'),
      articleWith('a4', 'PUBLISHED'),
    ])

    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)

    expect(screen.getByRole('heading', { name: 'ถึงคิวคุณแล้ว' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'รอลูกค้าตอบ' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'เสร็จแล้ว' })).toBeTruthy()
  })

  it('ฝั่งลูกค้า: เห็นเฉพาะงานที่รอตัวเองตอบเป็น "ถึงคิวคุณ" และหัวข้อเปลี่ยนตามสิทธิ์', () => {
    mockArticles([articleWith('a1', 'DRAFT'), articleWith('a2', 'WAITING_CLIENT')])

    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage={false} canRespond />)

    expect(screen.getByRole('heading', { name: 'ถึงคิวคุณแล้ว' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'ทีมกำลังทำอยู่' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'รอลูกค้าตอบ' })).toBeNull()
    // ลูกค้าเพิ่มบทความเองไม่ได้
    expect(screen.queryByRole('button', { name: /เพิ่มบทความ/ })).toBeNull()
  })

  it('กลุ่มที่ไม่มีบทความจะไม่ถูก render', () => {
    mockArticles([articleWith('a1', 'DRAFT')])

    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)

    expect(screen.getByRole('heading', { name: 'ถึงคิวคุณแล้ว' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'เสร็จแล้ว' })).toBeNull()
  })

  it('เลื่อนเดือนถอยหลังข้ามปีได้', async () => {
    const user = userEvent.setup()
    vi.setSystemTime(new Date('2026-01-15T00:00:00.000Z'))
    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)

    expect(lastFilter()).toEqual({ year: 2025, month: 12 })

    await user.click(screen.getByRole('button', { name: 'เดือนก่อนหน้า' }))

    expect(screen.getByText('ธันวาคม 2568')).toBeTruthy()
  })

  it('เลื่อนเดือนไปข้างหน้าข้ามปีได้', async () => {
    const user = userEvent.setup()
    vi.setSystemTime(new Date('2026-12-15T00:00:00.000Z'))
    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)

    await user.click(screen.getByRole('button', { name: 'เดือนถัดไป' }))

    expect(screen.getByText('มกราคม 2570')).toBeTruthy()
  })

  it('ใช้เกินโควตา = ยังแสดงตัวเลขจริงให้เห็น', () => {
    mockArticles([
      articleWith('a1', 'DRAFT'),
      articleWith('a2', 'DRAFT'),
      articleWith('a3', 'DRAFT'),
      articleWith('a4', 'DRAFT'),
      articleWith('a5', 'DRAFT'),
    ])

    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)

    expect(screen.getByText(/ใช้ไป 5 \/ โควตา 4 บทความ/)).toBeTruthy()
  })
})
