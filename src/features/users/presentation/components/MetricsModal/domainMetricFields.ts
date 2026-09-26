import type { OverallMetricsForm } from '@/types'

export type MetricsFieldKey = keyof OverallMetricsForm

export interface MetricFieldConfig {
  key: MetricsFieldKey
  label: string
  placeholder: string
  helperText: string
  min?: number
  max?: number
  step?: string | number
}

export interface MetricGroupConfig {
  num: number
  title: string
  description: string
  fields: MetricFieldConfig[]
  /** grid ตามความกว้างคอลัมน์เนื้อหา (@container ของ DomainDataManager) */
  cols: string
}

export const METRIC_GROUPS: MetricGroupConfig[] = [
  {
    num: 1,
    title: 'Authority',
    description: 'ค่าความน่าเชื่อถือและคุณภาพของโดเมน',
    fields: [
      {
        key: 'domainRating',
        label: 'Domain Rating',
        placeholder: 'เช่น 42',
        helperText: 'ความแข็งแรงของโดเมน',
        min: 0,
      },
      {
        key: 'healthScore',
        label: 'Health Score',
        placeholder: '0-100',
        helperText: 'คะแนนสุขภาพเว็บไซต์',
        min: 0,
        max: 100,
      },
      {
        key: 'spamScore',
        label: 'Spam Score',
        placeholder: '0-100',
        helperText: 'คะแนนความเสี่ยง (ใส่ทศนิยมได้)',
        min: 0,
        max: 100,
        step: 0.1,
      },
    ],
    cols: 'grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3',
  },
  {
    num: 2,
    title: 'Visibility',
    description: 'ตัวเลขที่แสดงการมองเห็นของโดเมน',
    fields: [
      {
        key: 'organicTraffic',
        label: 'Organic Traffic',
        placeholder: 'เช่น 1200',
        helperText: 'ทราฟฟิกจากการค้นหา',
        min: 0,
      },
      {
        key: 'organicKeywords',
        label: 'Organic Keywords',
        placeholder: 'เช่น 350',
        helperText: 'คีย์เวิร์ดที่ติดอันดับ',
        min: 0,
      },
      {
        key: 'backlinks',
        label: 'Backlinks',
        placeholder: 'เช่น 980',
        helperText: 'ลิงก์ย้อนกลับทั้งหมด',
        min: 0,
      },
      {
        key: 'refDomains',
        label: 'Referring Domains',
        placeholder: 'เช่น 120',
        helperText: 'โดเมนที่ลิงก์กลับมา',
        min: 0,
      },
    ],
    cols: 'grid-cols-1 @md:grid-cols-2',
  },
  {
    num: 3,
    title: 'Domain Age',
    description: 'อายุโดเมนเป็นปีและเดือน (เดือน 0-11)',
    fields: [
      {
        key: 'ageInYears',
        label: 'อายุโดเมน (ปี)',
        placeholder: 'เช่น 2',
        helperText: 'จำนวนปีเต็ม',
        min: 0,
      },
      {
        key: 'ageInMonths',
        label: 'อายุโดเมน (เดือน)',
        placeholder: '0-11',
        helperText: 'เดือนเพิ่มเติม',
        min: 0,
        max: 11,
      },
    ],
    cols: 'grid-cols-1 @md:grid-cols-2',
  },
]

export const ALL_METRIC_FIELDS: MetricFieldConfig[] = METRIC_GROUPS.flatMap((g) => g.fields)
