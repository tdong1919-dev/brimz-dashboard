import { AlertTriangle, Info, XCircle, Bell, Filter } from 'lucide-react'
import { useState } from 'react'
import { alerts } from '../data/mockData'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const typeConfig = {
  warning: { color: '#f59e0b', bg: '#f59e0b20', Icon: AlertTriangle, label: 'Warning' },
  error: { color: '#ef4444', bg: '#ef444420', Icon: XCircle, label: 'Critical' },
  info: { color: '#14b8a6', bg: '#14b8a620', Icon: Info, label: 'Info' },
}

const filterTabs = ['All', 'Critical', 'Warning', 'Info']

export default function Alerts() {
  const [active, setActive] = useState('All')

  const filtered = alerts.filter((a) => {
    if (active === 'All') return true
    if (active === 'Critical') return a.type === 'error'
    if (active === 'Warning') return a.type === 'warning'
    if (active === 'Info') return a.type === 'info'
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts" subtitle="Real-time crowd, device, and security notifications">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-xs text-[#22c55e] font-semibold">Live</span>
        </div>
      </PageHeader>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Critical', count: alerts.filter(a => a.type === 'error').length, color: '#ef4444' },
          { label: 'Warnings', count: alerts.filter(a => a.type === 'warning').length, color: '#f59e0b' },
          { label: 'Info', count: alerts.filter(a => a.type === 'info').length, color: '#14b8a6' },
        ].map((k) => (
          <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
            <div className="text-3xl font-black mb-1" style={{ color: k.color }}>{k.count}</div>
            <div className="text-xs text-[#64748b]">{k.label}</div>
          </div>
        ))}
      </div>

      <ChartCard title="Alert Feed" subtitle="Sorted by most recent">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                active === tab
                  ? 'bg-[#f59e0b] text-black'
                  : 'bg-[#1a1f2e] text-[#64748b] hover:text-[#e2e8f0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((a) => {
            const config = typeConfig[a.type as keyof typeof typeConfig]
            const { Icon } = config
            return (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-[#1a1f2e] rounded-lg border-l-2 hover:bg-[#1f2535] transition-colors"
                style={{ borderLeftColor: config.color }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: config.bg }}>
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-[#e2e8f0]">{a.title}</div>
                    <span className="text-[10px] text-[#64748b] flex-shrink-0">{a.time}</span>
                  </div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">{a.message}</div>
                  <div className="text-[10px] text-[#64748b] mt-1">Zone: {a.zone}</div>
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}
