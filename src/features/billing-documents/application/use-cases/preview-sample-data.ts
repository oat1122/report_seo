import type { CompanySettings } from '@/features/company-settings/domain/CompanySettings'
import { DOCUMENT_TYPE_PREFIXES, type BillingDocumentType } from '../../domain/DocumentType'
import type { RenderData } from './render-data'

// ข้อมูลบริษัทสำรองสำหรับ dev preview เมื่อยังไม่มี CompanySettings ใน DB
export const SAMPLE_COMPANY: CompanySettings = {
  id: 'sample-company',
  name: 'บริษัท ตัวอย่าง จำกัด',
  address: '123 ถนนตัวอย่าง แขวงทดสอบ เขตทดสอบ กรุงเทพมหานคร 10000',
  taxId: '0105500000000',
  phone: '02-000-0000',
  email: 'contact@example.com',
  logoUrl: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
}

const SAMPLE_GENERATED_AT = new Date('2026-05-29T09:31:48.595Z')

export function buildSampleRenderData(
  type: BillingDocumentType,
  company: CompanySettings,
  includeVat: boolean,
): RenderData {
  return {
    type,
    documentNumber: `${DOCUMENT_TYPE_PREFIXES[type]}-2026-0007`,
    company,
    customer: {
      name: 'Thanaplus Co., Ltd.',
      address: '99/9 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      taxId: '0105560000001',
      contactName: 'คุณสมชาย ใจดี',
      phone: '081-234-5678',
      email: 'customer@example.com',
    },
    items: [
      {
        description:
          'Business Pro price: 15,000 THB/month Focus Keywords: 15 Related Keywords: Unlimited Backlinks: Unlimited',
        detail:
          'Free bonuses (5 items):\n- Keyword analysis\n- Competitor analysis\n- Development consultation\n- Monthly report\n- 2 new articles per month\n Guarantee: Top 10 ranking for 2 keywords',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: 15000,
      },
      {
        description:
          'Business Pro price: 15,000 THB/month Focus Keywords: 15 Related Keywords: Unlimited Backlinks: Unlimited',
        detail:
          'Free bonuses (5 items):\n- Keyword analysis\n- Competitor analysis\n- Development consultation\n- Monthly report\n- 2 new articles per month\n Guarantee: Top 10 ranking for 2 keywords',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: 15000,
      },
      {
        description:
          'Business Pro price: 15,000 THB/month Focus Keywords: 15 Related Keywords: Unlimited Backlinks: Unlimited',
        detail:
          'Free bonuses (5 items):\n- Keyword analysis\n- Competitor analysis\n- Development consultation\n- Monthly report\n- 2 new articles per month\n Guarantee: Top 10 ranking for 2 keywords',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: 15000,
      },
    ],
    note: '555555555555555555',
    dueDate: '2026-05-29',
    paidDate: type === 'RECEIPT' ? '2026-05-29' : null,
    generatedAt: SAMPLE_GENERATED_AT,
    includeVat,
  }
}
