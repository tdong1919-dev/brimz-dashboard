import { useState } from 'react'
import { campaigns } from '../data/mockData'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const typeFilters = ['All', 'Retention', 'Upsell', 'Sponsor', 'Acquisition', 'Engagement']

const statusColors: Record<string, string> = {
  Active: '#22c55e',
  Scheduled: '#f59e0b',
  Draft: '#64748b',
}

const recs = [
  { title: 'Re-engage lapsed fans', desc: 'Target fans with 90+ days since last event — offer 20% off next ticket', priority: 'High' },
  { title: 'Upsell VIP at gate', desc: 'Trigger in-app offer for floor GA fans — upgrade to VIP for $40 more', priority: 'Medium' },
  { title: 'Post-event recap push', desc: 'Send personalized highlight reel 24hrs after event — drives repeat purchase', priority: 'Medium' },
]

export default function Campaigns() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? campaigns : campaigns.filter(c => c.type === filter)

  return (
    <div className="space-y-6">
      <PageHeader title="Campaigns" subtitle="Active, scheduled, and recommended fan campaigns" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', count: campaigns.filter(c => c.status === 'Active').length, color: '#22c55e' },
          { label: 'Scheduled', count: campaigns.filter(c => c.status === 'Scheduled').length, color: '#f59e0b' },
          { label: 'Draft', count: campaigns.filter(c => c.status === 'Draft').length, color: '#64748b' },
        ].map((k) => (
          <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
            <div className="text-3xl font-black mb-1" style={{ color: k.color }}>{k.count}</div>
            <div className="text-xs text-[#64748b]">{k.label}</div>
          </div>
        ))}
      </div>

      <ChartCard title="Campaign Performance">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {typeFilters.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === tab ? 'bg-[#a855f7] text-white' : 'bg-[#1a1f2e] text-[#64748b] hover:text-[#e2e8f0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2f3e]">
                {['Campaign', 'Type', 'Status', 'Reach', 'Engagement', 'Conversion'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#e2e8f0]">{c.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-[#a855f7]/20 text-[#a855f7] px-2 py-0.5 rounded-full text-[10px] font-semibold">{c.type}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: `${statusColors[c.status]}20`, color: statusColors[c.status] }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#94a3b8]">{c.reach}</td>
                  <td className="py-2.5 px-3 text-[#14b8a6] font-semibold">{c.engagement}</td>
                  <td className="py-2.5 px-3 text-[#f59e0b] font-semibold">{c.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard title="Campaign Recommendations" subtitle="AI-generated actions based on fan behavior" accent="purple">
        <div className="space-y-3">
          {recs.map((r) => (
            <div key={r.title} className="p-4 bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-sm font-semibold text-[#e2e8f0]">{r.title}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${r.priority === 'High' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#14b8a6]/20 text-[#14b8a6]'}`}>
                  {r.priority}
                </span>
              </div>
              <div className="text-xs text-[#64748b]">{r.desc}</div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
