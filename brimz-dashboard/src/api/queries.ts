// TanStack Query hooks for every dashboard dataset.
//
// Each hook fetches from the REST API (types generated from its OpenAPI schema)
// and adapts the payload to the exact shape the pages have consumed since the
// mock-data era, so the JSX stays untouched. Presentational extras the backend
// doesn't store (chart colors, icon names) are mapped here by label.

import { useQuery } from '@tanstack/react-query'
import { get } from './client'
import type { components } from './types.gen'

type S = components['schemas']

export const DEMO_EVENT_ID = 1
const STATIC = { staleTime: 5 * 60_000 } // catalogs that only change on reseed
const LIVE = { staleTime: 30_000 } // event-scoped data

// ── formatting helpers ────────────────────────────────────────────────────────

/** '2026-06-15T20:24:00Z' → '8:24' · on the hour → '8 PM' (matches the mock axis). */
export function fmtClock(iso: string): string {
  const d = new Date(iso)
  const h24 = d.getUTCHours()
  const m = d.getUTCMinutes()
  const h12 = h24 % 12 || 12
  const ampm = h24 < 12 ? 'AM' : 'PM'
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')}`
}

/** '8:24 PM' style (always with meridiem) for lists. */
export function fmtClockFull(iso: string): string {
  const d = new Date(iso)
  const h24 = d.getUTCHours()
  const m = d.getUTCMinutes()
  return `${h24 % 12 || 12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

export function human(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${Math.round(n)}`
}

/** Minutes-before-the-newest-timestamp labels for feed lists. */
function agoLabels(isoTimes: (string | null | undefined)[]): string[] {
  const times = isoTimes.map((t) => (t ? new Date(t).getTime() : NaN))
  const newest = Math.max(...times.filter((t) => !Number.isNaN(t)))
  return times.map((t) => {
    if (Number.isNaN(t)) return '—'
    const mins = Math.round((newest - t) / 60_000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min ago`
    return `${Math.round(mins / 60)} hr ago`
  })
}

// ── presentation maps (colors/icons live in the client, not the DB) ──────────

const EMOTION_COLORS: Record<string, string> = {
  Excited: '#f59e0b', Happy: '#22c55e', Hyped: '#a855f7', Joyful: '#3b82f6', Other: '#64748b',
}
const GENDER_COLORS: Record<string, string> = {
  Male: '#3b82f6', Female: '#a855f7', 'Non-binary/Other': '#f59e0b',
}
const REVENUE_COLORS: Record<string, string> = {
  Ticketing: '#f59e0b', Concessions: '#14b8a6', Merchandise: '#a855f7', Sponsorship: '#3b82f6',
}
const MOMENT_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16']
const FALLBACK_COLORS = ['#14b8a6', '#a855f7', '#f59e0b', '#3b82f6', '#ef4444', '#64748b']

const KPI_META: Record<string, { icon: string; color: 'teal' | 'gold' | 'purple' }> = {
  'Total Attendance': { icon: 'Users', color: 'teal' },
  'Avg Engagement Score': { icon: 'Zap', color: 'purple' },
  'Peak Energy': { icon: 'Activity', color: 'teal' },
  'Total Energy Generated': { icon: 'Activity', color: 'teal' },
  'Revenue (Gross)': { icon: 'DollarSign', color: 'gold' },
  'Sponsorship Revenue': { icon: 'Award', color: 'gold' },
}

// ── core spine ────────────────────────────────────────────────────────────────

export function useKpis(eventId = DEMO_EVENT_ID) {
  return useQuery({
    queryKey: ['kpis', eventId],
    queryFn: () => get<S['KpiOut'][]>(`/api/v1/events/${eventId}/kpis`),
    select: (rows) =>
      rows.map((k) => ({
        label: k.label,
        value: k.value,
        suffix: k.suffix ?? undefined,
        sub: k.sub ?? undefined,
        ...(KPI_META[k.label] ?? { icon: 'Activity', color: 'teal' as const }),
      })),
    ...LIVE,
  })
}

export function useEnergyTimeline(eventId = DEMO_EVENT_ID) {
  return useQuery({
    queryKey: ['energy', eventId],
    queryFn: () => get<S['TimelinePointOut'][]>(`/api/v1/events/${eventId}/energy`),
    select: (rows) =>
      rows.map((p) => ({ time: fmtClock(p.ts), energy: p.energy_value, label: p.label ?? '', ts: p.ts })),
    ...LIVE,
  })
}

export function useZoneEngagement(eventId = DEMO_EVENT_ID) {
  return useQuery({
    queryKey: ['zones', eventId],
    queryFn: () => get<S['ZoneEngagementOut'][]>(`/api/v1/events/${eventId}/zones`),
    select: (rows) =>
      rows.map((z) => ({
        zone: z.zone, score: z.score, vsAvg: z.vs_avg, capacity: z.capacity ?? 0, filled: z.filled_pct,
      })),
    ...LIVE,
  })
}

export function useEmotions(eventId = DEMO_EVENT_ID) {
  return useQuery({
    queryKey: ['emotions', eventId],
    queryFn: () => get<S['EmotionsOut']>(`/api/v1/events/${eventId}/emotions`),
    select: (data) => ({
      fanEmotions: data.emotions.map((e, i) => ({
        emotion: e.label, value: e.pct,
        color: EMOTION_COLORS[e.label] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      })),
      emotionDrivers: data.drivers.map((d) => ({ name: d.label, pct: d.pct })),
    }),
    ...LIVE,
  })
}

export function useEngagementBreakdown(eventId = DEMO_EVENT_ID) {
  return useQuery({
    queryKey: ['engagement', eventId],
    queryFn: () => get<S['EngagementPointOut'][]>(`/api/v1/events/${eventId}/engagement`),
    select: (rows) => {
      const byTs = new Map<string, { time: string; polls: number; challenges: number; rewards: number; shares: number }>()
      for (const r of rows) {
        const row = byTs.get(r.ts) ?? { time: fmtClock(r.ts), polls: 0, challenges: 0, rewards: 0, shares: 0 }
        if (r.type === 'poll') row.polls = r.count
        if (r.type === 'challenge') row.challenges = r.count
        if (r.type === 'reward') row.rewards = r.count
        if (r.type === 'share') row.shares = r.count
        byTs.set(r.ts, row)
      }
      const timeline = [...byTs.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, row]) => row)
      const last = timeline[timeline.length - 1]
      const stats = last
        ? [
            { label: 'Poll Participation', value: human(last.polls) },
            { label: 'Challenges Joined', value: human(last.challenges) },
            { label: 'Rewards Claimed', value: human(last.rewards) },
            { label: 'Social Shares', value: human(last.shares) },
          ]
        : []
      return { timeline, stats }
    },
    ...LIVE,
  })
}

export function useDemographics() {
  return useQuery({
    queryKey: ['demographics'],
    queryFn: () => get<S['DemographicsOut']>('/api/v1/demographics'),
    select: (d) => ({
      total: d.total,
      returning: d.returning_pct,
      ageGroups: (d.age_bands as { group: string; pct: number }[]),
      gender: (d.gender as { name: string; pct: number }[]).map((g) => ({
        name: g.name, value: g.pct, color: GENDER_COLORS[g.name] ?? '#64748b',
      })),
      locations: (d.locations as { city: string; pct: number }[]),
    }),
    ...STATIC,
  })
}

export function useMoments(eventId = DEMO_EVENT_ID) {
  return useQuery({
    queryKey: ['moments', eventId],
    queryFn: () => get<S['MomentOut'][]>(`/api/v1/events/${eventId}/moments`),
    select: (rows) =>
      rows.map((m) => ({
        rank: m.rank,
        event: m.label,
        time: m.occurred_at ? fmtClockFull(m.occurred_at) : '—',
        occurredAt: m.occurred_at,
        energy: m.energy ?? 0,
        color: MOMENT_COLORS[(m.rank - 1) % MOMENT_COLORS.length],
      })),
    ...LIVE,
  })
}

export function useCrowdTriggers() {
  return useQuery({
    queryKey: ['crowd-triggers'],
    queryFn: () => get<string[]>('/api/v1/crowd-triggers'),
    ...STATIC,
  })
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const [events, venues] = await Promise.all([
        get<S['EventOut'][]>('/api/v1/events'),
        get<S['VenueOut'][]>('/api/v1/venues'),
      ])
      const venueName = new Map(venues.map((v) => [v.id, v.name]))
      return events.map((e) => ({
        id: e.id, name: e.name, date: e.event_date, status: e.status,
        attendance: e.attendance, venue: venueName.get(e.venue_id) ?? '—',
      }))
    },
    ...STATIC,
  })
}

// ── revenue & sponsors (aggregates derived client-side from real rows) ───────

export function useRevenueSummary(eventId = DEMO_EVENT_ID) {
  return useQuery({
    queryKey: ['revenue-summary', eventId],
    queryFn: async () => {
      const [lines, transactions, event] = await Promise.all([
        get<S['RevenueLineOut'][]>(`/api/v1/events/${eventId}/revenue`),
        get<S['TransactionOut'][]>(`/api/v1/events/${eventId}/transactions?limit=1000`),
        get<S['EventOut']>(`/api/v1/events/${eventId}`),
      ])
      const total = lines.reduce((sum, l) => sum + l.amount, 0)
      return {
        total,
        breakdown: lines.map((l, i) => ({
          category: l.category, amount: l.amount, pct: l.pct ?? 0,
          color: REVENUE_COLORS[l.category] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        })),
        perFan: event.attendance ? total / event.attendance : 0,
        transactions: transactions.length,
        attendance: event.attendance,
      }
    },
    ...LIVE,
  })
}

export function useSponsorRoi() {
  return useQuery({
    queryKey: ['sponsor-roi'],
    queryFn: async () => {
      const [sponsors, roi] = await Promise.all([
        get<S['SponsorOut'][]>('/api/v1/sponsors'),
        get<S['SponsorROIOut'][]>('/api/v1/sponsor-roi'),
      ])
      const name = new Map(sponsors.map((s) => [s.id, s.name]))
      const tier = new Map(sponsors.map((s) => [s.id, s.tier ?? '—']))
      const rows = roi.map((r) => ({
        name: name.get(r.sponsor_id) ?? '—',
        tier: tier.get(r.sponsor_id) ?? '—',
        impressions: human(r.impressions),
        engagements: human(r.engagements),
        clicks: human(r.clicks),
        conversions: human(r.conversions),
        roi: r.roi != null ? `${Math.round(r.roi * 100)}%` : '—',
        roiX: r.roi ?? 0,
      }))
      const sum = (f: (r: S['SponsorROIOut']) => number) => roi.reduce((a, r) => a + f(r), 0)
      const withRoi = roi.filter((r) => r.roi != null)
      const top = rows.reduce((best, r) => (r.roiX > (best?.roiX ?? -1) ? r : best), rows[0])
      return {
        sponsors: rows,
        summary: {
          impressions: human(sum((r) => r.impressions)),
          engagements: human(sum((r) => r.engagements)),
          clicks: human(sum((r) => r.clicks)),
          conversions: human(sum((r) => r.conversions)),
          avgROI: withRoi.length ? sum((r) => r.roi ?? 0) / withRoi.length : 0,
          topSponsor: top ? { name: top.name, roi: top.roiX } : { name: '—', roi: 0 },
        },
      }
    },
    ...STATIC,
  })
}

// ── ops & catalogs ────────────────────────────────────────────────────────────

export function useAlerts(eventId?: number) {
  return useQuery({
    queryKey: ['alerts', eventId ?? 'all'],
    queryFn: async () => {
      const [alerts, zones] = await Promise.all([
        get<S['AlertOut'][]>(`/api/v1/alerts${eventId ? `?event_id=${eventId}` : ''}`),
        get<S['ZoneOut'][]>('/api/v1/venues/1/zones'),
      ])
      const zoneName = new Map(zones.map((z) => [z.id, z.name]))
      const ago = agoLabels(alerts.map((a) => a.created_at))
      return alerts.map((a, i) => ({
        id: a.id,
        type: a.level,
        title: a.title,
        message: a.message ?? '',
        time: ago[i],
        zone: a.zone_id ? zoneName.get(a.zone_id) ?? '—' : 'All Zones',
      }))
    },
    ...LIVE,
  })
}

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => get<S['DeviceOut'][]>('/api/v1/devices'),
    select: (rows) =>
      rows.map((d) => ({
        id: d.code, type: d.type, zone: d.zone ?? '—', battery: d.battery,
        status: d.status, connected: d.connected_count,
      })),
    ...STATIC,
  })
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => get<S['CampaignOut'][]>('/api/v1/campaigns'),
    select: (rows) =>
      rows.map((c) => ({
        id: c.id, name: c.name, type: c.type ?? '—', status: c.status,
        reach: c.reach != null ? human(c.reach) : '—',
        engagement: c.engagement_pct != null ? `${Math.round(c.engagement_pct)}%` : '—',
        conversion: c.conversion_pct != null ? `${c.conversion_pct}%` : '—',
      })),
    ...STATIC,
  })
}

export function useFanSegments() {
  return useQuery({
    queryKey: ['fan-segments'],
    queryFn: () => get<S['FanSegmentOut'][]>('/api/v1/fan-segments'),
    select: (rows) =>
      rows.map((s) => ({
        name: s.name,
        count: s.count ?? 0,
        avgSpend: s.avg_spend != null ? `$${Math.round(s.avg_spend)}` : '—',
        visits: s.avg_visits ?? 0,
        engagement: s.engagement ?? 0,
      })),
    ...STATIC,
  })
}

export function useUgc() {
  return useQuery({
    queryKey: ['ugc'],
    queryFn: () => get<S['UGCOut'][]>('/api/v1/ugc'),
    select: (rows) => {
      const ago = agoLabels(rows.map((u) => u.posted_at))
      return rows.map((u, i) => ({
        id: u.id, type: u.type ?? '—', platform: u.platform ?? '—',
        shares: u.shares, likes: u.likes, hashtag: u.hashtag ?? '', time: ago[i],
      }))
    },
    ...STATIC,
  })
}

export function useBilling() {
  return useQuery({
    queryKey: ['billing'],
    queryFn: () => get<S['BillingRecordOut'][]>('/api/v1/billing'),
    ...STATIC,
  })
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => get<S['IntegrationOut'][]>('/api/v1/integrations'),
    ...STATIC,
  })
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => get<S['StaffUserOut'][]>('/api/v1/staff'),
    ...STATIC,
  })
}

export function useAccessRoles() {
  return useQuery({
    queryKey: ['access-roles'],
    queryFn: () => get<S['AccessRoleOut'][]>('/api/v1/access-roles'),
    ...STATIC,
  })
}

export function useVenues() {
  return useQuery({
    queryKey: ['venues'],
    queryFn: () => get<S['VenueOut'][]>('/api/v1/venues'),
    ...STATIC,
  })
}
