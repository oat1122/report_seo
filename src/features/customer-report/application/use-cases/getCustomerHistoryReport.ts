import type { CustomerHistoryReport } from "../../domain/CustomerReportSnapshot";
import { getMetricsHistory } from "@/features/metrics";
import {
  getKeywords,
  getKeywordHistoryByCustomer,
} from "@/features/keywords";

export function getCustomerHistoryReportUseCase() {
  return async (
    customerInternalId: string,
    options: { onlyVisible?: boolean } = {},
  ): Promise<CustomerHistoryReport> => {
    const onlyVisible = options.onlyVisible ?? false;

    const [metricsHistory, currentKeywords, keywordHistory] = await Promise.all(
      [
        getMetricsHistory(customerInternalId, { onlyVisible }),
        getKeywords(customerInternalId),
        getKeywordHistoryByCustomer(customerInternalId, { onlyVisible }),
      ],
    );

    // currentKeywords ของ getMetricsHistory เก่าเรียงตาม traffic desc — รักษา wire format
    const sortedKeywords = [...currentKeywords].sort(
      (a, b) => b.traffic - a.traffic,
    );

    return { metricsHistory, keywordHistory, currentKeywords: sortedKeywords };
  };
}
