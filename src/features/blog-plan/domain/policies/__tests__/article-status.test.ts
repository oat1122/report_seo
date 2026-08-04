import { describe, it, expect } from 'vitest'
import { deriveArticleStatus, getNextPendingStage } from '../article-status'
import { buildStageSchedule, getPrecedingWriterStage } from '../stage-schedule'
import type { BlogStageCode } from '../../BlogArticle'

const submit = (...codes: BlogStageCode[]) => codes

describe('deriveArticleStatus', () => {
  it('ยังไม่ส่งอะไรเลย = DRAFT', () => {
    expect(deriveArticleStatus({ submittedStageCodes: [], latestFeedback: null })).toBe('DRAFT')
  })

  it('writer ส่งหัวข้อแล้ว = รอลูกค้า', () => {
    expect(
      deriveArticleStatus({ submittedStageCodes: submit('SUBMIT_TOPIC'), latestFeedback: null }),
    ).toBe('WAITING_CLIENT')
  })

  it('ลูกค้าอนุมัติหัวข้อ = กลับมาที่ writer', () => {
    expect(
      deriveArticleStatus({
        submittedStageCodes: submit('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC'),
        latestFeedback: { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'APPROVED' },
      }),
    ).toBe('IN_PROGRESS')
  })

  it('ลูกค้าขอแก้ = CHANGES_REQUESTED (stage ที่ส่งไปถูกล้างแล้ว)', () => {
    expect(
      deriveArticleStatus({
        submittedStageCodes: [],
        latestFeedback: { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'CHANGES_REQUESTED' },
      }),
    ).toBe('DRAFT')

    expect(
      deriveArticleStatus({
        submittedStageCodes: submit('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC'),
        latestFeedback: { stageCode: 'CLIENT_FEEDBACK_ARTICLE', decision: 'CHANGES_REQUESTED' },
      }),
    ).toBe('CHANGES_REQUESTED')
  })

  it('ลูกค้าอนุมัติขั้นสุดท้ายแล้วแต่ยังไม่ขึ้นเว็บ = APPROVED', () => {
    expect(
      deriveArticleStatus({
        submittedStageCodes: submit(
          'SUBMIT_TOPIC',
          'CLIENT_FEEDBACK_TOPIC',
          'SUBMIT_ARTICLE',
          'CLIENT_FEEDBACK_ARTICLE',
          'SUBMIT_ARTWORK',
          'CLIENT_FINAL_APPROVAL',
        ),
        latestFeedback: { stageCode: 'CLIENT_FINAL_APPROVAL', decision: 'APPROVED' },
      }),
    ).toBe('APPROVED')
  })

  it('ขึ้นเว็บแล้ว = PUBLISHED', () => {
    expect(
      deriveArticleStatus({
        submittedStageCodes: submit('SUBMIT_TOPIC', 'UPLOAD_ON_WEBSITE'),
        latestFeedback: null,
      }),
    ).toBe('PUBLISHED')
  })
})

describe('getNextPendingStage', () => {
  it('คืน stage แรกที่ยังไม่ส่ง', () => {
    expect(getNextPendingStage(submit('SUBMIT_TOPIC'))).toBe('CLIENT_FEEDBACK_TOPIC')
  })
})

describe('buildStageSchedule', () => {
  it('ไล่ due date สะสมตามจำนวนวันของแต่ละ stage', () => {
    const schedule = buildStageSchedule(new Date('2026-08-01T00:00:00.000Z'))
    expect(schedule).toHaveLength(7)
    expect(schedule[0].dueDate?.toISOString().slice(0, 10)).toBe('2026-08-06') // +5
    expect(schedule[1].dueDate?.toISOString().slice(0, 10)).toBe('2026-08-10') // +4
    expect(schedule[6].dueDate?.toISOString().slice(0, 10)).toBe('2026-08-29') // +0
  })

  it('ไม่มี startDate = ไม่กำหนด due date', () => {
    expect(buildStageSchedule(null).every((s) => s.dueDate === null)).toBe(true)
  })
})

describe('getPrecedingWriterStage', () => {
  it('หา stage ของ writer ที่อยู่ก่อนหน้า stage ของลูกค้า', () => {
    expect(getPrecedingWriterStage('CLIENT_FEEDBACK_TOPIC')).toBe('SUBMIT_TOPIC')
    expect(getPrecedingWriterStage('CLIENT_FINAL_APPROVAL')).toBe('SUBMIT_ARTWORK')
    expect(getPrecedingWriterStage('SUBMIT_TOPIC')).toBeNull()
  })
})
