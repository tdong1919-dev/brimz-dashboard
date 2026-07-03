import {
  AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useEnergyTimeline, useZoneEngagement } from '../api/queries'
import { useLive } from '../live/useLive'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import HeatmapCard from '../components/HeatmapCard'
import ProgressBar from '../components/ProgressBar'
import QueryBoundary from '../components/QueryBoundary'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
}

const triggers = [
  { name: 'Headliner Performance', icon: '🎤', pct: 47, color: '#f59e0b' },
  { name: 'Pyrotechnic Display', icon: '🎆', pct: 38, color: '#ef4444' },
  { name: 'Surprise Guest Artist', icon: '⭐', pct: 31, color: '#a855f7' },
  { name: 'Crowd Interaction', icon: '🙌', pct: 29, color: '#14b8a6' },
  { name: 'Giveaways & Prizes', icon: '🎁', pct: 18, color: '#3b82f6' },
]

const behaviors = [
  { label: 'Crowd surfing incidents', value: '14 detected' },
  { label: 'Mass jump/bounce events', value: '22 events' },
  { label: 'Synchronized movement', value: '8 occurrences' },
  { label: 'Phone light-up moments', value: '3 waves' },
]

export default function CrowdInsights() {
  const energyQ = useEnergyTimeline()
  const zonesQ = useZoneEngagement()
  const live = useLive()

  return (
    <div className="space-y-6">
      <PageHeader title="Crowd Insights" subtitle="Real-time and post-event crowd behavior analysis" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Crowd Energy Heatmap" subtitle="Zone intensity throughout the event" accent="teal">
          <HeatmapCard liveState={live.state} />
        </ChartCard>

        <ChartCard title="Section Excitement Rankings" subtitle="Engagement score by zone" accent="teal">
          <QueryBoundary query={zonesQ} compact>
            {(zoneEngagement) => (
              <div className="space-y-3">
                {[...zoneEngagement].sort((a, b) => b.score - a.score).map((z, i) => (
                  <div key={z.zone} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#14b8a6]/20 flex items-center justify-center text-[10px] font-bold text-[#14b8a6]">{i + 1}</div>
                    <div className="flex-1">
                      <ProgressBar label={z.zone} value={z.score} color={i === 0 ? '#f59e0b' : i === 1 ? '#14b8a6' : '#a855f7'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </QueryBoundary>
          <p className="text-[10px] text-[#64748b] mt-3">Floor GA dominates — high density + artist proximity drives intensity</p>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Peak Energy Timeline" subtitle="Energy levels across the event timeline" accent="teal">
          <QueryBoundary query={energyQ} compact>
            {(energyTimeline) => (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={energyTimeline}>
                  <defs>
                    <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="energy" name="Energy" stroke="#14b8a6" fill="url(#crowdGrad)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </QueryBoundary>
          <p className="text-[10px] text-[#64748b] mt-2">8:24 PM peak = encore "Thunder". Curve replays continuously in demo mode</p>
        </ChartCard>

        <ChartCard title="What Triggered the Crowd?" subtitle="Energy spike triggers ranked by impact" accent="gold">
          <div className="space-y-3">
            {triggers.map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{t.icon}</span>
                <div className="flex-1">
                  <ProgressBar label={t.name} value={t.pct} color={t.color} />
                </div>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: t.color }}>+{t.pct}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Behavior Insights" subtitle="Detected crowd behavior events">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {behaviors.map((b) => (
            <div key={b.label} className="bg-[#1a1f2e] rounded-lg p-3">
              <div className="text-lg font-bold text-[#14b8a6] mb-1">{b.value}</div>
              <div className="text-xs text-[#64748b]">{b.label}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#64748b] mt-3">Behavior detection powered by wristband motion sensors + computer vision analysis</p>
      </ChartCard>
    </div>
  )
}
