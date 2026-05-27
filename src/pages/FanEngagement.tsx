import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { demographics, fanSegments } from '../data/mockData'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
}

const engagementKpis = [
  { label: 'Poll Participation', value: '68%', icon: '📊', color: '#14b8a6' },
  { label: 'Challenges Joined', value: '4,210', icon: '🏆', color: '#f59e0b' },
  { label: 'Rewards Claimed', value: '2,847', icon: '🎁', color: '#a855f7' },
  { label: 'Social Shares', value: '28,400', icon: '📱', color: '#14b8a6' },
]

const sentiment = [
  { name: 'Positive', value: 84, color: '#22c55e' },
  { name: 'Neutral', value: 12, color: '#64748b' },
  { name: 'Negative', value: 4, color: '#ef4444' },
]

export default function FanEngagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Fan Engagement" subtitle="How fans are interacting before, during, and after events" />

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {engagementKpis.map((k) => (
          <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-[#64748b] mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Engagement by Age Group" subtitle="Average engagement score per age bracket" accent="purple">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demographics.ageGroups.map(a => ({ ...a, engagement: [82, 91, 87, 74, 61][demographics.ageGroups.indexOf(a)] }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
              <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="engagement" name="Engagement Score" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-[#64748b] mt-2">25–34 age group leads with 91 avg — most active in challenges and polls</p>
        </ChartCard>

        <ChartCard title="Fan Sentiment" subtitle="Overall emotional response from attendees" accent="purple">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={sentiment} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                  {sentiment.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {sentiment.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[#94a3b8]">{s.name}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}%</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2f3e] rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-[#64748b] mt-3">84% positive — highest fan sentiment score this quarter</p>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Repeat Attendee Rate" subtitle="Fans who have attended 2+ events">
          <div className="flex items-center gap-6 py-4">
            <div className="text-center">
              <div className="text-5xl font-black text-[#14b8a6]">62%</div>
              <div className="text-sm text-[#64748b] mt-2">Returning Fans</div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-[#1a1f2e] rounded-lg p-3">
                <div className="text-lg font-bold text-[#e2e8f0]">2.4x</div>
                <div className="text-xs text-[#64748b]">Higher spend vs first-timers</div>
              </div>
              <div className="bg-[#1a1f2e] rounded-lg p-3">
                <div className="text-lg font-bold text-[#e2e8f0]">3.8</div>
                <div className="text-xs text-[#64748b]">Avg events attended (returners)</div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Most Engaged Fan Segments" subtitle="Top performing audience groups" accent="teal">
          <div className="space-y-3">
            {fanSegments.map((seg) => (
              <div key={seg.name} className="flex items-center gap-3 p-2 bg-[#1a1f2e] rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#e2e8f0]">{seg.name}</div>
                  <div className="text-[10px] text-[#64748b]">{seg.count.toLocaleString()} fans · {seg.avgSpend} avg spend</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-[#14b8a6]">{seg.engagement}</div>
                  <div className="text-[10px] text-[#64748b]">score</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
