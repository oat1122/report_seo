export interface OverallMetrics {
  id: string;
  customerId: string;
  domainRating: number;
  healthScore: number;
  ageInYears: number;
  ageInMonths: number;
  spamScore: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  refDomains: number;
  dateRecorded: Date;
}

export interface MetricsHistoryEntry {
  id: string;
  customerId: string;
  domainRating: number;
  healthScore: number;
  ageInYears: number;
  ageInMonths: number;
  spamScore: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  refDomains: number;
  dateRecorded: Date;
  isVisible: boolean;
}
