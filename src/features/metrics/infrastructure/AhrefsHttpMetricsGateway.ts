import type {
  AhrefsDomainMetrics,
  AhrefsMetricsGateway,
} from '../application/ports/AhrefsMetricsGateway'

const AHREFS_BASE = 'https://api.ahrefs.com/v3/site-explorer'
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
    const apiKey = process.env.AHREFS_API_KEY
    if (!apiKey) throw new Error('AHREFS_API_KEY is not set')

    const target = normalizeTarget(domain)
    const [dr, stats] = await Promise.all([
      this.getJson<DomainRatingResponse>('domain-rating', { target, date }, apiKey),
      this.getJson<BacklinksStatsResponse>('backlinks-stats', { target, date }, apiKey),
    ])

    return {
      domainRating: Math.round(
        requireFiniteNumber(dr.domain_rating?.domain_rating, 'domain_rating'),
      ),
      backlinks: requireFiniteNumber(stats.metrics?.live, 'backlinks.live'),
      refDomains: requireFiniteNumber(stats.metrics?.live_refdomains, 'backlinks.live_refdomains'),
    }
  }

  private async getJson<T>(
    endpoint: string,
    params: Record<string, string>,
    apiKey: string,
  ): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${AHREFS_BASE}/${endpoint}?${qs}`, {
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
