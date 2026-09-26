'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BLOG_STAGES } from '../../domain/policies/stage-schedule'
import type { BlogStageCode } from '../../domain/BlogArticle'

/** หน้าย่อยของแผนบทความ — ไม่มีค่า = แสดงบอร์ดตามปกติ */
export type BlogPlanView = 'submit' | 'feedback' | 'writer-message' | 'article-form' | 'files'

const VIEWS: readonly BlogPlanView[] = [
  'submit',
  'feedback',
  'writer-message',
  'article-form',
  'files',
]

export interface OpenViewOptions {
  articleId?: string
  stageCode?: BlogStageCode
}

/**
 * สถานะทั้งหมดของหน้าแผนบทความอยู่ใน URL: ?y=&m=&view=&article=&stage=
 * — refresh แล้วกลับมาที่เดิม, กด back ปิดหน้าย่อย, ส่งลิงก์ให้คนอื่นเปิดต่อได้
 */
export function useBlogPlanRoute() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const now = new Date()
  const year = toNumber(searchParams.get('y')) ?? now.getFullYear()
  const month = toNumber(searchParams.get('m')) ?? now.getMonth() + 1
  const rawView = searchParams.get('view')
  const rawStage = searchParams.get('stage')

  const push = (params: URLSearchParams, mode: 'push' | 'replace') => {
    const query = params.toString()
    router[mode](query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return {
    year,
    month,
    view: VIEWS.find((value) => value === rawView) ?? null,
    articleId: searchParams.get('article'),
    stageCode: BLOG_STAGES.find((stage) => stage.code === rawStage)?.code ?? null,

    /** เปลี่ยนเดือนไม่ควรถมประวัติ — กด back ควรออกจากหน้าแผนบทความไปเลย */
    setMonth(nextYear: number, nextMonth: number) {
      const params = new URLSearchParams(searchParams)
      params.set('y', String(nextYear))
      params.set('m', String(nextMonth))
      push(params, 'replace')
    },

    /** เลือกบทความบนบอร์ด — replace เพราะสลับเรื่องไปมาไม่ควรถมประวัติ (เหมือน setMonth) */
    selectArticle(articleId: string | null) {
      const params = new URLSearchParams(searchParams)
      if (articleId) params.set('article', articleId)
      else params.delete('article')
      push(params, 'replace')
    },

    /** push เพื่อให้ปุ่ม back ของเบราว์เซอร์ = ปิดหน้าย่อยกลับมาที่บอร์ด */
    openView(view: BlogPlanView, options: OpenViewOptions = {}) {
      const params = new URLSearchParams(searchParams)
      params.set('y', String(year))
      params.set('m', String(month))
      params.set('view', view)
      params.delete('article')
      params.delete('stage')
      if (options.articleId) params.set('article', options.articleId)
      if (options.stageCode) params.set('stage', options.stageCode)
      push(params, 'push')
    },

    closeView() {
      const params = new URLSearchParams(searchParams)
      params.delete('view')
      params.delete('article')
      params.delete('stage')
      push(params, 'replace')
    },
  }
}

function toNumber(raw: string | null): number | null {
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}
