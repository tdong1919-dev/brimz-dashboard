import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts'
import {
  kpis, energyTimeline, zoneEngagement, fanEmotions, emotionDrivers,
  engagementBreakdown, demographics, revenue, sponsorSummary,
  topMoments, crowdTriggers,
} from '../data/mockData'
import KPICard from '../components/KPICard'
import HeatmapCard from '../components/HeatmapCard'

const TT = {
  contentStyle: { backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 11 },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#e2e8f0' },
}

// ── tiny helpers ──────────────────────────────────────────────────────────────
function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold tracking-widest text-[#94a3b8] uppercase">{title}</span>
        <span className="text-[#2a2f3e] text-xs">ⓘ</span>
      </div>
      {right}
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#141824] border border-[#1e2535] rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}

function UpBadge({ pct }: { pct: number }) {
  const pos = pct >= 0
  return (
    <span className={`text-[10px] font-bold ${pos ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
      {pos ? '↑' : '↓'} {Math.abs(pct)}%
    </span>
  )
}

// ── Stage event markers ───────────────────────────────────────────────────────
const stages = [
  { time: '6 PM',  label: 'Doors Open'  },
  { time: '7 PM',  label: 'Opening Act' },
  { time: '8 PM',  label: 'Headliner'   },
  { time: '10:15', label: 'Encore'      },
]

// ── Engagement zone colours ───────────────────────────────────────────────────
function zoneColor(score: number) {
  if (score >= 85) return '#14b8a6'
  if (score >= 70) return '#14b8a6'
  if (score >= 55) return '#14b8a6'
  return '#14b8a6'
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Overview() {
  return (
    <div className="space-y-3">

      {/* Page header */}
      <div className="mb-1">
        <h1 className="text-2xl font-black tracking-wide text-[#f1f5f9] uppercase">Overview</h1>
        <p className="text-xs text-[#64748b] mt-0.5">Real-time &amp; historical performance insights</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button className="flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg px-3 py-1.5 text-xs text-[#94a3b8] hover:border-[#3a3f4e]">
          📅 May 15 – May 19, 2024
        </button>
        <button className="flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg px-3 py-1.5 text-xs text-[#94a3b8] hover:border-[#3a3f4e]">
          All Events ▾
        </button>
        <button className="flex items-center gap-1.5 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg px-3 py-1.5 text-xs text-[#64748b] hover:text-[#94a3b8]">
          + Add Filter
        </button>
        <div className="flex-1" />
        <button className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-bold px-4 py-1.5 rounded-lg">
          ↓ Export Report
        </button>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} color={k.color as 'teal' | 'gold' | 'purple'} />
        ))}
      </div>

      {/* ── Row 1: Heatmap | Energy Over Time | Zone Engagement ── */}
      <div className="grid grid-cols-12 gap-3">

        {/* Crowd Energy Heatmap */}
        <Card className="col-span-12 lg:col-span-5">
          <SectionHeader title="Crowd Energy Heatmap" />
          <HeatmapCard />
        </Card>

        {/* Energy Over Time */}
        <Card className="col-span-12 lg:col-span-4">
          <SectionHeader title="Energy Over Time"
            right={<button className="text-[10px] bg-[#1a1f2e] border border-[#2a2f3e] rounded px-2 py-0.5 text-[#64748b]">All Events ▾</button>}
          />
          {/* Peak annotation */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-[#64748b]">Energy</span>
            <span className="ml-auto text-[10px] text-[#14b8a6] font-semibold">8:24 PM · Peak Energy: 98K</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={energyTimeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip {...TT} formatter={(v: number) => [`${(v/1000).toFixed(0)}K`, 'Energy']} />
              <Area type="monotone" dataKey="energy" stroke="#14b8a6" strokeWidth={2}
                fill="url(#energyFill)" dot={false} />
              {/* Peak dot */}
              <ReferenceLine x="8:24" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Stage markers */}
          <div className="flex justify-between mt-2 border-t border-[#1e293b] pt-2">
            {stages.map((s) => (
              <div key={s.time} className="text-center">
                <div className="text-[9px] font-semibold text-[#64748b]">{s.label}</div>
                <div className="text-[9px] text-[#475569]">{s.time}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement by Stadium Zone */}
        <Card className="col-span-12 lg:col-span-3">
          <SectionHeader title="Engagement by Stadium Zone"
            right={<button className="text-[10px] bg-[#1a1f2e] border border-[#2a2f3e] rounded px-2 py-0.5 text-[#64748b]">All Events ▾</button>}
          />
          <div className="flex justify-end gap-4 mb-2">
            <span className="text-[9px] text-[#64748b]">Engagement Score</span>
            <span className="text-[9px] text-[#64748b]">vs Avg</span>
          </div>
          <div className="space-y-2.5">
            {zoneEngagement.map((z) => (
              <div key={z.zone}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-[#94a3b8] w-24 sm:w-36 flex-shrink-0 truncate">{z.zone}</span>
                  <div className="flex-1 h-3 bg-[#1a1f2e] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${z.score}%`, backgroundColor: zoneColor(z.score) }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#e2e8f0] w-6 text-right flex-shrink-0">{z.score}</span>
                  <span className={`text-[10px] font-semibold w-10 text-right flex-shrink-0 ${z.vsAvg >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {z.vsAvg >= 0 ? '↑' : '↓'} {Math.abs(z.vsAvg)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#475569] mt-3">Floor GA leads — proximity to action drives highest zone score</p>
        </Card>
      </div>

      {/* ── Row 2: Fan Emotions | Engagement Breakdown | Demographics ── */}
      <div className="grid grid-cols-12 gap-3">

        {/* Fan Emotions */}
        <Card className="col-span-12 lg:col-span-4">
          <SectionHeader title="Fan Emotions" />
          <div className="flex items-start gap-3">
            {/* Donut */}
            <div className="flex-shrink-0">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={fanEmotions} dataKey="value" nameKey="emotion"
                    cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2}>
                    {fanEmotions.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip {...TT} formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1 mt-1 justify-center">
                {fanEmotions.map((e) => (
                  <div key={e.emotion} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className="text-[9px] text-[#64748b]">{e.emotion} {e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Top drivers */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide mb-2">Top Drivers</div>
              <div className="space-y-2">
                {emotionDrivers.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#475569] w-3">{i + 1}.</span>
                    <span className="text-[10px] text-[#94a3b8] flex-1 truncate">{d.name}</span>
                    <span className="text-[10px] font-bold text-[#e2e8f0]">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Engagement Breakdown */}
        <Card className="col-span-12 lg:col-span-5">
          <SectionHeader title="Engagement Breakdown" />
          {/* 4 mini stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {engagementBreakdown.stats.map((s) => (
              <div key={s.label} className="bg-[#1a1f2e] rounded-lg p-2">
                <div className="text-[9px] text-[#64748b] uppercase tracking-wide mb-1 leading-tight">{s.label}</div>
                <div className="text-sm font-black text-[#e2e8f0]">{s.value}</div>
                <UpBadge pct={s.change} />
              </div>
            ))}
          </div>
          {/* Multi-line chart */}
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={engagementBreakdown.timeline} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip {...TT} formatter={(v: number) => [`${(v/1000).toFixed(1)}K`, '']} />
              <Line type="monotone" dataKey="polls"      name="Polls"      stroke="#14b8a6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="challenges" name="Challenges" stroke="#a855f7" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="rewards"    name="Rewards"    stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="shares"     name="Shares"     stroke="#f97316" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-1.5 justify-center">
            {[['Polls','#14b8a6'],['Challenges','#a855f7'],['Rewards','#f59e0b'],['Shares','#f97316']].map(([lbl, col]) => (
              <div key={lbl} className="flex items-center gap-1">
                <div className="w-5 h-0.5 rounded" style={{ backgroundColor: col }} />
                <span className="text-[9px] text-[#64748b]">{lbl}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Attendance & Demographics */}
        <Card className="col-span-12 lg:col-span-3">
          <SectionHeader title="Attendance &amp; Demographics" />
          {/* Age range */}
          <div className="mb-3">
            <div className="text-[9px] font-semibold text-[#64748b] uppercase tracking-wide mb-2">Age Range</div>
            <div className="space-y-1.5">
              {demographics.ageGroups.map((a) => (
                <div key={a.group} className="flex items-center gap-2">
                  <span className="text-[9px] text-[#64748b] w-9 flex-shrink-0">{a.group}</span>
                  <div className="flex-1 h-1.5 bg-[#1a1f2e] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#14b8a6]" style={{ width: `${a.pct * 2.5}%` }} />
                  </div>
                  <span className="text-[9px] text-[#94a3b8] w-6 text-right">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          {/* Gender */}
          <div className="flex items-center gap-3 mb-3 border-t border-[#1e293b] pt-2">
            <div className="text-[9px] font-semibold text-[#64748b] uppercase tracking-wide">Gender</div>
            <div className="flex-shrink-0">
              <ResponsiveContainer width={60} height={60}>
                <PieChart>
                  <Pie data={demographics.gender} dataKey="value" cx="50%" cy="50%" innerRadius={16} outerRadius={28}>
                    {demographics.gender.map((g, i) => <Cell key={i} fill={g.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {demographics.gender.map((g) => (
                <div key={g.name} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-[9px] text-[#64748b]">{g.value}% {g.name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Top locations */}
          <div className="border-t border-[#1e293b] pt-2">
            <div className="text-[9px] font-semibold text-[#64748b] uppercase tracking-wide mb-1.5">Top Locations</div>
            <div className="space-y-1">
              {demographics.locations.map((l, i) => (
                <div key={l.city} className="flex justify-between">
                  <span className="text-[9px] text-[#94a3b8]">{i + 1}. {l.city}</span>
                  <span className="text-[9px] font-semibold text-[#64748b]">{l.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 3: Revenue | Sponsor ROI | Top Moments ── */}
      <div className="grid grid-cols-12 gap-3">

        {/* Revenue Summary */}
        <Card className="col-span-12 lg:col-span-4">
          <SectionHeader title="Revenue Summary" />
          <div className="flex items-start gap-3 mb-3">
            {/* Donut */}
            <div className="flex-shrink-0">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={revenue.breakdown} dataKey="amount" cx="50%" cy="50%"
                    innerRadius={30} outerRadius={50} paddingAngle={2}>
                    {revenue.breakdown.map((r, i) => <Cell key={i} fill={r.color} />)}
                  </Pie>
                  <Tooltip {...TT} formatter={(v: number) => [`$${(v/1000).toFixed(0)}K`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Numbers */}
            <div className="flex-1">
              <div className="text-2xl font-black text-[#f59e0b]">$2.48M</div>
              <UpBadge pct={revenue.change} />
              <div className="text-[9px] text-[#475569]">vs previous 5 events</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                {revenue.breakdown.map((r) => (
                  <div key={r.category}>
                    <div className="text-[10px] font-bold" style={{ color: r.color }}>
                      ${r.amount >= 1000000 ? `${(r.amount/1000000).toFixed(2)}M` : `${(r.amount/1000).toFixed(0)}K`}
                    </div>
                    <div className="text-[9px] text-[#64748b]">{r.category} {r.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[#1e293b] pt-3">
            <div>
              <div className="text-[9px] text-[#64748b]">Average Spend Per Fan</div>
              <div className="text-sm font-black text-[#e2e8f0]">${revenue.perFan.toFixed(2)}</div>
              <UpBadge pct={revenue.perFanChange} />
            </div>
            <div>
              <div className="text-[9px] text-[#64748b]">Transactions</div>
              <div className="text-sm font-black text-[#e2e8f0]">{revenue.transactions.toLocaleString()}</div>
              <UpBadge pct={revenue.transactionsChange} />
            </div>
          </div>
        </Card>

        {/* Sponsor ROI Summary */}
        <Card className="col-span-12 lg:col-span-5">
          <SectionHeader title="Sponsor ROI Summary" />
          <div className="flex items-start gap-3 mb-3">
            {/* Donut */}
            <div className="flex-shrink-0">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={sponsorSummary.breakdown} dataKey="pct" cx="50%" cy="50%"
                    innerRadius={30} outerRadius={50} paddingAngle={2}>
                    {sponsorSummary.breakdown.map((r, i) => <Cell key={i} fill={r.color} />)}
                  </Pie>
                  <Tooltip {...TT} formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Numbers */}
            <div className="flex-1">
              <div className="text-2xl font-black text-[#f59e0b]">$756K</div>
              <UpBadge pct={sponsorSummary.change} />
              <div className="text-[9px] text-[#475569] mb-2">vs previous 5 events</div>
              {/* 4 sponsor metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Impressions', ...sponsorSummary.impressions },
                  { label: 'Engagements', ...sponsorSummary.engagements },
                  { label: 'Clicks',      ...sponsorSummary.clicks      },
                  { label: 'Conversions', ...sponsorSummary.conversions  },
                ].map((m) => (
                  <div key={m.label} className="bg-[#1a1f2e] rounded-lg p-1.5">
                    <div className="text-[9px] text-[#64748b] leading-tight mb-0.5">{m.label}</div>
                    <div className="text-xs font-bold text-[#e2e8f0]">{m.value}</div>
                    <UpBadge pct={m.change} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[#1e293b] pt-3">
            <div>
              <div className="text-[9px] text-[#64748b]">Avg. ROI</div>
              <div className="text-sm font-black text-[#f59e0b]">{sponsorSummary.avgROI.value}x</div>
              <UpBadge pct={sponsorSummary.avgROI.change} />
            </div>
            <div>
              <div className="text-[9px] text-[#64748b]">Top Performing Sponsor</div>
              <div className="text-sm font-black text-[#e2e8f0]">{sponsorSummary.topSponsor.name}</div>
              <div className="text-[10px] font-bold text-[#f59e0b]">{sponsorSummary.topSponsor.roi}x ROI</div>
            </div>
          </div>
        </Card>

        {/* Top Moments */}
        <Card className="col-span-12 lg:col-span-3">
          <SectionHeader title="Top Moments"
            right={<button className="text-[10px] bg-[#1a1f2e] border border-[#2a2f3e] rounded px-2 py-0.5 text-[#64748b]">By Energy ▾</button>}
          />
          <div className="space-y-2 mb-3">
            {topMoments.map((m) => (
              <div key={m.rank} className="flex items-center gap-2">
                {/* Color swatch thumbnail */}
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white"
                  style={{ backgroundColor: m.color }}>
                  {m.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-[#e2e8f0] leading-tight truncate">{m.event}</div>
                  <div className="text-[9px] text-[#64748b]">{m.time}</div>
                </div>
                {/* Energy bar */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-[#94a3b8]">{(m.energy / 1000).toFixed(0)}K</div>
                  <div className="w-12 h-1 bg-[#1e293b] rounded-full mt-0.5">
                    <div className="h-full rounded-full" style={{ width: `${(m.energy / 98000) * 100}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* What forced the crowd */}
          <div className="border-t border-[#1e293b] pt-2">
            <div className="text-[9px] font-semibold text-[#64748b] uppercase tracking-wide mb-2">What Forced the Crowd?</div>
            <div className="flex flex-wrap gap-1">
              {crowdTriggers.map((t) => (
                <span key={t} className="text-[9px] font-semibold text-[#14b8a6] bg-[#14b8a6]/10 border border-[#14b8a6]/20 rounded px-1.5 py-0.5">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}
