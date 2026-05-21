import { PrismaMetricsRepository } from "./infrastructure/PrismaMetricsRepository";
import { getMetricsUseCase } from "./application/use-cases/getMetrics";
import { saveMetricsUseCase } from "./application/use-cases/saveMetrics";
import { getMetricsHistoryUseCase } from "./application/use-cases/getMetricsHistory";
import {
  setMetricsHistoryVisibilityUseCase,
  bulkSetMetricsHistoryVisibilityUseCase,
} from "./application/use-cases/setMetricsHistoryVisibility";

const repo = new PrismaMetricsRepository();

export const getMetrics = getMetricsUseCase(repo);
export const saveMetrics = saveMetricsUseCase(repo);
export const getMetricsHistory = getMetricsHistoryUseCase(repo);
export const setMetricsHistoryVisibility =
  setMetricsHistoryVisibilityUseCase(repo);
export const bulkSetMetricsHistoryVisibility =
  bulkSetMetricsHistoryVisibilityUseCase(repo);

export {
  metricsSchema,
  historyVisibilitySchema,
  type MetricsInput,
  type HistoryVisibilityInput,
} from "./schemas";
export type {
  OverallMetrics,
  MetricsHistoryEntry,
} from "./domain/OverallMetrics";
