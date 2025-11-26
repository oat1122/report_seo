// src/components/Customer/Report/lib/chartConfig.ts
/**
 * Centralized configuration for Recharts components
 * Ensures consistent styling across all trend charts
 */

// --- Color Palette ---
export const CHART_COLORS = {
  // Primary colors for different metrics
  primary: "#667eea", // Domain Rating, Health Score (Purple)
  secondary: "#764ba2", // Secondary purple for gradients
  traffic: "#31fb4c", // Organic Traffic (Neon Green)
  keywords: "#9592ff", // Organic Keywords (Light Purple)
  backlinks: "#667eea", // Backlinks (Primary Purple)
  refDomains: "#a78bfa", // Ref Domains (Lighter Purple)

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
  margin: { top: 10, right: 10, left: -20, bottom: 0 }, // left -20 to pull chart closer to edge
} as const;

// --- Layout Classes (Tailwind) ---
export const CHART_LAYOUT = {
  // Mobile: h-64 (256px), Desktop (sm+): h-48 (192px)
  containerHeight: "w-full h-64 sm:h-48",
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

// --- Chart Series Definitions ---
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
