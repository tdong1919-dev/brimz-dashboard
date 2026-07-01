import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import HeatmapCard from '../components/HeatmapCard'
import ProgressBar from '../components/ProgressBar'

function Stat({ label, value, color = '#14b8a6' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4 min-h-[96px]">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs text-[#64748b] mt-1 leading-snug">{label}</div>
    </div>
  )
}

function InsightCard({ title, text, priority = 'High' }: { title: string; text: string; priority?: string }) {
  return (
    <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-sm font-semibold text-[#e2e8f0]">{title}</div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14b8a6]/15 text-[#14b8a6]">{priority}</span>
      </div>
      <p className="text-xs text-[#64748b] leading-relaxed">{text}</p>
    </div>
  )
}

const themes = [
  { name: 'Cancer Awareness Night', fei: 91, participation: 78, impact: 94, peak: 'Bell ceremony', rec: 'Repeat the recognition structure and retarget donors during halftime.' },
  { name: 'Hoops & Hounds', fei: 84, participation: 69, impact: 88, peak: 'Adoption walkout', rec: 'Add lower-bowl camera prompts and a branded photo lane.' },
  { name: 'Military Appreciation Night', fei: 88, participation: 72, impact: 91, peak: 'Honor guard', rec: 'Keep the recognition moment separate from sponsor giveaways.' },
  { name: 'Youth Basketball Night', fei: 79, participation: 83, impact: 86, peak: 'Junior showcase', rec: 'Launch youth-team challenges earlier while families are active.' },
  { name: 'Pride Night', fei: 86, participation: 75, impact: 89, peak: 'Community anthem', rec: 'Expand partner storytelling around the light-band reveal.' },
]

const peaks = [
  ['6:42 PM', 'Opening ceremony', '82', 'Fans synced wristbands during introductions.'],
  ['7:18 PM', 'Sponsor activation', '79', 'The concourse scan-to-win promotion pulled families into the challenge.'],
  ['7:46 PM', 'Bell ceremony', '94', 'The recognition moment produced the strongest emotional language.'],
  ['8:12 PM', 'Halftime', '91', 'The halftime challenge converted attention into participation.'],
  ['8:41 PM', 'Mascot interaction', '88', 'Family zones reacted strongly to camera and reward prompts.'],
  ['9:24 PM', 'Final quarter', '96', 'A close score, rally lights, and prompts aligned across the arena.'],
]

const sponsors = [
  ['City Health Network', 'Awareness pledge wall', '38%', '91%', '$186K', '94', 'Main concourse'],
  ['Summit Bank', 'Halftime fan challenge', '44%', '86%', '$214K', '91', 'Lower bowl center'],
  ['Volt Beverage', 'Final quarter rally lights', '51%', '88%', '$242K', '96', 'Student section'],
  ['Metro Wireless', 'Photo share tunnel', '29%', '79%', '$119K', '76', 'Gate 2 entrance'],
]

export function FanEnergyIndex() {
  return (
    <div className="space-y-6">
      <PageHeader title="Fan Energy Index" subtitle="Quality of the fan experience, not just attendance" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Current FEI" value="87.4" />
        <Stat label="Participation rate" value="73%" color="#a855f7" />
        <Stat label="Positive sentiment" value="91%" />
        <Stat label="Sponsor moment lift" value="2.8x" color="#f59e0b" />
      </div>
      <ChartCard title="FEI Drivers" accent="teal">
        <div className="space-y-4">
          <ProgressBar label="Bell ceremony recognition" value={96} />
          <ProgressBar label="Halftime sponsor challenge" value={91} color="#f59e0b" />
          <ProgressBar label="Mascot lower-bowl lap" value={88} color="#a855f7" />
          <ProgressBar label="Final quarter rally lights" value={96} />
        </div>
      </ChartCard>
    </div>
  )
}

export function HeatMaps() {
  const modes = [
    ['Peak energy', 96, 'Final quarter rally generated the strongest full-arena pulse.'],
    ['Average energy', 82, 'Lower bowl and family zones stayed consistently above benchmark.'],
    ['Total energy', 88, 'Cumulative motion and participation exceeded the last theme night.'],
    ['Crowd congestion', 74, 'Gate 3 and west concourse showed the only sustained bottleneck.'],
    ['Activation zones', 91, 'Sponsor and community moments over-indexed in student and family sections.'],
  ] as const
  return (
    <div className="space-y-6">
      <PageHeader title="Heat Maps" subtitle="Peak energy, average energy, total energy, congestion, and activation zones" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Arena Heat Map" accent="teal"><HeatmapCard /></ChartCard>
        <ChartCard title="Heat Map Views" accent="teal">
          <div className="space-y-4">{modes.map(([label, value, note]) => <ProgressBar key={label} label={`${label}: ${note}`} value={value} color={label === 'Crowd congestion' ? '#f59e0b' : '#14b8a6'} />)}</div>
        </ChartCard>
      </div>
    </div>
  )
}

export function ThemeNights() {
  return (
    <div className="space-y-6">
      <PageHeader title="Theme Nights" subtitle="Community and special activation intelligence" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {themes.map((t) => (
          <ChartCard key={t.name} title={t.name} accent="teal">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Stat label="FEI" value={String(t.fei)} />
              <Stat label="Particip." value={`${t.participation}%`} color="#a855f7" />
              <Stat label="Impact" value={String(t.impact)} color="#f59e0b" />
            </div>
            <div className="text-xs text-[#94a3b8] mb-2">Emotional peak: <span className="text-[#e2e8f0]">{t.peak}</span></div>
            <p className="text-xs text-[#64748b] leading-relaxed">{t.rec}</p>
          </ChartCard>
        ))}
      </div>
    </div>
  )
}

export function SponsorIntelligence() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sponsor Intelligence" subtitle="Activation performance, fan sentiment, estimated value, and renewal opportunity" />
      <ChartCard title="Sponsor Activation Performance" accent="gold">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[#2a2f3e]">{['Sponsor','Activation','Interaction','Sentiment','Value','Renewal','Best Zone'].map(h => <th key={h} className="text-left py-2 px-3 text-[10px] text-[#64748b] uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{sponsors.map((s) => <tr key={s[0]} className="border-b border-[#1a1f2e]"><td className="py-3 px-3 font-semibold text-[#e2e8f0] whitespace-nowrap">{s[0]}</td><td className="py-3 px-3 text-[#94a3b8] whitespace-nowrap">{s[1]}</td><td className="py-3 px-3 text-[#14b8a6] font-bold">{s[2]}</td><td className="py-3 px-3 text-[#94a3b8]">{s[3]}</td><td className="py-3 px-3 text-[#f59e0b] font-bold">{s[4]}</td><td className="py-3 px-3 text-[#14b8a6] font-bold">{s[5]}</td><td className="py-3 px-3 text-[#94a3b8] whitespace-nowrap">{s[6]}</td></tr>)}</tbody></table></div>
      </ChartCard>
    </div>
  )
}

export function EmotionalPeaks() {
  return (
    <div className="space-y-6">
      <PageHeader title="Emotional Peaks" subtitle="Timeline of moments when fan energy spiked" />
      <ChartCard title="Peak Moments Timeline" accent="purple"><div className="space-y-3">{peaks.map(([time, moment, fei, why]) => <div key={time} className="grid grid-cols-1 md:grid-cols-[80px_1fr_70px] gap-3 bg-[#1a1f2e] rounded-lg p-3"><div className="text-xs font-bold text-[#14b8a6]">{time}</div><div><div className="text-sm font-semibold text-[#e2e8f0]">{moment}</div><div className="text-xs text-[#64748b] mt-1">{why}</div></div><div className="md:text-right text-lg font-black text-[#f59e0b]">{fei}</div></div>)}</div></ChartCard>
    </div>
  )
}

export function EventComparison() {
  return (
    <div className="space-y-6">
      <PageHeader title="Event Comparison" subtitle="Current event vs previous event and theme-night benchmark" />
      <ChartCard title="Comparison Metrics" accent="teal"><div className="space-y-4">{[['FEI',87,74],['Participation',73,58],['Sponsor engagement',84,63],['Sentiment',91,82],['Community impact',94,78]].map(([label, current, previous]) => <div key={label as string}><ProgressBar label={`${label}: current ${current} vs previous ${previous}`} value={current as number} /><div className="mt-1 h-1 bg-[#2a2f3e] rounded"><div className="h-full rounded bg-[#64748b]" style={{ width: `${previous}%` }} /></div></div>)}</div></ChartCard>
    </div>
  )
}

export function ExecutiveInsights() {
  return (
    <div className="space-y-6">
      <PageHeader title="Executive Insights" subtitle="Decision-ready recommendations for venue, sponsor, staffing, and fan experience leaders" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightCard title="What worked" text="The bell ceremony created the strongest emotional peak and sponsor-safe community story." />
        <InsightCard title="What underperformed" priority="Medium" text="Gate 3 exit congestion lowered late-event participation and exit sentiment." />
        <InsightCard title="Sponsor recommendation" text="Volt Beverage and City Health Network showed renewal-ready engagement." />
        <InsightCard title="Theme night recommendation" text="Cancer Awareness Night outperformed the prior theme-night average by 14 points." />
        <InsightCard title="Staffing recommendation" priority="Medium" text="Shift two mobile staff teams to west concourse from final timeout through exit." />
        <InsightCard title="Fan experience recommendation" priority="Medium" text="Segment prompts by zone: camera-driven challenges for families and timed challenges for students." />
      </div>
    </div>
  )
}
