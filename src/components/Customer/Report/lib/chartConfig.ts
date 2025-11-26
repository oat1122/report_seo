// src/components/Customer/Report/lib/chartConfig.ts
/**
 * Centralized configuration for Recharts components
 * Ensures consistent styling across all trend charts
 */

// --- Color Palette ---
export const CHART_COLORS = {
  // Primary colors for different metrics
  primary: "#667eea", // Domain Rating (Purple)
  secondary: "#764ba2", // Secondary purple for gradients
  traffic: "#22c55e", // Organic Traffic (Green)
  keywords: "#9592ff", // Organic Keywords (Light Purple)
  backlinks: "#3b82f6", // Backlinks (Blue)
  refDomains: "#a78bfa", // Ref Domains (Lighter Purple)
  spamScore: "#ef4444", // Spam Score (Red)
  healthScore: "#10b981", // Health Score (Emerald)

  // UI Colors
  grid: "#f0f0f0", // Grid lines
  cursor: "#cbd5e0", // Tooltip cursor line
  text: "#a0aec0", // Axis text
  textDark: "#64748b", // Darker text for labels

  // Trend indicators (match existing theme)
  up: "#059669", // Green - positive trend
  down: "#dc2626", // Red - negative trend
  neutral: "#64748b", // Gray - no change
} as const;

// --- Common Recharts Props ---
export const COMMON_CHART_PROPS = {
  syncId: "seo-dashboard-sync", // Key for synchronizing tooltips across charts
  margin: { top: 10, right: 30, left: 0, bottom: 0 },
} as const;

// --- Layout Classes (Tailwind) ---
export const CHART_LAYOUT = {
  // Combined chart: taller height for single chart view
  containerHeight: "w-full h-80 sm:h-96",
  // Card styling matching existing theme
  cardBase:
    "bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
  // Section header
  header: "text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2",
  // Section title (larger)
  sectionTitle: "text-lg font-bold text-gray-800 dark:text-gray-100",
} as const;

// --- Period Options ---
export type PeriodOption = 7 | 30 | 90;

export const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
];

export const DEFAULT_PERIOD: PeriodOption = 30;

// --- Metric Series Definitions for Combined Chart ---
export interface MetricSeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  unit?: string;
  defaultVisible: boolean;
}

export const DOMAIN_METRICS_SERIES: MetricSeriesConfig[] = [
  {
    dataKey: "domainRating",
    name: "Domain Rating",
    color: CHART_COLORS.primary,
    unit: "",
    defaultVisible: true,
  },
  {
    dataKey: "healthScore",
    name: "Health Score",
    color: CHART_COLORS.healthScore,
    unit: "",
    defaultVisible: true,
  },
  {
    dataKey: "organicTraffic",
    name: "Organic Traffic",
    color: CHART_COLORS.traffic,
    unit: "",
    defaultVisible: true,
  },
  {
    dataKey: "organicKeywords",
    name: "Organic Keywords",
    color: CHART_COLORS.keywords,
    unit: "",
    defaultVisible: false,
  },
  {
    dataKey: "backlinks",
    name: "Backlinks",
    color: CHART_COLORS.backlinks,
    unit: "",
    defaultVisible: false,
  },
  {
    dataKey: "refDomains",
    name: "Ref. Domains",
    color: CHART_COLORS.refDomains,
    unit: "",
    defaultVisible: false,
  },
  {
    dataKey: "spamScore",
    name: "Spam Score",
    color: CHART_COLORS.spamScore,
    unit: "%",
    defaultVisible: false,
  },
];

// --- Legacy Chart Series Definitions (for backward compatibility) ---
export const METRICS_CHART_SERIES = {
  healthScore: {
    charts: [
      {
        title: "Health & Rating",
        series: [
          {
            dataKey: "domainRating",
            name: "Domain Rating",
            color: CHART_COLORS.primary,
            yAxisId: "left",
          },
          {
            dataKey: "healthScore",
            name: "Health Score",
            color: CHART_COLORS.secondary,
            yAxisId: "left",
            strokeDasharray: "5 5",
          },
        ],
        domain: [0, 100],
        showXAxis: false,
      },
    ],
  },
  volume: {
    charts: [
      {
        title: "Traffic & Keywords",
        series: [
          {
            dataKey: "organicTraffic",
            name: "Organic Traffic",
            color: CHART_COLORS.traffic,
            yAxisId: "left",
          },
          {
            dataKey: "organicKeywords",
            name: "Organic Keywords",
            color: CHART_COLORS.keywords,
            yAxisId: "right",
            strokeDasharray: "5 5",
          },
        ],
        showXAxis: false,
      },
    ],
  },
  authority: {
    charts: [
      {
        title: "Backlinks & Ref. Domains",
        series: [
          {
            dataKey: "backlinks",
            name: "Backlinks",
            color: CHART_COLORS.backlinks,
            yAxisId: "left",
          },
          {
            dataKey: "refDomains",
            name: "Ref. Domains",
            color: CHART_COLORS.refDomains,
            yAxisId: "right",
            strokeDasharray: "5 5",
          },
        ],
        showXAxis: true, // Only bottom chart shows X axis
      },
    ],
  },
} as const;

// --- Tooltip Styling ---
export const TOOLTIP_STYLES = {
  container:
    "bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700",
  label: "font-bold text-gray-700 dark:text-gray-200 mb-2",
  value: "text-gray-600 dark:text-gray-300",
} as const;

// --- Keyword Chart Configuration ---
export const MAX_SELECTED_KEYWORDS = 5;

// Color palette for multi-keyword charts (10 distinct colors)
export const KEYWORD_COLORS = [
  "#3b82f6", // Blue
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#22c55e", // Green
  "#ec4899", // Pink
  "#eab308", // Yellow
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
] as const;

// Y-axis tick values for position chart (showing key thresholds)
export const POSITION_Y_AXIS_TICKS = [1, 5, 10, 20, 50, 100] as const;

/**
 * Get color for keyword by index
 * @param index - Keyword index
 * @returns Color hex string
 */
export const getKeywordColor = (index: number): string => {
  return KEYWORD_COLORS[index % KEYWORD_COLORS.length];
};
