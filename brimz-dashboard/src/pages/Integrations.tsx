import { useState } from 'react'
import { CheckCircle, Link2 } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import QueryBoundary from '../components/QueryBoundary'
import { useIntegrations } from '../api/queries'

type Integration = {
  id: number
  name: string
  category?: string | null
  status: string
  connected: boolean
}

// demo-static: logos are presentation-only (not stored in the API) — keyed by
// the integration's category, with a generic fallback.
const categoryLogos: Record<string, string> = {
  Wearables: '⌚',
  Payments: '💳',
  Marketing: '📣',
  CRM: '☁️',
  Ticketing: '🎟️',
  POS: '🛒',
  Social: '📱',
}

function IntegrationsView({ data }: { data: Integration[] }) {
  const [integrations, setIntegrations] = useState(data)

  const toggle = (id: number) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    )
  }

  const categories = [...new Set(integrations.map((i) => i.category ?? 'Other'))]

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Connected', count: integrations.filter(i => i.connected).length, color: '#22c55e' },
          { label: 'Available', count: integrations.filter(i => !i.connected).length, color: '#64748b' },
          { label: 'Categories', count: categories.length, color: '#14b8a6' },
          { label: 'Total', count: integrations.length, color: '#a855f7' },
        ].map((k) => (
          <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
            <div className="text-3xl font-black mb-1" style={{ color: k.color }}>{k.count}</div>
            <div className="text-xs text-[#64748b]">{k.label}</div>
          </div>
        ))}
      </div>

      {categories.map((cat) => (
        <ChartCard key={cat} title={cat} subtitle={`${cat} integrations`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {integrations.filter((i) => (i.category ?? 'Other') === cat).map((intg) => (
              <div key={intg.id} className={`flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-xl border transition-all ${intg.connected ? 'border-[#22c55e]/30' : 'border-[#2a2f3e]'}`}>
                <span className="text-2xl flex-shrink-0">{categoryLogos[cat] ?? '⚙️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#e2e8f0]">{intg.name}</div>
                  <div className="text-xs text-[#64748b] truncate">{cat} · {intg.status}</div>
                </div>
                <button
                  onClick={() => toggle(intg.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                    intg.connected
                      ? 'bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#ef4444]/20 hover:text-[#ef4444]'
                      : 'bg-[#2a2f3e] text-[#64748b] hover:bg-[#14b8a6]/20 hover:text-[#14b8a6]'
                  }`}
                >
                  {intg.connected ? <CheckCircle className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                  {intg.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </ChartCard>
      ))}
    </>
  )
}

export default function Integrations() {
  const query = useIntegrations()

  return (
    <div className="space-y-6">
      <PageHeader title="Integrations" subtitle="Connect your tools and data sources" />
      <QueryBoundary query={query}>
        {(data) => <IntegrationsView data={data} />}
      </QueryBoundary>
    </div>
  )
}
