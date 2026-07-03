import {
  BarChart, Bar, LineChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { useEvents } from '../api/queries'
import QueryBoundary from '../components/QueryBoundary'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
}

// demo-static: no per-event metrics endpoint in MVP — attendance/name come from the API,
// these engagement/revenue/energy figures are keyed by event name for the demo.
const EVENT_METRICS: Record<string, { engagement: number; revenue: number; energy: number }> = {
  'Championship Night': { engagement: 91, revenue: 980000, energy: 94 },
  'NFL Playoff Game': { engagement: 87, revenue: 720000, energy: 89 },
  'NBA Finals Watch': { engagement: 84, revenue: 480000, energy: 88 },
  'College Bowl Game': { engagement: 78, revenue: 300000, energy: 76 },
  'All-Star Weekend': { engagement: 71, revenue: 220000, energy: 62 },
}

// demo-static: headline insights (no per-event metrics endpoint in MVP)
const insights = [
  { title: 'Best Engagement', value: 'Championship Night', detail: '91/100 score — pyrotechnics + surprise guest', color: '#14b8a6' },
  { title: 'Top Revenue Event', value: 'Championship Night', detail: '$0.98M gross — sold out floor GA', color: '#f59e0b' },
  { title: 'Highest Energy', value: 'Championship Night', detail: 'Energy score 94 — record for this venue', color: '#a855f7' },
]

export default function Performance() {
  const eventsQ = useEvents()

  return (
    <div className="space-y-6">
      <PageHeader title="Performance" subtitle="Event-by-event analytics and benchmarks" />

      {/* Insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {insights.map((ins) => (
          <div key={ins.title} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4" style={{ borderLeftColor: ins.color, borderLeftWidth: 3 }}>
            <div className="text-xs text-[#64748b] mb-1">{ins.title}</div>
            <div className="text-base font-bold text-[#e2e8f0] mb-1">{ins.value}</div>
            <div className="text-xs text-[#94a3b8]">{ins.detail}</div>
          </div>
        ))}
      </div>

      {/* Attendance vs Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Attendance vs Revenue" subtitle="Per-event comparison" accent="gold">
          <QueryBoundary query={eventsQ} compact>
            {(events) => (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={events.map((e) => ({
                  event: e.name,
                  attendance: e.attendance ?? 0,
                  revenue: EVENT_METRICS[e.name]?.revenue ?? 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                  <XAxis dataKey="event" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar yAxisId="left" dataKey="attendance" name="Attendance" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue $" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </QueryBoundary>
        </ChartCard>

        <ChartCard title="Engagement Score Trends" subtitle="Score per event" accent="teal">
          <QueryBoundary query={eventsQ} compact>
            {(events) => (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={events.map((e) => ({
                    event: e.name,
                    engagement: EVENT_METRICS[e.name]?.engagement ?? 0,
                    energy: EVENT_METRICS[e.name]?.energy ?? 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                    <XAxis dataKey="event" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 4 }} />
                    <Line type="monotone" dataKey="energy" name="Energy" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-[#64748b] mt-2">Engagement tracks energy closely — crowd-driven moments are the strongest driver</p>
              </>
            )}
          </QueryBoundary>
        </ChartCard>
      </div>

      {/* Performance table */}
      <ChartCard title="Event Performance Comparison">
        <QueryBoundary query={eventsQ} compact>
          {(events) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2f3e]">
                    {['Event', 'Attendance', 'Engagement', 'Energy', 'Revenue', 'Rev/Fan'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => {
                    const m = EVENT_METRICS[e.name] ?? { engagement: 0, revenue: 0, energy: 0 }
                    const attendance = e.attendance ?? 0
                    return (
                      <tr key={e.id} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-[#e2e8f0]">{e.name}</td>
                        <td className="py-2.5 px-3 text-[#94a3b8]">{attendance.toLocaleString()}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[#14b8a6] font-semibold">{m.engagement}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[#a855f7] font-semibold">{m.energy}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#f59e0b] font-semibold">${(m.revenue / 1000000).toFixed(2)}M</td>
                        <td className="py-2.5 px-3 text-[#94a3b8]">${attendance ? Math.round(m.revenue / attendance) : 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </QueryBoundary>
      </ChartCard>
    </div>
  )
}
