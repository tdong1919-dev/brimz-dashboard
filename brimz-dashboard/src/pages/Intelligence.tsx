import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import HeatmapCard from '../components/HeatmapCard'
import ProgressBar from '../components/ProgressBar'
import QueryBoundary from '../components/QueryBoundary'
import {
  useEnergyTimeline, useKpis, useZoneEngagement, useEmotions,
  useMoments, useEvents, useSponsorRoi, human,
} from '../api/queries'

const KPI_HEX: Record<string, string> = { teal: '#14b8a6', gold: '#f59e0b', purple: '#a855f7' }

function Stat({ label, value, color = '#14b8a6' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4 min-h-[96px]">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs text-[#64748b] mt-1 leading-snug">{label}</div>
    </div>
  )
}

function InsightCard({ title, text, priority = 'High' }: { title: string; text: string; priority?: string }) {
  return (
    <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-sm font-semibold text-[#e2e8f0]">{title}</div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14b8a6]/15 text-[#14b8a6]">{priority}</span>
      </div>
      <p className="text-xs text-[#64748b] leading-relaxed">{text}</p>
    </div>
  )
}

// demo-static: no backing endpoint in MVP — theme-night activation analytics
// are not modeled in the API.
const themes = [
  { name: 'Cancer Awareness Night', fei: 91, participation: 78, impact: 94, peak: 'Bell ceremony', rec: 'Repeat the recognition structure and retarget donors during halftime.' },
  { name: 'Hoops & Hounds', fei: 84, participation: 69, impact: 88, peak: 'Adoption walkout', rec: 'Add lower-bowl camera prompts and a branded photo lane.' },
  { name: 'Military Appreciation Night', fei: 88, participation: 72, impact: 91, peak: 'Honor guard', rec: 'Keep the recognition moment separate from sponsor giveaways.' },
  { name: 'Youth Basketball Night', fei: 79, participation: 83, impact: 86, peak: 'Junior showcase', rec: 'Launch youth-team challenges earlier while families are active.' },
  { name: 'Pride Night', fei: 86, participation: 75, impact: 89, peak: 'Community anthem', rec: 'Expand partner storytelling around the light-band reveal.' },
]

export function FanEnergyIndex() {
  const kpisQ = useKpis()
  const energyQ = useEnergyTimeline()
  return (
    <div className="space-y-6">
      <PageHeader title="Fan Energy Index" subtitle="Quality of the fan experience, not just attendance" />
      <QueryBoundary query={kpisQ} compact>
        {(kpis) => (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((k) => (
              <Stat key={k.label} label={k.label} value={`${k.value}${k.suffix ?? ''}`} color={KPI_HEX[k.color] ?? '#14b8a6'} />
            ))}
          </div>
        )}
      </QueryBoundary>
      <ChartCard title="FEI Drivers" subtitle="Key moments ranked by peak energy" accent="teal">
        <QueryBoundary query={energyQ} compact>
          {(energy) => {
            const max = Math.max(...energy.map((p) => p.energy), 1)
            const labeled = energy.filter((p) => p.label)
            const source = labeled.length ? labeled : energy
            const top = [...source].sort((a, b) => b.energy - a.energy).slice(0, 5)
            return (
              <div className="space-y-4">
                {top.map((p, i) => (
                  <ProgressBar
                    key={`${p.ts}-${i}`}
                    label={p.label || p.time}
                    value={Math.round((p.energy / max) * 100)}
                    color={i === 0 ? '#14b8a6' : i === 1 ? '#f59e0b' : '#a855f7'}
                  />
                ))}
              </div>
            )
          }}
        </QueryBoundary>
      </ChartCard>
    </div>
  )
}

export function HeatMaps() {
  const zonesQ = useZoneEngagement()
  return (
    <div className="space-y-6">
      <PageHeader title="Heat Maps" subtitle="Zone engagement, capacity, and energy across the arena" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Arena Heat Map" accent="teal"><HeatmapCard /></ChartCard>
        <ChartCard title="Zone Engagement" subtitle="Engagement score by zone" accent="teal">
          <QueryBoundary query={zonesQ} compact>
            {(zones) => (
              <div className="space-y-4">
                {[...zones].sort((a, b) => b.score - a.score).map((z) => (
                  <ProgressBar
                    key={z.zone}
                    label={`${z.zone}: ${Math.round(z.filled)}% full · ${z.vsAvg >= 0 ? '+' : ''}${z.vsAvg} vs avg`}
                    value={z.score}
                    color={z.vsAvg < 0 ? '#f59e0b' : '#14b8a6'}
                  />
                ))}
              </div>
            )}
          </QueryBoundary>
        </ChartCard>
      </div>
    </div>
  )
}

export function ThemeNights() {
  return (
    <div className="space-y-6">
      <PageHeader title="Theme Nights" subtitle="Community and special activation intelligence" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {themes.map((t) => (
          <ChartCard key={t.name} title={t.name} accent="teal">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Stat label="FEI" value={String(t.fei)} />
              <Stat label="Particip." value={`${t.participation}%`} color="#a855f7" />
              <Stat label="Impact" value={String(t.impact)} color="#f59e0b" />
            </div>
            <div className="text-xs text-[#94a3b8] mb-2">Emotional peak: <span className="text-[#e2e8f0]">{t.peak}</span></div>
            <p className="text-xs text-[#64748b] leading-relaxed">{t.rec}</p>
          </ChartCard>
        ))}
      </div>
    </div>
  )
}

export function SponsorIntelligence() {
  const sponsorsQ = useSponsorRoi()
  return (
    <div className="space-y-6">
      <PageHeader title="Sponsor Intelligence" subtitle="Activation reach, engagement, and return on investment" />
      <ChartCard title="Sponsor Activation Performance" accent="gold">
        <QueryBoundary query={sponsorsQ} compact>
          {(data) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2f3e]">
                    {['Sponsor', 'Tier', 'Impressions', 'Engagements', 'Clicks', 'Conversions', 'ROI'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] text-[#64748b] uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sponsors.map((s) => (
                    <tr key={s.name} className="border-b border-[#1a1f2e]">
                      <td className="py-3 px-3 font-semibold text-[#e2e8f0] whitespace-nowrap">{s.name}</td>
                      <td className="py-3 px-3 text-[#94a3b8] whitespace-nowrap">{s.tier}</td>
                      <td className="py-3 px-3 text-[#94a3b8]">{s.impressions}</td>
                      <td className="py-3 px-3 text-[#14b8a6] font-bold">{s.engagements}</td>
                      <td className="py-3 px-3 text-[#94a3b8]">{s.clicks}</td>
                      <td className="py-3 px-3 text-[#94a3b8]">{s.conversions}</td>
                      <td className="py-3 px-3 text-[#f59e0b] font-bold">{s.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryBoundary>
      </ChartCard>
    </div>
  )
}

export function EmotionalPeaks() {
  const momentsQ = useMoments()
  const emotionsQ = useEmotions()
  return (
    <div className="space-y-6">
      <PageHeader title="Emotional Peaks" subtitle="Timeline of moments when fan energy spiked" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Peak Moments Timeline" accent="purple">
          <QueryBoundary query={momentsQ} compact>
            {(moments) => (
              <div className="space-y-3">
                {moments.map((m) => (
                  <div key={m.rank} className="grid grid-cols-1 md:grid-cols-[80px_1fr_70px] gap-3 bg-[#1a1f2e] rounded-lg p-3">
                    <div className="text-xs font-bold text-[#14b8a6]">{m.time}</div>
                    <div>
                      <div className="text-sm font-semibold text-[#e2e8f0]">{m.event}</div>
                      <div className="text-xs text-[#64748b] mt-1">Peak moment #{m.rank}</div>
                    </div>
                    <div className="md:text-right text-lg font-black" style={{ color: m.color }}>{Math.round(m.energy)}</div>
                  </div>
                ))}
              </div>
            )}
          </QueryBoundary>
        </ChartCard>
        <ChartCard title="Fan Emotions" subtitle="Dominant emotional response" accent="purple">
          <QueryBoundary query={emotionsQ} compact>
            {(data) => (
              <div className="space-y-4">
                {data.fanEmotions.map((e) => (
                  <ProgressBar key={e.emotion} label={e.emotion} value={Math.round(e.value)} color={e.color} />
                ))}
              </div>
            )}
          </QueryBoundary>
        </ChartCard>
      </div>
    </div>
  )
}

export function EventComparison() {
  const eventsQ = useEvents()
  return (
    <div className="space-y-6">
      <PageHeader title="Event Comparison" subtitle="Attendance across events" />
      <ChartCard title="Attendance by Event" accent="teal">
        <QueryBoundary query={eventsQ} compact>
          {(events) => {
            const max = Math.max(...events.map((e) => e.attendance ?? 0), 1)
            return (
              <div className="space-y-4">
                {[...events].sort((a, b) => (b.attendance ?? 0) - (a.attendance ?? 0)).map((e) => (
                  <div key={e.id}>
                    <ProgressBar
                      label={`${e.name} · ${e.venue} — ${human(e.attendance ?? 0)} attendees`}
                      value={Math.round(((e.attendance ?? 0) / max) * 100)}
                    />
                  </div>
                ))}
              </div>
            )
          }}
        </QueryBoundary>
      </ChartCard>
    </div>
  )
}

export function ExecutiveInsights() {
  return (
    <div className="space-y-6">
      <PageHeader title="Executive Insights" subtitle="Decision-ready recommendations for venue, sponsor, staffing, and fan experience leaders" />
      {/* demo-static: no backing endpoint in MVP — narrative recommendations are not generated by the API. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightCard title="What worked" text="The bell ceremony created the strongest emotional peak and sponsor-safe community story." />
        <InsightCard title="What underperformed" priority="Medium" text="Gate 3 exit congestion lowered late-event participation and exit sentiment." />
        <InsightCard title="Sponsor recommendation" text="Volt Beverage and City Health Network showed renewal-ready engagement." />
        <InsightCard title="Theme night recommendation" text="Cancer Awareness Night outperformed the prior theme-night average by 14 points." />
        <InsightCard title="Staffing recommendation" priority="Medium" text="Shift two mobile staff teams to west concourse from final timeout through exit." />
        <InsightCard title="Fan experience recommendation" priority="Medium" text="Segment prompts by zone: camera-driven challenges for families and timed challenges for students." />
      </div>
    </div>
  )
}
