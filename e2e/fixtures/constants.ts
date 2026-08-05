import path from 'path'

/** keyword ที่ global-setup ยัดลง KeywordReport ให้ลูกค้าทดสอบ — KeywordPicker ต้องเห็นตัวนี้ */
export const E2E_KEYWORD = 'รับทำ seo e2e'

export const FIXTURE_FILE = {
  articleDoc: path.resolve(__dirname, 'files/article.pdf'),
  coverImage: path.resolve(__dirname, 'files/cover.png'),
} as const

export const STATUS_LABEL = {
  inProgress: 'กำลังดำเนินการ',
  waitingClient: 'รอลูกค้าตอบ',
  changesRequested: 'ลูกค้าขอแก้ไข',
  approved: 'อนุมัติแล้ว',
  published: 'เผยแพร่แล้ว',
} as const
