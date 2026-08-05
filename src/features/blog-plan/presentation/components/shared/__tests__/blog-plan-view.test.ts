import { describe, expect, it } from 'vitest'
import {
  collectArticleFiles,
  daysUntil,
  formatMonthLabel,
  getCurrentStage,
  groupArticle,
} from '../blog-plan-view'
import { buildArticle, buildStages } from '../../../../application/use-cases/__tests__/fakes'
import type { BlogArticle, BlogArticleFile } from '../../../../domain/BlogArticle'

function file(overrides: Partial<BlogArticleFile> = {}): BlogArticleFile {
  return {
    id: 'file-1',
    kind: 'ARTICLE_DOC',
    url: '/uploads/blog/doc.docx',
    filename: 'doc.docx',
    mimeType: 'application/msword',
    sizeBytes: 10,
    version: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    uploadedByName: null,
    ...overrides,
  }
}

function submittedThrough(article: BlogArticle, count: number): BlogArticle {
  article.stages.slice(0, count).forEach((stage) => {
    stage.submittedAt = new Date('2026-08-01T00:00:00.000Z')
  })
  return article
}

describe('formatMonthLabel', () => {
  it('แสดงเดือนไทยพร้อมปี พ.ศ. ให้ตรงกับ locale th-TH ที่ใช้ทั้งหน้า', () => {
    expect(formatMonthLabel(2026, 8)).toBe('สิงหาคม 2569')
    expect(formatMonthLabel(2026, 1)).toBe('มกราคม 2569')
    expect(formatMonthLabel(2026, 12)).toBe('ธันวาคม 2569')
  })
})

describe('daysUntil', () => {
  const atNoon = (offsetDays: number) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() + offsetDays)
    return date
  }

  it('นับเป็นวันเต็มโดยไม่สนเวลาในวัน', () => {
    expect(daysUntil(atNoon(0))).toBe(0)
    expect(daysUntil(atNoon(3))).toBe(3)
  })

  it('เลยกำหนดแล้วได้ค่าติดลบ', () => {
    expect(daysUntil(atNoon(-2))).toBe(-2)
  })
})

describe('getCurrentStage', () => {
  it('คืนขั้นแรกที่ยังไม่ส่ง พร้อมลำดับที่แสดงบนการ์ด', () => {
    const current = getCurrentStage(submittedThrough(buildArticle(), 1))

    expect(current?.definition.code).toBe('CLIENT_FEEDBACK_TOPIC')
    expect(current?.step).toBe(2)
    expect(current?.total).toBe(5)
  })

  it('บทความ fast track นับจำนวนขั้นจาก stage ที่มีจริง', () => {
    const current = getCurrentStage(buildArticle({ stages: buildStages(false) }))

    expect(current).toMatchObject({ step: 1, total: 1 })
    expect(current?.definition.code).toBe('SUBMIT_FINAL')
  })

  it('ส่งครบทุกขั้นแล้ว = null', () => {
    expect(getCurrentStage(submittedThrough(buildArticle(), 5))).toBeNull()
  })
})

describe('groupArticle', () => {
  it('เผยแพร่แล้วอยู่กลุ่ม done เสมอ ไม่ว่าสิทธิ์ใด', () => {
    expect(groupArticle('PUBLISHED', true, false)).toBe('done')
    expect(groupArticle('PUBLISHED', false, true)).toBe('done')
  })

  it('คนที่จัดการได้เห็นงานค้างของตัวเองอยู่กลุ่ม mine', () => {
    expect(groupArticle('DRAFT', true, false)).toBe('mine')
    expect(groupArticle('CHANGES_REQUESTED', true, false)).toBe('mine')
    expect(groupArticle('WAITING_CLIENT', true, false)).toBe('waiting')
  })

  it('ลูกค้าเห็นเฉพาะงานที่รอตัวเองตอบอยู่กลุ่ม mine', () => {
    expect(groupArticle('WAITING_CLIENT', false, true)).toBe('mine')
    expect(groupArticle('IN_PROGRESS', false, true)).toBe('waiting')
  })

  it('ไม่มีสิทธิ์ทั้งสองอย่าง = ได้แต่รอ', () => {
    expect(groupArticle('DRAFT', false, false)).toBe('waiting')
  })
})

describe('collectArticleFiles', () => {
  it('รวมไฟล์จาก submission และไฟล์เก่า เรียงใหม่ไปเก่า', () => {
    const article = buildArticle({
      submissions: [
        {
          id: 'sub-1',
          stageCode: 'SUBMIT_ARTICLE',
          round: 1,
          message: null,
          linkUrl: null,
          createdAt: new Date('2026-08-02T00:00:00.000Z'),
          authorName: null,
          files: [file({ id: 'new', createdAt: new Date('2026-08-05T00:00:00.000Z') })],
        },
      ],
      legacyFiles: [
        file({ id: 'old', kind: 'COVER_IMAGE', createdAt: new Date('2026-08-01T00:00:00.000Z') }),
      ],
    })

    const entries = collectArticleFiles(article)

    expect(entries.map((entry) => entry.id)).toEqual(['new', 'old'])
    expect(entries[0]).toMatchObject({ stageCode: 'SUBMIT_ARTICLE', round: 1 })
    // ไฟล์เก่าไม่มี submission → ผูก stage ตามชนิดไฟล์ และไม่มีเลขรอบ
    expect(entries[1]).toMatchObject({ stageCode: 'SUBMIT_FINAL', round: null })
  })
})
