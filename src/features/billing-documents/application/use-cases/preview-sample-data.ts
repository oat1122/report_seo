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

const SAMPLE_GENERATED_AT = new Date('2026-05-29T00:00:00.000Z')

export function buildSampleRenderData(
  type: BillingDocumentType,
  company: CompanySettings,
  includeVat: boolean,
): RenderData {
  return {
    type,
    documentNumber: `${DOCUMENT_TYPE_PREFIXES[type]}-2026-0001`,
    company,
    customer: {
      name: 'บริษัท ลูกค้าตัวอย่าง จำกัด',
      address: '99/9 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      taxId: '0105560000001',
      contactName: 'คุณสมชาย ใจดี',
      phone: '081-234-5678',
      email: 'customer@example.com',
    },
    items: [
      {
        description: 'บริการทำ SEO รายเดือน (แพ็กเกจ Standard)',
        quantity: 1,
        unit: 'เดือน',
        unitPrice: 15000,
      },
      {
        description: 'เขียนบทความ SEO ลงเว็บไซต์',
        quantity: 4,
        unit: 'บทความ',
        unitPrice: 1500,
      },
      {
        description: 'ออกแบบ Banner โปรโมชัน',
        quantity: 2,
        unit: 'ชิ้น',
        unitPrice: 2500,
      },
    ],
    note: 'ขอบคุณที่ใช้บริการ กรุณาชำระเงินภายในวันที่กำหนด',
    dueDate: '2026-06-15',
    paidDate: type === 'RECEIPT' ? '2026-05-29' : null,
    generatedAt: SAMPLE_GENERATED_AT,
    includeVat,
  }
}
