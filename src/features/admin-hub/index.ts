import { PrismaAdminHubRepository } from './infrastructure/PrismaAdminHubRepository'
import { getAdminHubSummaryUseCase } from './application/use-cases/getAdminHubSummary'

const repo = new PrismaAdminHubRepository()

export const getAdminHubSummary = getAdminHubSummaryUseCase(repo)

export type { AdminHubSummary, CustomerHubCard } from './domain/AdminHubSummary'
