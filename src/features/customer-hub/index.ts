import { PrismaCustomerHubRepository } from "./infrastructure/PrismaCustomerHubRepository";
import { getCustomerHubSummaryUseCase } from "./application/use-cases/getCustomerHubSummary";

const repo = new PrismaCustomerHubRepository();

export const getCustomerHubSummary = getCustomerHubSummaryUseCase(repo);

export type { CustomerHubSummary } from "./domain/CustomerHubSummary";
