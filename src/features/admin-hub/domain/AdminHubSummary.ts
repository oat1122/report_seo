export interface CustomerHubCard {
  id: string
  name: string
  domain: string
  userId: string
  seoDevName: string | null
  createdAt: string
  metrics: {
    domainRating: number
    healthScore: number
    organicTraffic: number
    organicKeywords: number
    backlinks: number
    refDomains: number
    spamScore: number
  } | null
  counts: {
    keywords: number
    recommendations: number
    aiOverviews: number
    paymentPlans: number
    workProgressPlans: number
  }
  workProgressAvgPercent: number | null
}

export interface AdminHubSummary {
  userCounts: {
    ADMIN: number
    SEO_DEV: number
    CUSTOMER: number
  }
  customers: CustomerHubCard[]
}
