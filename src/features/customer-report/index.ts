import { PrismaCustomerProfileRepository } from "./infrastructure/PrismaCustomerProfileRepository";
import { getCustomerReportUseCase } from "./application/use-cases/getCustomerReport";
import { getCustomerHistoryReportUseCase } from "./application/use-cases/getCustomerHistoryReport";

const profileRepo = new PrismaCustomerProfileRepository();

export const getCustomerReport = getCustomerReportUseCase(profileRepo);
export const getCustomerHistoryReport = getCustomerHistoryReportUseCase();

export type {
  CustomerReportSnapshot,
  CustomerHistoryReport,
} from "./domain/CustomerReportSnapshot";
