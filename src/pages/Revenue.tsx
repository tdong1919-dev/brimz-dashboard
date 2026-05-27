import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { revenue } from '../data/mockData'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
}

const COLORS = ['#f59e0b', '#14b8a6', '#a855f7', '#3b82f6', '#ef4444']

const upsells = [
  { title: 'VIP Floor Upgrade', potential: '+$84K', action: 'Target 18-34 section B attendees with in-app offer' },
  { title: 'Pre-Event Dining Package', potential: '+$52K', action: 'Bundle concessions with early entry for premium fans' },
  { title: 'Merchandise Bundle', potential: '+$38K', action: 'Offer limited edition bundle at checkout for high-engagers' },
]

export default function Revenue() {
  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" subtitle="Gross revenue breakdown and optimization opportunities" />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Gross Revenue', value: '$4.2M', color: '#f59e0b' },
          { label: 'Avg Spend / Fan', value: '$169', color: '#f59e0b' },
          { label: 'Ticketing Revenue', value: '$2.4M', color: '#14b8a6' },
          { label: 'Sponsorship Rev', value: '$890K', color: '#a855f7' },
        ].map((k) => (
          <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
            <div className="text-2xl font-black mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-[#64748b]">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Revenue by Category" subtitle="Gross breakdown across all revenue streams" accent="gold">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={180}>
              <PieChart>
                <Pie data={revenue.breakdown} dataKey="amount" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                  {revenue.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {revenue.breakdown.map((r, i) => (
                <div key={r.category}>
                  <ProgressBar label={r.category} value={r.pct} color={COLORS[i % COLORS.length]} />
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Revenue by Event" subtitle="Gross per event this season" accent="gold">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue.events}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, 'Revenue']} />
              <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Upsell Opportunities" subtitle="AI-identified revenue optimization recommendations" accent="gold">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {upsells.map((u) => (
            <div key={u.title} className="bg-[#1a1f2e] border border-[#f59e0b]/20 rounded-xl p-4">
              <div className="text-2xl font-black text-[#f59e0b] mb-2">{u.potential}</div>
              <div className="text-sm font-semibold text-[#e2e8f0] mb-2">{u.title}</div>
              <div className="text-xs text-[#64748b]">{u.action}</div>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Revenue Optimization Recommendations" subtitle="Data-driven actions to grow revenue">
        <div className="space-y-3">
          {[
            { rec: 'Increase VIP section capacity by 15%', impact: '+$126K', effort: 'Medium' },
            { rec: 'Launch dynamic ticket pricing for high-demand shows', impact: '+$89K', effort: 'Low' },
            { rec: 'Expand concession points in Upper Deck (currently underserved)', impact: '+$44K', effort: 'High' },
            { rec: 'Introduce post-event merch flash sales via app', impact: '+$31K', effort: 'Low' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-[#1a1f2e] rounded-lg">
              <div className="flex-1">
                <div className="text-sm text-[#e2e8f0]">{r.rec}</div>
                <div className="text-xs text-[#64748b] mt-0.5">Effort: {r.effort}</div>
              </div>
              <span className="text-sm font-bold text-[#22c55e] flex-shrink-0">{r.impact}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
