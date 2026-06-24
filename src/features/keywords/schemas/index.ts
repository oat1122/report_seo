export { keywordSchema, type KeywordInput } from '@/schemas/keyword'
export { historyVisibilitySchema, type HistoryVisibilityInput } from '@/schemas/historyVisibility'

// จำนวนรูปหลักฐานสูงสุดต่อ keyword — client import จาก subpath นี้ได้ (ไม่ดึง Prisma graph)
export const MAX_KEYWORD_EVIDENCE_IMAGES = 3
