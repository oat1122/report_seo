// src/components/Customer/Report/lib/chartConfig.ts
// สีและ config สำหรับ charts ในรายงาน — mirror จาก src/theme/theme.ts ผ่าน globals.css

// --- Color palette via CSS variables ---
// ใช้กับ inline style เช่น style={{ color: CHART_COLORS.primary }} หรือใน SVG stroke/fill
export const CHART_COLORS = {
  // Series colors
  primary: 'var(--info)', // Domain Rating — info.main
  secondary: 'var(--info)', // Secondary purple — fallback to info
  traffic: 'var(--secondary)', // Organic Traffic — secondary.main (bright green)
  keywords: 'var(--accent)', // Organic Keywords — info.light
  backlinks: 'var(--primary)', // Backlinks — primary.main
  refDomains: 'var(--info)', // Ref Domains — info.main
  spamScore: 'var(--destructive)', // Spam Score — error
  healthScore: 'var(--success)', // Health Score — success

  // UI colors
  grid: 'var(--border)',
  text: 'var(--muted-foreground)',

  // Trend (semantic)
  up: 'var(--success)',
  down: 'var(--destructive)',
  neutral: 'var(--muted-foreground)',
} as const

// --- Position chart clipping ---
export const POSITION_CLIP_THRESHOLD = 20

// --- Period options ---
export type PeriodOption = 7 | 30 | 90

export const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
  { value: 90, label: '90D' },
]

export const DEFAULT_PERIOD: PeriodOption = 30

// --- Spam score --- เกินค่านี้ = โซนอันตราย (ใช้ร่วมกัน timeline / metrics card / status banner)
export const SPAM_DANGER_THRESHOLD = 2

// --- Metric series definitions for combined chart ---
// สีตาม UI Kit Data viz: series หลัก chart-1, health/คาดการณ์ chart-2 · green brand (chart-4) ห้ามเป็นเส้น
export interface MetricSeriesConfig {
  dataKey: string
  name: string
  color: string
  unit?: string
  defaultVisible: boolean
  axisType: 'score' | 'volume' // score: 0-100 (left), volume: dynamic (right)
}

export const DOMAIN_METRICS_SERIES: MetricSeriesConfig[] = [
  {
    dataKey: 'domainRating',
    name: 'Domain Rating',
    color: 'var(--chart-1)',
    defaultVisible: true,
    axisType: 'score',
  },
  {
    dataKey: 'healthScore',
    name: 'Health Score',
    color: 'var(--chart-2)',
    defaultVisible: true,
    axisType: 'score',
  },
  {
    dataKey: 'organicTraffic',
    name: 'Organic Traffic',
    color: 'var(--chart-5)',
    defaultVisible: false,
    axisType: 'volume',
  },
  {
    dataKey: 'organicKeywords',
    name: 'Organic Keywords',
    color: 'var(--chart-3)',
    defaultVisible: false,
    axisType: 'volume',
  },
  {
    dataKey: 'backlinks',
    name: 'Backlinks',
    color: 'var(--primary)',
    defaultVisible: false,
    axisType: 'volume',
  },
  {
    dataKey: 'refDomains',
    name: 'Ref. Domains',
    color: 'var(--muted-foreground)',
    defaultVisible: false,
    axisType: 'volume',
  },
  {
    dataKey: 'spamScore',
    name: 'Spam Score',
    color: CHART_COLORS.spamScore,
    unit: '%',
    defaultVisible: false,
    axisType: 'score',
  },
]

// --- Keyword chart config ---
export const MAX_SELECTED_KEYWORDS = 5

// Color palette สำหรับ multi-keyword chart — chart-1..5 + extras (mirror theme tokens)
export const KEYWORD_COLORS = [
  'var(--chart-2)', // info.main (purple)
  'var(--chart-1)', // secondary.main (green)
  'var(--chart-5)', // primary.main (dark grey)
  'var(--destructive)',
  'var(--warning)',
  'var(--chart-4)', // info.light
  'var(--chart-3)', // secondary.light
  'var(--success)',
  'var(--info)',
  'var(--muted-foreground)',
] as const

export const getKeywordColor = (index: number): string =>
  KEYWORD_COLORS[index % KEYWORD_COLORS.length]
