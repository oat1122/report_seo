import type { CalendarType } from "@schedule-x/calendar";
import { colors, colorsDark } from "@/theme/theme";

export const calendarTypes: Record<string, CalendarType> = {
  "work-progress": {
    colorName: "work-progress",
    lightColors: {
      main: colors.info.main,
      container: colors.info.bg,
      onContainer: colors.text.primary,
    },
    darkColors: {
      main: colorsDark.info.main,
      container: colorsDark.info.bg,
      onContainer: colorsDark.text.primary,
    },
  },
  "payment-paid": {
    colorName: "payment-paid",
    lightColors: {
      main: colors.success.main,
      container: colors.success.bg,
      onContainer: colors.text.primary,
    },
    darkColors: {
      main: colorsDark.success.main,
      container: colorsDark.success.bg,
      onContainer: colorsDark.text.primary,
    },
  },
  "payment-overdue": {
    colorName: "payment-overdue",
    lightColors: {
      main: colors.error.main,
      container: colors.error.bg,
      onContainer: colors.text.primary,
    },
    darkColors: {
      main: colorsDark.error.main,
      container: colorsDark.error.bg,
      onContainer: colorsDark.text.primary,
    },
  },
  "payment-pending": {
    colorName: "payment-pending",
    lightColors: {
      main: colors.warning.main,
      container: colors.warning.bg,
      onContainer: colors.text.primary,
    },
    darkColors: {
      main: colorsDark.warning.main,
      container: colorsDark.warning.bg,
      onContainer: colorsDark.text.primary,
    },
  },
  "payment-reviewing": {
    colorName: "payment-reviewing",
    lightColors: {
      main: colors.slate[500],
      container: colors.slate[100],
      onContainer: colors.text.primary,
    },
    darkColors: {
      main: colorsDark.slate[500],
      container: colorsDark.slate[100],
      onContainer: colorsDark.text.primary,
    },
  },
  "payment-cancelled": {
    colorName: "payment-cancelled",
    lightColors: {
      main: colors.slate[400],
      container: colors.slate[50],
      onContainer: colors.slate[500],
    },
    darkColors: {
      main: colorsDark.slate[400],
      container: colorsDark.slate[100],
      onContainer: colorsDark.slate[500],
    },
  },
};
