import { describe, it, expect } from 'vitest'
import { deriveArticleStatus, getNextPendingStage } from '../article-status'
import {
  BLOG_STAGES,
  buildStageSchedule,
  getArticleFlow,
  getFlowStages,
  getPrecedingWriterStage,
} from '../stage-schedule'
import type { BlogStageCode } from '../../BlogArticle'

const submit = (...codes: BlogStageCode[]) => codes
const FULL_FLOW = getFlowStages(true)
const FAST_FLOW = getFlowStages(false)

describe('deriveArticleStatus', () => {
  it('ยังไม่ส่งอะไรเลย = DRAFT', () => {
    expect(
      deriveArticleStatus({ flow: FULL_FLOW, submittedStageCodes: [], latestFeedback: null }),
    ).toBe('DRAFT')
  })

  it('writer ส่งหัวข้อแล้ว = รอลูกค้า', () => {
    expect(
      deriveArticleStatus({
        flow: FULL_FLOW,
        submittedStageCodes: submit('SUBMIT_TOPIC'),
        latestFeedback: null,
      }),
    ).toBe('WAITING_CLIENT')
  })

  it('ลูกค้าอนุมัติหัวข้อ = กลับมาที่ writer', () => {
    expect(
      deriveArticleStatus({
        flow: FULL_FLOW,
        submittedStageCodes: submit('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC'),
        latestFeedback: { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'APPROVED' },
      }),
    ).toBe('IN_PROGRESS')
  })

  it('ลูกค้าขอแก้ = CHANGES_REQUESTED (stage ที่ส่งไปถูกล้างแล้ว)', () => {
    expect(
      deriveArticleStatus({
        flow: FULL_FLOW,
        submittedStageCodes: [],
        latestFeedback: { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'CHANGES_REQUESTED' },
      }),
    ).toBe('DRAFT')

    expect(
      deriveArticleStatus({
        flow: FULL_FLOW,
        submittedStageCodes: submit('SUBMIT_TOPIC', 'CLIENT_FEEDBACK_TOPIC'),
        latestFeedback: { stageCode: 'CLIENT_FEEDBACK_ARTICLE', decision: 'CHANGES_REQUESTED' },
      }),
    ).toBe('CHANGES_REQUESTED')
  })

  it('ส่งครบทั้ง 5 ขั้น = PUBLISHED', () => {
    expect(
      deriveArticleStatus({
        flow: FULL_FLOW,
        submittedStageCodes: submit(
          'SUBMIT_TOPIC',
          'CLIENT_FEEDBACK_TOPIC',
          'SUBMIT_ARTICLE',
          'CLIENT_FEEDBACK_ARTICLE',
          'SUBMIT_FINAL',
        ),
        latestFeedback: { stageCode: 'CLIENT_FEEDBACK_ARTICLE', decision: 'APPROVED' },
      }),
    ).toBe('PUBLISHED')
  })

  it('fast track: ส่งไฟล์ final ขั้นเดียวก็จบ', () => {
    expect(
      deriveArticleStatus({
        flow: FAST_FLOW,
        submittedStageCodes: submit('SUBMIT_FINAL'),
        latestFeedback: null,
      }),
    ).toBe('PUBLISHED')
  })
})

describe('getNextPendingStage', () => {
  it('คืน stage แรกที่ยังไม่ส่ง', () => {
    expect(getNextPendingStage(FULL_FLOW, submit('SUBMIT_TOPIC'))).toBe('CLIENT_FEEDBACK_TOPIC')
  })

  it('fast track ไม่มีขั้นของลูกค้าให้รอ', () => {
    expect(getNextPendingStage(FAST_FLOW, [])).toBe('SUBMIT_FINAL')
    expect(getNextPendingStage(FAST_FLOW, submit('SUBMIT_FINAL'))).toBeNull()
  })
})

describe('getFlowStages / getArticleFlow', () => {
  it('ลูกค้าที่ตรวจงาน = 5 ขั้น · ลูกค้าที่ไม่ตรวจ = ขั้นเดียว', () => {
    expect(FULL_FLOW).toHaveLength(5)
    expect(FAST_FLOW.map((stage) => stage.code)).toEqual(['SUBMIT_FINAL'])
  })

  it('flow ของบทความมาจาก stage row ที่มีจริง', () => {
    expect(getArticleFlow([{ stageCode: 'SUBMIT_FINAL' }])).toEqual(FAST_FLOW)
    expect(getArticleFlow([]).map((stage) => stage.code)).toEqual(
      BLOG_STAGES.map((stage) => stage.code),
    )
  })
})

describe('buildStageSchedule', () => {
  it('ไล่ due date สะสมตามจำนวนวันของแต่ละ stage', () => {
    const schedule = buildStageSchedule(new Date('2026-08-01T00:00:00.000Z'), FULL_FLOW)
    expect(schedule).toHaveLength(5)
    expect(schedule[0].dueDate?.toISOString().slice(0, 10)).toBe('2026-08-06') // +5
    expect(schedule[1].dueDate?.toISOString().slice(0, 10)).toBe('2026-08-10') // +4
    expect(schedule[4].dueDate?.toISOString().slice(0, 10)).toBe('2026-08-24') // +4
  })

  it('fast track ได้ schedule ขั้นเดียว seq เริ่มที่ 1', () => {
    const schedule = buildStageSchedule(new Date('2026-08-01T00:00:00.000Z'), FAST_FLOW)
    expect(schedule).toEqual([
      { stageCode: 'SUBMIT_FINAL', seq: 1, dueDate: new Date('2026-08-05T00:00:00.000Z') },
    ])
  })

  it('ไม่มี startDate = ไม่กำหนด due date', () => {
    expect(buildStageSchedule(null, FULL_FLOW).every((s) => s.dueDate === null)).toBe(true)
  })
})

describe('getPrecedingWriterStage', () => {
  it('หา stage ของ writer ที่อยู่ก่อนหน้า stage ของลูกค้า', () => {
    expect(getPrecedingWriterStage('CLIENT_FEEDBACK_TOPIC')).toBe('SUBMIT_TOPIC')
    expect(getPrecedingWriterStage('CLIENT_FEEDBACK_ARTICLE')).toBe('SUBMIT_ARTICLE')
    expect(getPrecedingWriterStage('SUBMIT_TOPIC')).toBeNull()
  })
})
