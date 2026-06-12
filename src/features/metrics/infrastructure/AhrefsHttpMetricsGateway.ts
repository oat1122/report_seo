import type {
  AhrefsDomainMetrics,
  AhrefsFullMetrics,
  AhrefsMetricsGateway,
} from '../application/ports/AhrefsMetricsGateway'

const SITE_EXPLORER_BASE = 'https://api.ahrefs.com/v3/site-explorer'
const SITE_AUDIT_BASE = 'https://api.ahrefs.com/v3/site-audit'
const REQUEST_TIMEOUT_MS = 15_000

interface DomainRatingResponse {
  domain_rating?: { domain_rating?: number; ahrefs_rank?: number | null }
}

interface BacklinksStatsResponse {
  metrics?: {
    live?: number
    live_refdomains?: number
    all_time?: number
    all_time_refdomains?: number
  }
}

interface SiteMetricsResponse {
  metrics?: {
    org_traffic?: number
    org_keywords?: number
  }
}

interface SiteAuditProjectsResponse {
  healthscores?: Array<{
    health_score?: number | null
    target_url?: string
  }>
}

// Customer.domain ควรเก็บเป็น bare domain แต่กันเคสที่เผลอเก็บ protocol นำหน้า
const normalizeTarget = (domain: string): string => domain.trim().replace(/^https?:\/\//i, '')

function requireFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Ahrefs returned invalid ${field}: ${String(value)}`)
  }
  return value
}

export class AhrefsHttpMetricsGateway implements AhrefsMetricsGateway {
  async fetchDomainMetrics(domain: string, date: string): Promise<AhrefsDomainMetrics> {
    const apiKey = this.requireApiKey()
    const target = normalizeTarget(domain)
    const [domainRating, stats] = await Promise.all([
      this.getDomainRating(target, date, apiKey),
      this.getBacklinksStats(target, date, apiKey),
    ])
    return { domainRating, ...stats }
  }

  async fetchFullMetrics(domain: string, date: string): Promise<AhrefsFullMetrics> {
    const apiKey = this.requireApiKey()
    const target = normalizeTarget(domain)
    const [domainRating, stats, organic, healthScore] = await Promise.all([
      this.getDomainRating(target, date, apiKey),
      this.getBacklinksStats(target, date, apiKey),
      this.getOrganicMetrics(target, date, apiKey),
      this.getHealthScore(target, apiKey),
    ])
    return { domainRating, ...stats, ...organic, healthScore }
  }

  private requireApiKey(): string {
    const apiKey = process.env.AHREFS_API_KEY
    if (!apiKey) throw new Error('AHREFS_API_KEY is not set')
    return apiKey
  }

  private async getDomainRating(target: string, date: string, apiKey: string): Promise<number> {
    const dr = await this.getJson<DomainRatingResponse>(
      SITE_EXPLORER_BASE,
      'domain-rating',
      { target, date },
      apiKey,
    )
    return Math.round(requireFiniteNumber(dr.domain_rating?.domain_rating, 'domain_rating'))
  }

  private async getBacklinksStats(
    target: string,
    date: string,
    apiKey: string,
  ): Promise<{ backlinks: number; refDomains: number }> {
    const stats = await this.getJson<BacklinksStatsResponse>(
      SITE_EXPLORER_BASE,
      'backlinks-stats',
      { target, date },
      apiKey,
    )
    return {
      backlinks: requireFiniteNumber(stats.metrics?.live, 'backlinks.live'),
      refDomains: requireFiniteNumber(stats.metrics?.live_refdomains, 'backlinks.live_refdomains'),
    }
  }

  private async getOrganicMetrics(
    target: string,
    date: string,
    apiKey: string,
  ): Promise<{ organicTraffic: number; organicKeywords: number }> {
    const res = await this.getJson<SiteMetricsResponse>(
      SITE_EXPLORER_BASE,
      'metrics',
      { target, date },
      apiKey,
    )
    return {
      organicTraffic: Math.round(requireFiniteNumber(res.metrics?.org_traffic, 'metrics.org_traffic')),
      organicKeywords: Math.round(
        requireFiniteNumber(res.metrics?.org_keywords, 'metrics.org_keywords'),
      ),
    }
  }

  // Health Score มาจาก Site Audit (ต้องมี project ของโดเมน) — best-effort: คืน null เมื่อไม่มี/ล้มเหลว
  private async getHealthScore(target: string, apiKey: string): Promise<number | null> {
    try {
      const res = await this.getJson<SiteAuditProjectsResponse>(
        SITE_AUDIT_BASE,
        'projects',
        { project_url: target },
        apiKey,
      )
      const match = res.healthscores?.find(
        (h) => typeof h.health_score === 'number' && Number.isFinite(h.health_score),
      )
      return match ? Math.round(match.health_score as number) : null
    } catch {
      return null
    }
  }

  private async getJson<T>(
    base: string,
    endpoint: string,
    params: Record<string, string>,
    apiKey: string,
  ): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${base}/${endpoint}?${qs}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new Error(`Ahrefs ${endpoint} responded ${res.status}`)
      }
      return (await res.json()) as T
    } finally {
      clearTimeout(timeout)
    }
  }
}
