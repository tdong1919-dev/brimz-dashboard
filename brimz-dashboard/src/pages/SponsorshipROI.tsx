import {
  BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useSponsorRoi } from '../api/queries'
import QueryBoundary from '../components/QueryBoundary'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
}

const tierColors: Record<string, string> = {
  Platinum: '#a855f7',
  Gold: '#f59e0b',
  Silver: '#94a3b8',
}

// Label + color per summary KPI; the value comes from the live sponsor-ROI aggregate.
const SUMMARY_META: { label: string; key: 'impressions' | 'engagements' | 'clicks' | 'conversions'; color: string }[] = [
  { label: 'Total Impressions', key: 'impressions', color: '#f59e0b' },
  { label: 'Total Engagements', key: 'engagements', color: '#14b8a6' },
  { label: 'Total Clicks', key: 'clicks', color: '#a855f7' },
  { label: 'Total Conversions', key: 'conversions', color: '#22c55e' },
]

// demo-static: no per-activation endpoint in MVP
const activations = [
  { name: 'Nike LED Wall – VIP', impressions: '980K', engagement: '92K', rating: 9.4 },
  { name: 'Red Bull Energy Zone', impressions: '760K', engagement: '74K', rating: 8.8 },
  { name: 'Samsung Photo Booth', impressions: '420K', engagement: '52K', rating: 8.2 },
]

export default function SponsorshipROI() {
  const roiQ = useSponsorRoi()

  return (
    <div className="space-y-6">
      <PageHeader title="Sponsorship ROI" subtitle="Performance metrics across all active sponsors" />

      <QueryBoundary query={roiQ} compact>
        {(data) => (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUMMARY_META.map((k) => (
              <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
                <div className="text-2xl font-black mb-1" style={{ color: k.color }}>{data.summary[k.key]}</div>
                <div className="text-xs text-[#64748b]">{k.label}</div>
              </div>
            ))}
          </div>
        )}
      </QueryBoundary>

      <ChartCard title="ROI by Sponsor" subtitle="Return on investment percentage per sponsor" accent="gold">
        <QueryBoundary query={roiQ} compact>
          {(data) => (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.sponsors.map((s) => ({ name: s.name, roi: parseInt(s.roi) || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'ROI']} />
                  <Bar dataKey="roi" name="ROI" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-[#64748b] mt-2">
                {data.summary.topSponsor.name} leads at {Math.round(data.summary.topSponsor.roi * 100)}% ROI — highest conversion across activations
              </p>
            </>
          )}
        </QueryBoundary>
      </ChartCard>

      <ChartCard title="Sponsor Performance Table" subtitle="Full metrics across all sponsors">
        <QueryBoundary query={roiQ} compact>
          {(data) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2f3e]">
                    {['Sponsor', 'Tier', 'Impressions', 'Engagements', 'Clicks', 'Conversions', 'ROI'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sponsors.map((s) => (
                    <tr key={s.name} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#e2e8f0]">{s.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: `${tierColors[s.tier] ?? '#64748b'}20`, color: tierColors[s.tier] ?? '#64748b' }}>
                          {s.tier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#94a3b8]">{s.impressions}</td>
                      <td className="py-2.5 px-3 text-[#94a3b8]">{s.engagements}</td>
                      <td className="py-2.5 px-3 text-[#94a3b8]">{s.clicks}</td>
                      <td className="py-2.5 px-3 text-[#94a3b8]">{s.conversions}</td>
                      <td className="py-2.5 px-3 font-bold text-[#f59e0b]">{s.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryBoundary>
      </ChartCard>

      <ChartCard title="Top Performing Activations" subtitle="Best sponsor activations by engagement and impressions" accent="gold">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activations.map((a) => (
            <div key={a.name} className="bg-[#1a1f2e] border border-[#f59e0b]/20 rounded-xl p-4">
              <div className="text-sm font-semibold text-[#e2e8f0] mb-3">{a.name}</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#64748b]">Impressions</span><span className="text-[#f59e0b] font-semibold">{a.impressions}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Engagements</span><span className="text-[#14b8a6] font-semibold">{a.engagement}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Rating</span><span className="text-[#e2e8f0] font-bold">{a.rating}/10</span></div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* demo-static: recommendations are editorial, not derived from an API endpoint */}
      <ChartCard title="Sponsorship Recommendations" subtitle="Data-driven opportunities for next event">
        <div className="space-y-3">
          {[
            { rec: 'Upgrade Pepsi to Gold tier — strong engagement growth trend', priority: 'High' },
            { rec: 'Add interactive Samsung AR activation in Floor GA', priority: 'Medium' },
            { rec: 'Negotiate Spotify exclusive streaming rights for fan highlights', priority: 'Medium' },
            { rec: 'Introduce new sponsor category: sustainable beverage brand', priority: 'Low' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-[#1a1f2e] rounded-lg">
              <div className="flex-1 text-sm text-[#e2e8f0]">{r.rec}</div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                r.priority === 'High' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                r.priority === 'Medium' ? 'bg-[#14b8a6]/20 text-[#14b8a6]' :
                'bg-[#64748b]/20 text-[#64748b]'
              }`}>{r.priority}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
