import { fanSegments } from '../data/mockData'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'

const geo = [
  { city: 'Los Angeles, CA', pct: 34 },
  { city: 'New York, NY', pct: 18 },
  { city: 'Chicago, IL', pct: 12 },
  { city: 'Miami, FL', pct: 10 },
  { city: 'Houston, TX', pct: 8 },
  { city: 'Other', pct: 18 },
]

const segmentColors = ['#f59e0b', '#14b8a6', '#a855f7', '#3b82f6', '#64748b']

const recommendations: Record<string, string[]> = {
  'VIP Loyalists': ['Early access to new events', 'Exclusive artist meet & greet', 'Personalized thank-you gifts'],
  'High Engagers': ['Challenge invite campaigns', 'Tier upgrade offer', 'Merch discount codes'],
  'Returning Fans': ['Loyalty points program', 'Group ticket discount', 'Bring-a-friend offer'],
  'First-Timers': ['Welcome series email', 'First purchase discount', 'Onboarding guide to Brimz'],
  'Casual Attendees': ['Re-engagement campaign', 'Highlight reel push', 'Limited-time deal'],
}

export default function FanSegmentation() {
  return (
    <div className="space-y-6">
      <PageHeader title="Fan Segmentation" subtitle="Audience breakdown and campaign targeting by segment" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fanSegments.map((seg, i) => (
          <div key={seg.name} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4"
            style={{ borderTopColor: segmentColors[i], borderTopWidth: 2 }}>
            <div className="text-sm font-bold text-[#e2e8f0] mb-3">{seg.name}</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#64748b]">Fans</span><span className="text-[#e2e8f0] font-semibold">{seg.count.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Avg Spend</span><span className="font-semibold" style={{ color: segmentColors[i] }}>{seg.avgSpend}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Avg Visits</span><span className="text-[#e2e8f0] font-semibold">{seg.visits}x</span></div>
              <div className="mt-2">
                <ProgressBar label="Engagement" value={seg.engagement} color={segmentColors[i]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Geographic Breakdown" subtitle="Top fan locations by attendance share">
          <div className="space-y-3">
            {geo.map((g) => (
              <ProgressBar key={g.city} label={g.city} value={g.pct} color="#14b8a6" />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recommended Campaigns by Segment" subtitle="Targeted actions for each audience group" accent="purple">
          <div className="space-y-4">
            {fanSegments.slice(0, 3).map((seg, i) => (
              <div key={seg.name}>
                <div className="text-xs font-semibold mb-1.5" style={{ color: segmentColors[i] }}>{seg.name}</div>
                <div className="space-y-1">
                  {recommendations[seg.name].map((r, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-[#94a3b8]">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: segmentColors[i] }} />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
