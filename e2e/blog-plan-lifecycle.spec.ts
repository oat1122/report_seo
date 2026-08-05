import { db, resetBlogPlan } from './fixtures/db'
import { E2E_KEYWORD, FIXTURE_FILE, STATUS_LABEL } from './fixtures/constants'
import {
  approveStage,
  articleCard,
  boardUrl,
  createArticle,
  expandCard,
  expectStatus,
  openBoard,
  requestChanges,
  submitStage,
  todayInputValue,
} from './fixtures/blog-plan'
import { expect, test } from './fixtures/test'

const TITLE = 'E2E · ไล่ครบ 7 ขั้นตอน'

test.beforeEach(async ({ ids }) => {
  await resetBlogPlan(ids)
})

test('ทีมเขียน → ลูกค้า → เผยแพร่ ครบ 7 ขั้นตอน รวมรอบลูกค้าขอแก้', async ({
  writerPage,
  customerPage,
  ids,
}) => {
  // 1) ทีมเขียนสร้างบทความพร้อมเลือก keyword ของลูกค้า
  await openBoard(writerPage, boardUrl.writer(ids.customerUserId))
  await createArticle(writerPage, {
    title: TITLE,
    keyword: E2E_KEYWORD,
    startDate: todayInputValue(),
  })

  let writerCard = articleCard(writerPage, TITLE)
  await expect(writerCard.getByText(E2E_KEYWORD)).toBeVisible()
  await expectStatus(writerCard, 'ร่าง')

  // 2) ส่งหัวข้อ + แนบไฟล์บทความ
  await submitStage(writerPage, writerCard, {
    stageLabel: 'ส่งหัวข้อ / Main Idea',
    message: 'เสนอหัวข้อรอบแรก ลองอ่านดูครับ',
    filePath: FIXTURE_FILE.articleDoc,
  })
  await expectStatus(writerCard, STATUS_LABEL.waitingClient)

  // 3) ลูกค้าอนุมัติหัวข้อ
  await openBoard(customerPage, boardUrl.customer(ids.customerUserId))
  const customerCard = articleCard(customerPage, TITLE)
  await expectStatus(customerCard, STATUS_LABEL.waitingClient)
  await approveStage(customerCard)
  await expectStatus(customerCard, STATUS_LABEL.inProgress)

  // 4) ทีมส่งบทความฉบับเต็ม
  await writerPage.reload()
  writerCard = articleCard(writerPage, TITLE)
  await submitStage(writerPage, writerCard, {
    stageLabel: 'ส่งบทความฉบับเต็ม',
    message: 'บทความฉบับเต็มรอบที่ 1',
    filePath: FIXTURE_FILE.articleDoc,
  })
  await expectStatus(writerCard, STATUS_LABEL.waitingClient)

  // 5) ลูกค้าขอแก้ → pipeline ย้อนกลับไปที่ทีมเขียน
  await customerPage.reload()
  await expectStatus(customerCard, STATUS_LABEL.waitingClient)
  await requestChanges(customerPage, customerCard, 'ย่อหน้าแรกยาวไป ช่วยตัดให้สั้นลงหน่อย')
  await expectStatus(customerCard, STATUS_LABEL.changesRequested)

  // 6) ทีมส่งใหม่รอบ 2 ใน stage เดิม
  await writerPage.reload()
  writerCard = articleCard(writerPage, TITLE)
  await expandCard(writerCard)
  await writerCard.getByRole('button', { name: 'ส่งงาน: ส่งบทความฉบับเต็ม' }).click()
  const resubmitDialog = writerPage.getByRole('dialog')
  await expect(resubmitDialog.getByText('ส่งใหม่ (รอบ 2)')).toBeVisible()
  await resubmitDialog.locator('#submit-message').fill('แก้ย่อหน้าแรกให้สั้นลงแล้วครับ')
  await resubmitDialog.getByRole('button', { name: 'ส่งให้ลูกค้า' }).click()
  await expect(resubmitDialog).toBeHidden()
  await expectStatus(writerCard, STATUS_LABEL.waitingClient)

  // 7) ลูกค้าอนุมัติบทความ
  await customerPage.reload()
  await approveStage(customerCard)
  await expectStatus(customerCard, STATUS_LABEL.inProgress)

  // 8) ทีมส่งภาพปก
  await writerPage.reload()
  writerCard = articleCard(writerPage, TITLE)
  await submitStage(writerPage, writerCard, {
    stageLabel: 'ส่งภาพประกอบ / ภาพปก',
    message: 'ภาพปกตามคอนเซปต์ที่คุยกันไว้',
    filePath: FIXTURE_FILE.coverImage,
  })
  await expectStatus(writerCard, STATUS_LABEL.waitingClient)

  // 9) ลูกค้าอนุมัติขั้นสุดท้าย
  await customerPage.reload()
  await approveStage(customerCard)
  await expectStatus(customerCard, STATUS_LABEL.approved)

  // 10) ทีมลงเว็บ → เผยแพร่
  await writerPage.reload()
  writerCard = articleCard(writerPage, TITLE)
  await submitStage(writerPage, writerCard, {
    stageLabel: 'อัปโหลดขึ้นเว็บไซต์',
    message: 'ขึ้นเว็บไซต์เรียบร้อย',
    linkUrl: 'https://www.my-domain-report.com/blog/e2e',
  })
  await expectStatus(writerCard, STATUS_LABEL.published)
  // PUBLISHED ย้ายการ์ดไปกลุ่ม "เสร็จแล้ว" → remount แบบย่อ ต้องกางก่อนถึงเห็นสรุปใน thread
  await expandCard(writerCard)
  await expect(writerCard.getByText('ผ่านครบทั้ง 7 ขั้นตอนแล้ว')).toBeVisible()

  // ฝั่งลูกค้าเห็นบทความย้ายไปกลุ่ม "เสร็จแล้ว"
  await customerPage.reload()
  await expectStatus(customerCard, STATUS_LABEL.published)

  // ตรวจสถานะจริงใน DB — UI กับ DB ต้องตรงกัน
  const article = await db.blogArticle.findFirst({
    where: { customerId: ids.customerId, title: TITLE },
    include: { stages: true, submissions: true, feedbacks: true },
  })
  expect(article?.status).toBe('PUBLISHED')
  expect(article?.stages.filter((stage) => stage.submittedAt)).toHaveLength(7)
  expect(article?.submissions).toHaveLength(5)
  expect(article?.feedbacks.filter((f) => f.decision === 'CHANGES_REQUESTED')).toHaveLength(1)
  expect(article?.feedbacks.filter((f) => f.decision === 'APPROVED')).toHaveLength(3)
})
