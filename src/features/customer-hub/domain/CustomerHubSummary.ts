export interface CustomerHubSummary {
  customerName: string | null
  domain: string | null
  metrics: {
    domainRating: number
    healthScore: number
    organicTraffic: number
    organicKeywords: number
    backlinks: number
    refDomains: number
  } | null
  counts: {
    keywords: number
    recommendations: number
    activeWorkPlans: number
    paymentPlans: number
  }
  workProgressAvgPercent: number | null
}
