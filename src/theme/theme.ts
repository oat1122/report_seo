/**
 * Single source of truth ของสีในโปรเจกต์
 *
 * - โค้ดใหม่ใช้ Tailwind utility ที่ผูก CSS variable ใน globals.css เป็นหลัก
 *   (เช่น `bg-info`, `text-foreground`, `border-border`)
 * - globals.css mirror ค่าใน `colors` นี้เป็น CSS variable
 * - import `colors` จากไฟล์นี้ได้สำหรับ inline style หรือ SVG (เช่น chart series, gradient)
 *
 * ห้ามเพิ่ม hex ตรงที่ component — ถ้าต้องการสีใหม่ ให้เพิ่มในไฟล์นี้ที่เดียว
 * แล้ว mirror เข้า globals.css ด้วย
 */
export const colors = {
  // ─── Brand ──────────────────────────────────────────────
  brand: {
    primary: "#2f2f2f",
    primaryContrast: "#FFFFFF",
    secondary: "#31fb4c",
    secondaryLight: "#7dfd91",
    secondaryDark: "#1ce03b",
    secondaryHover: "#29e0a0",
    secondaryContrast: "#2f2f2f",
  },

  // ─── Info (brand purple) ────────────────────────────────
  info: {
    main: "#9592ff",
    light: "#bdbcff",
    dark: "#6c68e8",
    hover: "#837fe8",
    bg: "#eeedff",
    bgSubtle: "#f5f3ff",
    contrast: "#FFFFFF",
  },

  // ─── Info (blue, separate from brand purple) ────────────
  infoBlue: {
    main: "#1e40af",
    bg: "#dbeafe",
  },

  // ─── Success (green) ────────────────────────────────────
  success: {
    main: "#2e7d32",
    light: "#66bb6a",
    dark: "#059669",
    bg: "#e8f5e9",
    bgSubtle: "#ecfdf5",
  },

  // ─── Error (red) ────────────────────────────────────────
  error: {
    main: "#d32f2f",
    light: "#f44336",
    dark: "#c62828",
    bg: "#ffebee",
    bgSubtle: "#fee2e2",
  },

  // ─── Warning (orange) ───────────────────────────────────
  warning: {
    main: "#ed6c02",
    light: "#ff9800",
    dark: "#e65100",
    bg: "#fff3e0",
    bgSubtle: "#fff7e6",
    accent: "#f59e0b",
    accentBg: "#fef3c7",
    accentText: "#92400e",
  },

  // ─── Neutral / Slate scale ──────────────────────────────
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    800: "#1e293b",
  },

  // ─── Background / Surface ───────────────────────────────
  surface: {
    page: "#FFFFFF",
    panel: "#F8F9FA",
    dark: "#0D1117",
  },

  // ─── Text ───────────────────────────────────────────────
  text: {
    primary: "#2f2f2f",
    secondary: "#64748B",
    onDark: "#FFFFFF",
  },

  // ─── Border ─────────────────────────────────────────────
  border: {
    default: "#E2E8F0",
  },

  // ─── Achievement / Medal ────────────────────────────────
  achievement: {
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    glow: "#FFA500",
    glowDark: "#FF8C00",
  },
} as const;

/**
 * Dark mode palette — mirror จาก `.dark { ... }` ใน globals.css
 *
 * ส่วนมากของ component ใช้ Tailwind utility ที่ผูกกับ CSS variable
 * → auto-flip โดยไม่ต้อง import ตัวนี้
 *
 * ใช้ `colorsDark` เฉพาะ inline use case (SVG, gradient, chart series)
 * ที่ pick สีตาม theme ผ่าน `useTheme()` ของ next-themes
 */
export const colorsDark = {
  brand: {
    primary: "#fafafa",
    primaryContrast: "#18181b",
    secondary: "#31fb4c",
    secondaryLight: "#7dfd91",
    secondaryDark: "#1ce03b",
    secondaryHover: "#29e0a0",
    secondaryContrast: "#052e0a",
  },

  // chart-5 ใน dark = zinc-500 (รองรับ white text บน bar)
  chartDarkFive: "#71717a",

  info: {
    main: "#9592ff",
    light: "#bdbcff",
    dark: "#6c68e8",
    hover: "#837fe8",
    bg: "#1a1830",
    bgSubtle: "#13122a",
    contrast: "#fafafa",
  },

  infoBlue: {
    main: "#60a5fa",
    bg: "#172554",
  },

  success: {
    main: "#22c55e",
    light: "#4ade80",
    dark: "#16a34a",
    bg: "#052e0a",
    bgSubtle: "#022c14",
  },

  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
    bg: "#3f0f0f",
    bgSubtle: "#2a0808",
  },

  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    bg: "#3a2400",
    bgSubtle: "#2a1a00",
    accent: "#fbbf24",
    accentBg: "#3a2400",
    accentText: "#fde68a",
  },

  slate: {
    50: "#fafafa",
    100: "#27272a",
    200: "#27272a",
    300: "#3f3f46",
    400: "#71717a",
    500: "#a1a1aa",
    600: "#d4d4d8",
    800: "#fafafa",
  },

  surface: {
    page: "#0a0a0a",
    panel: "#18181b",
    dark: "#000000",
  },

  text: {
    primary: "#fafafa",
    secondary: "#a1a1aa",
    onDark: "#fafafa",
  },

  border: {
    default: "#27272a",
  },

  achievement: {
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    glow: "#FFA500",
    glowDark: "#FF8C00",
  },
} as const;

/** Type ของ palette สำหรับใช้กับ TypeScript */
export type AppColors = typeof colors;
