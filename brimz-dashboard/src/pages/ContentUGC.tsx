import {
  BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useUgc, human } from '../api/queries'
import QueryBoundary from '../components/QueryBoundary'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
}

const platformColors: Record<string, string> = {
  Instagram: '#e1306c',
  TikTok: '#69c9d0',
  'Twitter/X': '#1d9bf0',
}

// demo-static: hashtag post volume is not tracked by the API (UGC rows carry shares/likes only)
const hashtags = [
  { tag: '#BrimzEnergy', posts: 14200 },
  { tag: '#BrimzFest', posts: 9800 },
  { tag: '#BrimzVibes', posts: 8900 },
  { tag: '#LiveMoreBrimz', posts: 6400 },
  { tag: '#Brimz', posts: 4200 },
]

const opportunities = [
  { title: 'Create a branded TikTok challenge', desc: 'Fan videos performing the headliner move — offer prize for best clip' },
  { title: 'Hashtag leaderboard in-app', desc: 'Show fans real-time UGC rankings — drives competition and volume' },
  { title: 'Instagram Story collab wall', desc: 'Curate fan stories on big screen at venue — drives more content creation' },
]

const typeIcon = (type: string) =>
  type === 'Video' || type === 'Reel' ? '🎬' : type === 'Photo' ? '📸' : type === 'Story' ? '⭕' : '💬'

export default function ContentUGC() {
  const ugcQ = useUgc()

  return (
    <div className="space-y-6">
      <PageHeader title="Content & UGC" subtitle="Fan-generated content, social performance, and opportunities" />

      {/* Summary KPIs — shares/likes/top hashtag aggregated from live UGC rows */}
      <QueryBoundary query={ugcQ} compact>
        {(ugc) => {
          const totalShares = ugc.reduce((sum, c) => sum + c.shares, 0)
          const totalLikes = ugc.reduce((sum, c) => sum + c.likes, 0)
          const topHashtag = ugc.reduce((best, c) => (c.likes > best.likes ? c : best), ugc[0])?.hashtag ?? '—'
          const kpis = [
            { label: 'Total Shares', value: human(totalShares), color: '#14b8a6' },
            { label: 'Total Likes', value: human(totalLikes), color: '#a855f7' },
            { label: 'Top Hashtag', value: topHashtag, color: '#f59e0b' },
            // demo-static: no "viral" threshold defined in the API
            { label: 'Viral Posts', value: '4', color: '#22c55e' },
          ]
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {kpis.map((k) => (
                <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
                  <div className="text-xl font-black mb-1 truncate" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs text-[#64748b]">{k.label}</div>
                </div>
              ))}
            </div>
          )
        }}
      </QueryBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top Fan Content" subtitle="Highest performing posts by engagement">
          <QueryBoundary query={ugcQ} compact>
            {(ugc) => (
              <div className="space-y-3">
                {ugc.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg hover:bg-[#1f2535] transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ backgroundColor: `${platformColors[c.platform] ?? '#64748b'}20` }}>
                      {typeIcon(c.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#e2e8f0]">{c.hashtag}</div>
                      <div className="text-xs text-[#64748b]">{c.platform} · {c.type} · {c.time}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-[#14b8a6]">{c.likes.toLocaleString()}</div>
                      <div className="text-[10px] text-[#64748b]">likes</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </QueryBoundary>
        </ChartCard>

        <div className="space-y-4">
          <ChartCard title="Share Volume by Platform" subtitle="Total shares across social networks" accent="teal">
            <QueryBoundary query={ugcQ} compact>
              {(ugc) => {
                const byPlatform = new Map<string, number>()
                for (const c of ugc) byPlatform.set(c.platform, (byPlatform.get(c.platform) ?? 0) + c.shares)
                const platformShares = [...byPlatform.entries()]
                  .map(([platform, shares]) => ({ platform, shares }))
                  .sort((a, b) => b.shares - a.shares)
                return (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={platformShares}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                      <XAxis dataKey="platform" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="shares" name="Shares" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              }}
            </QueryBoundary>
          </ChartCard>

          <ChartCard title="Top Hashtags" subtitle="By post volume">
            <div className="space-y-2">
              {hashtags.map((h, i) => (
                <div key={h.tag} className="flex items-center justify-between p-2 bg-[#1a1f2e] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#64748b]">#{i + 1}</span>
                    <span className="text-sm font-semibold text-[#a855f7]">{h.tag}</span>
                  </div>
                  <span className="text-xs text-[#94a3b8]">{h.posts.toLocaleString()} posts</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Content Opportunities" subtitle="Strategies to amplify fan-generated content">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {opportunities.map((o) => (
            <div key={o.title} className="bg-[#1a1f2e] border border-[#a855f7]/20 rounded-xl p-4">
              <div className="text-sm font-semibold text-[#e2e8f0] mb-2">{o.title}</div>
              <div className="text-xs text-[#64748b]">{o.desc}</div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
