import { PrismaMetricsRepository } from './infrastructure/PrismaMetricsRepository'
import { AhrefsHttpMetricsGateway } from './infrastructure/AhrefsHttpMetricsGateway'
import { PrismaCustomerDirectory } from './infrastructure/PrismaCustomerDirectory'
import { getMetricsUseCase } from './application/use-cases/getMetrics'
import { saveMetricsUseCase } from './application/use-cases/saveMetrics'
import { getMetricsHistoryUseCase } from './application/use-cases/getMetricsHistory'
import {
  setMetricsHistoryVisibilityUseCase,
  bulkSetMetricsHistoryVisibilityUseCase,
} from './application/use-cases/setMetricsHistoryVisibility'
import { syncCustomerMetricsFromAhrefsUseCase } from './application/use-cases/syncCustomerMetricsFromAhrefs'
import { syncAllCustomerMetricsFromAhrefsUseCase } from './application/use-cases/syncAllCustomerMetricsFromAhrefs'
import { previewCustomerAhrefsMetricsUseCase } from './application/use-cases/previewCustomerAhrefsMetrics'
import { computeAhrefsProposalsUseCase } from './application/use-cases/computeAhrefsProposals'

const repo = new PrismaMetricsRepository()
const ahrefsGateway = new AhrefsHttpMetricsGateway()
const customerDirectory = new PrismaCustomerDirectory()
const syncOneFromAhrefs = syncCustomerMetricsFromAhrefsUseCase(repo, ahrefsGateway)

export const getMetrics = getMetricsUseCase(repo)
export const saveMetrics = saveMetricsUseCase(repo)
export const getMetricsHistory = getMetricsHistoryUseCase(repo)
export const setMetricsHistoryVisibility = setMetricsHistoryVisibilityUseCase(repo)
export const bulkSetMetricsHistoryVisibility = bulkSetMetricsHistoryVisibilityUseCase(repo)
export const syncAllCustomerMetricsFromAhrefs = syncAllCustomerMetricsFromAhrefsUseCase(
  customerDirectory,
  syncOneFromAhrefs,
)
export const previewCustomerAhrefsMetrics = previewCustomerAhrefsMetricsUseCase(
  customerDirectory,
  ahrefsGateway,
)
export const computeAhrefsProposals = computeAhrefsProposalsUseCase(
  customerDirectory,
  repo,
  ahrefsGateway,
)

export {
  metricsSchema,
  historyVisibilitySchema,
  ahrefsSyncPinSchema,
  ahrefsFullMetricsSchema,
  ahrefsProposalMetadataSchema,
  type MetricsInput,
  type HistoryVisibilityInput,
  type AhrefsSyncPinInput,
  type AhrefsFullMetrics,
  type AhrefsProposalMetadata,
} from './schemas'
export type { OverallMetrics, MetricsHistoryEntry } from './domain/OverallMetrics'
export type {
  CustomerSyncResult,
  CustomerSyncStatus,
} from './application/use-cases/syncCustomerMetricsFromAhrefs'
export type { BatchSyncSummary } from './application/use-cases/syncAllCustomerMetricsFromAhrefs'
export type { AhrefsPreviewResult } from './application/use-cases/previewCustomerAhrefsMetrics'
export type {
  AhrefsProposal,
  AhrefsProposalCurrent,
} from './application/use-cases/computeAhrefsProposals'
