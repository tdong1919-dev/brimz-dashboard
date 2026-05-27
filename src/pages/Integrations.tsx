import { useState } from 'react'
import { CheckCircle, XCircle, Link2 } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

type Integration = {
  name: string
  category: string
  description: string
  connected: boolean
  logo: string
}

const initialIntegrations: Integration[] = [
  { name: 'Ticketmaster', category: 'Ticketing', description: 'Sync ticket sales, attendance data, and fan info', connected: true, logo: '🎟️' },
  { name: 'AXS', category: 'Ticketing', description: 'Secondary ticketing and fan ID verification', connected: false, logo: '🎫' },
  { name: 'Square POS', category: 'POS', description: 'Concessions and merchandise point-of-sale data', connected: true, logo: '💳' },
  { name: 'Toast POS', category: 'POS', description: 'Food & beverage sales and inventory tracking', connected: false, logo: '🍽️' },
  { name: 'Salesforce CRM', category: 'CRM', description: 'Fan profiles, lifecycle management, and leads', connected: true, logo: '☁️' },
  { name: 'HubSpot', category: 'CRM', description: 'Email marketing and fan communication hub', connected: false, logo: '🧡' },
  { name: 'Meta Business Suite', category: 'Social', description: 'Instagram and Facebook ad performance sync', connected: true, logo: '📘' },
  { name: 'TikTok for Business', category: 'Social', description: 'TikTok content performance and ad data', connected: false, logo: '🎵' },
  { name: 'Sponsorship Hub', category: 'Sponsor Tools', description: 'ROI tracking and sponsor activation analytics', connected: true, logo: '🤝' },
  { name: 'Webhook / API', category: 'Developer', description: 'Custom integrations via REST API and webhooks', connected: true, logo: '⚙️' },
]

export default function Integrations() {
  const [integrations, setIntegrations] = useState(initialIntegrations)

  const toggle = (name: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.name === name ? { ...i, connected: !i.connected } : i))
    )
  }

  const categories = [...new Set(integrations.map((i) => i.category))]

  return (
    <div className="space-y-6">
      <PageHeader title="Integrations" subtitle="Connect your tools and data sources" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Connected', count: integrations.filter(i => i.connected).length, color: '#22c55e' },
          { label: 'Available', count: integrations.filter(i => !i.connected).length, color: '#64748b' },
          { label: 'Categories', count: categories.length, color: '#14b8a6' },
          { label: 'API Active', count: 1, color: '#a855f7' },
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
            {integrations.filter((i) => i.category === cat).map((intg) => (
              <div key={intg.name} className={`flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-xl border transition-all ${intg.connected ? 'border-[#22c55e]/30' : 'border-[#2a2f3e]'}`}>
                <span className="text-2xl flex-shrink-0">{intg.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#e2e8f0]">{intg.name}</div>
                  <div className="text-xs text-[#64748b] truncate">{intg.description}</div>
                </div>
                <button
                  onClick={() => toggle(intg.name)}
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
    </div>
  )
}
