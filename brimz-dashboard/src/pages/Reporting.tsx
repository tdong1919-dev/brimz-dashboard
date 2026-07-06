import { FileText, Download, Calendar } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import QueryBoundary from '../components/QueryBoundary'
import { useKpis, useRevenueSummary, human } from '../api/queries'

// demo-static: saved reports, report-builder types, and scheduled deliveries
// have no backing endpoint in the MVP.
const savedReports = [
  { name: 'Q2 Event Performance Summary', type: 'Performance', date: '2026-05-20', status: 'Ready' },
  { name: 'Summer Fest Night 1 — Full Report', type: 'Event', date: '2026-05-18', status: 'Ready' },
  { name: 'Sponsor ROI Q2', type: 'Sponsorship', date: '2026-05-15', status: 'Ready' },
  { name: 'Fan Engagement Deep Dive', type: 'Engagement', date: '2026-05-10', status: 'Ready' },
  { name: 'Monthly Revenue Report — April', type: 'Revenue', date: '2026-05-01', status: 'Archived' },
]

const reportTypes = [
  { name: 'Revenue Report', icon: '💰', desc: 'Full gross and net breakdown', color: '#f59e0b' },
  { name: 'Engagement Report', icon: '⚡', desc: 'Fan activity and interaction metrics', color: '#14b8a6' },
  { name: 'Crowd Report', icon: '🏟️', desc: 'Zone heatmaps and energy analysis', color: '#a855f7' },
  { name: 'Sponsor Report', icon: '🤝', desc: 'ROI and activation performance', color: '#3b82f6' },
]

const scheduled = [
  { name: 'Weekly Performance Summary', freq: 'Every Monday 9AM', next: '2026-05-27', status: 'Active' },
  { name: 'Monthly Executive Brief', freq: 'First of month', next: '2026-06-01', status: 'Active' },
  { name: 'Post-Event Auto Report', freq: 'After each event', next: 'Auto', status: 'Active' },
]

export default function Reporting() {
  const revenueQuery = useRevenueSummary()
  const kpisQuery = useKpis()

  return (
    <div className="space-y-6">
      <PageHeader title="Reporting" subtitle="Build, schedule, and export executive reports" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Saved Reports" subtitle="Your recently generated reports">
          <div className="space-y-2">
            {savedReports.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg hover:bg-[#1f2535] transition-colors cursor-pointer">
                <FileText className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#e2e8f0] truncate">{r.name}</div>
                  <div className="text-xs text-[#64748b]">{r.type} · {r.date}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.status === 'Ready' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#64748b]/20 text-[#64748b]'}`}>
                    {r.status}
                  </span>
                  <Download className="w-4 h-4 text-[#64748b] hover:text-[#f59e0b]" />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Report Builder" subtitle="Generate a new report by type">
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((rt) => (
              <button key={rt.name} className="bg-[#1a1f2e] border border-[#2a2f3e] hover:border-opacity-60 rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
                style={{ borderColor: `${rt.color}30` }}>
                <div className="text-2xl mb-2">{rt.icon}</div>
                <div className="text-sm font-semibold text-[#e2e8f0] mb-1">{rt.name}</div>
                <div className="text-xs text-[#64748b]">{rt.desc}</div>
              </button>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Scheduled Reports" subtitle="Automated report delivery schedule">
          <div className="space-y-3">
            {scheduled.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg">
                <Calendar className="w-4 h-4 text-[#14b8a6] flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#e2e8f0]">{s.name}</div>
                  <div className="text-xs text-[#64748b]">{s.freq} · Next: {s.next}</div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex-shrink-0">{s.status}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Executive Summary Preview" subtitle="Auto-generated from last event" accent="gold">
          <div className="space-y-3 text-sm">
            <QueryBoundary query={revenueQuery} compact>
              {(rev) => {
                const ticketing = rev.breakdown.find((b) => b.category === 'Ticketing')
                return (
                  <div className="p-3 bg-[#1a1f2e] rounded-lg border-l-2 border-[#f59e0b]">
                    <div className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wide mb-1">Revenue</div>
                    <div className="text-[#e2e8f0]">
                      ${human(rev.total)} gross revenue across {rev.transactions.toLocaleString()} transactions.
                      {ticketing ? ` Ticketing drove ${Math.round(ticketing.pct)}% of total revenue.` : ''}
                    </div>
                  </div>
                )
              }}
            </QueryBoundary>
            <QueryBoundary query={kpisQuery} compact>
              {(kpis) => {
                const eng = kpis.find((k) => k.label === 'Avg Engagement Score')
                return (
                  <div className="p-3 bg-[#1a1f2e] rounded-lg border-l-2 border-[#14b8a6]">
                    <div className="text-xs font-semibold text-[#14b8a6] uppercase tracking-wide mb-1">Engagement</div>
                    <div className="text-[#e2e8f0]">
                      {eng ? `${eng.value}${eng.suffix ?? ''} avg engagement score across the venue.` : 'Engagement score unavailable.'}
                    </div>
                  </div>
                )
              }}
            </QueryBoundary>
            {/* demo-static: fan sentiment / NPS is not tracked in the MVP API */}
            <div className="p-3 bg-[#1a1f2e] rounded-lg border-l-2 border-[#a855f7]">
              <div className="text-xs font-semibold text-[#a855f7] uppercase tracking-wide mb-1">Fan Sentiment</div>
              <div className="text-[#e2e8f0]">84% positive sentiment. NPS of 72 — top quartile for live entertainment venues.</div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
