// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogPlanBoard } from '../BlogPlanBoard'
import { buildArticle, buildStages } from '../../../application/use-cases/__tests__/fakes'
import type { BlogArticleStatus } from '../../../domain/BlogArticle'
import type { ArticleListPayload, MonthFilter } from '../../hooks/useBlogPlan'

// จำลอง URL ของ Next: router.push/replace เขียนลง store แล้วให้ useSearchParams re-render ตาม
// — สถานะทั้งหมดของ board อยู่ใน query string จึงต้องมี URL จริงให้เทสต์เดิน
const nav = vi.hoisted(() => {
  let params = new URLSearchParams()
  const listeners = new Set<() => void>()
  return {
    get: () => params,
    set: (search: string) => {
      params = new URLSearchParams(search)
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
})

vi.mock('next/navigation', async () => {
  const { useSyncExternalStore } = await import('react')
  const write = (url: string) => nav.set(url.split('?')[1] ?? '')
  return {
    usePathname: () => '/admin/customers/customer-1/blog-plan',
    useSearchParams: () => useSyncExternalStore(nav.subscribe, nav.get, nav.get),
    useRouter: () => ({ push: write, replace: write }),
  }
})

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

/**
 * บอร์ดเรียก hook หลายรอบต่อ render — เดือนปัจจุบัน, เดือนก่อนหน้า, แล้วก็คลังไฟล์ (ไม่ส่ง y/m)
 * ตัวสุดท้ายที่ยังระบุเดือน = filter ของเดือนก่อนหน้า
 */
function lastFilter(): MonthFilter {
  const calls = useBlogArticles.mock.calls.filter((call) => call[1].year !== undefined)
  return calls[calls.length - 1][1]
}

function renderBoard(search = '', props: Partial<Parameters<typeof BlogPlanBoard>[0]> = {}) {
  nav.set(search)
  return render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} {...props} />)
}

describe('BlogPlanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    nav.set('')
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

  it('ยังไม่ได้เลือกเรื่อง = แผงขวากางบทความแรกของกลุ่ม "ถึงคิวคุณแล้ว" ให้เอง', () => {
    mockArticles([articleWith('a1', 'WAITING_CLIENT'), articleWith('a2', 'DRAFT')])

    renderBoard()

    // หัวการ์ดรายละเอียดเป็น h3 — ลิสต์ซ้ายไม่ใช่ heading จึงแยกกันได้ชัด
    expect(screen.getByRole('heading', { level: 3, name: 'บทความ a2' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 3, name: 'บทความ a1' })).toBeNull()
    // เลือกให้ดูเฉย ๆ ไม่เขียนลง URL — จอเล็กจะได้เปิดมาเจอลิสต์ก่อน
    expect(nav.get().get('article')).toBeNull()
  })

  it('คลิกเรื่องในลิสต์ซ้าย = URL เปลี่ยนและแผงขวาสลับเรื่องตาม', async () => {
    const user = userEvent.setup()
    mockArticles([articleWith('a1', 'WAITING_CLIENT'), articleWith('a2', 'DRAFT')])
    renderBoard()

    await user.click(screen.getByRole('button', { name: /บทความ a1/ }))

    expect(nav.get().get('article')).toBe('a1')
    expect(screen.getByRole('heading', { level: 3, name: 'บทความ a1' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 3, name: 'บทความ a2' })).toBeNull()
  })

  it('เลือกค้างไว้เป็นบทความที่ไม่มีในเดือนนี้ = ล้าง query ทิ้ง', async () => {
    mockArticles([articleWith('a1', 'DRAFT')])

    renderBoard('article=เดือนก่อน')

    await waitFor(() => expect(nav.get().get('article')).toBeNull())
    expect(screen.getByRole('heading', { level: 3, name: 'บทความ a1' })).toBeTruthy()
  })

  it('แถบลงมือท้ายการ์ด: ลูกค้าเห็นปุ่มอนุมัติ / ทีมเขียนเห็นปุ่มส่งงาน', () => {
    mockArticles([articleWith('a1', 'WAITING_CLIENT')])

    const client = render(
      <BlogPlanBoard customerId={CUSTOMER_ID} canManage={false} canRespond />,
    )
    expect(screen.getByRole('button', { name: /อนุมัติเลย/ })).toBeTruthy()
    client.unmount()

    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)
    expect(screen.getByRole('button', { name: /ส่งงาน:/ })).toBeTruthy()
  })

  it('ไม่มีอะไรให้ลงมือ = ไม่มีแถบท้ายการ์ด', () => {
    // ทีมเขียนส่งครบทุกขั้นของตัวเองแล้ว เหลือแต่ขั้นที่รอลูกค้า
    const submitted = buildStages(true).map((stage) =>
      stage.stageCode.startsWith('SUBMIT_') ? { ...stage, submittedAt: new Date() } : stage,
    )
    mockArticles([buildArticle({ id: 'a1', status: 'WAITING_CLIENT', stages: submitted })])

    render(<BlogPlanBoard customerId={CUSTOMER_ID} canManage canRespond={false} />)

    expect(screen.getByRole('heading', { level: 3, name: 'บทความทดสอบ' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /ส่งงาน:/ })).toBeNull()
    expect(screen.queryByText(/ส่งงานครบทุกขั้นแล้ว/)).toBeNull()
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

  it('เดือนใน URL มาก่อนเดือนปัจจุบันเสมอ', () => {
    vi.setSystemTime(new Date('2026-08-15T00:00:00.000Z'))
    mockArticles([articleWith('a1', 'DRAFT')])

    renderBoard('y=2025&m=3')

    expect(screen.getByText('มีนาคม 2568')).toBeTruthy()
  })

  it('กดเพิ่มบทความ = เปลี่ยน URL ไปหน้าฟอร์ม ไม่ใช่เปิด dialog ทับบอร์ด', async () => {
    const user = userEvent.setup()
    mockArticles([articleWith('a1', 'DRAFT')])
    renderBoard()

    await user.click(screen.getByRole('button', { name: /เพิ่มบทความ/ }))

    expect(nav.get().get('view')).toBe('article-form')
    expect(screen.getByRole('heading', { name: 'เพิ่มบทความ' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'ถึงคิวคุณแล้ว' })).toBeNull()
  })

  it('URL ชี้ไปบทความที่ไม่มีอยู่ = ล้าง query แล้วกลับมาที่บอร์ด', async () => {
    mockArticles([articleWith('a1', 'DRAFT')])

    renderBoard('view=submit&article=ไม่มีจริง&stage=SUBMIT_TOPIC')

    await waitFor(() => expect(nav.get().get('view')).toBeNull())
    expect(screen.getByRole('heading', { name: 'ถึงคิวคุณแล้ว' })).toBeTruthy()
  })

  it('ลูกค้าเปิด URL หน้าส่งงานตรง ๆ ไม่ได้ — เด้งกลับบอร์ด', async () => {
    mockArticles([articleWith('a1', 'WAITING_CLIENT')])

    renderBoard('view=submit&article=a1&stage=SUBMIT_TOPIC', { canManage: false, canRespond: true })

    await waitFor(() => expect(nav.get().get('view')).toBeNull())
    expect(screen.queryByRole('heading', { name: 'ส่งงานให้ลูกค้า' })).toBeNull()
  })

  it('กดคลังไฟล์ = เปิดหน้ารวมไฟล์แล้วกรองด้วยคำค้นได้', async () => {
    const user = userEvent.setup()
    const withFile = buildArticle({
      id: 'a1',
      title: 'บทความมีไฟล์',
      submissions: [
        {
          id: 'sub-1',
          stageCode: 'SUBMIT_ARTICLE',
          round: 1,
          message: null,
          linkUrl: null,
          createdAt: new Date('2026-08-02T00:00:00.000Z'),
          authorName: null,
          files: [
            {
              id: 'f1',
              kind: 'ARTICLE_DOC',
              url: '/uploads/blog/draft.docx',
              filename: 'draft.docx',
              mimeType: 'application/msword',
              sizeBytes: 2048,
              version: 1,
              createdAt: new Date('2026-08-02T00:00:00.000Z'),
              uploadedByName: null,
            },
          ],
        },
      ],
    })
    mockArticles([withFile])

    renderBoard()
    await user.click(screen.getByRole('button', { name: /คลังไฟล์/ }))

    expect(nav.get().get('view')).toBe('files')
    expect(screen.getByText('draft.docx')).toBeTruthy()

    await user.type(screen.getByLabelText('ค้นหาชื่อไฟล์หรือชื่อบทความ'), 'ไม่มีคำนี้')

    expect(screen.queryByText('draft.docx')).toBeNull()
    expect(screen.getByText(/ไม่มีไฟล์ที่ตรงกับตัวกรองนี้/)).toBeTruthy()
  })
})
