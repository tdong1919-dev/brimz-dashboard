import { useMemo, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const tiers = [
  {
    name: 'Small Venues',
    examples: 'Bars, breweries, restaurants, small music venues',
    attendance: '50-500 attendees per event',
    price: '$99-$499/month',
    cta: 'Schedule Demo',
    includes: ['Fan Energy Index', 'Basic crowd analytics', 'Event summary reports', 'Participation tracking', 'Basic heat maps', 'Monthly benchmarking'],
  },
  {
    name: 'Mid-Market Venues',
    examples: 'Event halls, regional concert venues, casinos, universities',
    attendance: '500-10,000 attendees',
    price: '$500-$2,500/month',
    cta: 'Request Proposal',
    recommended: true,
    includes: ['Everything in Small', 'Advanced Fan Energy Index', 'Crowd flow intelligence', 'Theme Night Intelligence', 'Sponsor engagement analytics', 'Historical event comparisons', 'Executive reporting', 'API integrations'],
  },
  {
    name: 'Enterprise',
    examples: 'Sports arenas, stadiums, convention centers, major festivals, multi-venue operators',
    attendance: '10,000+ attendees',
    price: '$5,000-$50,000+ annually',
    cta: 'Contact Sales',
    enterprise: true,
    includes: ['Everything in Mid-Market', 'Multi-venue benchmarking', 'Custom dashboards', 'Executive intelligence reports', 'Sponsor ROI analytics', 'Dedicated Customer Success', 'Custom integrations', 'White-label reporting', 'AI recommendations', 'Priority feature access'],
  },
]

const consortium = ['Lifetime preferred pricing', 'Executive advisory access', 'Direct influence over the Fan Energy Index standard', 'Early access to new intelligence modules', 'Founding contributor recognition', 'Benchmark dataset access', 'Quarterly executive strategy sessions']

const faqs = [
  ['How is pricing determined?', 'Pricing is based on venue size, event volume, intelligence modules, integrations, and executive reporting needs.'],
  ['Can pricing scale with venue size?', 'Yes. Brimz can start with a single venue or pilot activation and expand into multi-venue intelligence.'],
  ['Can we start with a pilot?', 'Yes. Pilots work well for teams, campuses, festivals, arenas, and sponsor-led activations.'],
  ['Can Brimz integrate with Ticketmaster?', 'Brimz is designed to connect with ticketing, CRM, POS, and venue systems through approved data workflows.'],
  ['Can Brimz integrate with existing venue systems?', 'Yes. Integrations can connect attendance, POS, sponsor, campaign, and operational data into one venue intelligence layer.'],
]

function Feature({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-2 text-xs text-[#94a3b8]"><CheckCircle className="w-3.5 h-3.5 text-[#14b8a6] mt-0.5 flex-shrink-0" />{children}</div>
}

export default function Billing() {
  const [attendance, setAttendance] = useState(3000)
  const [events, setEvents] = useState(36)
  const [concessions, setConcessions] = useState(24)
  const [sponsorRevenue, setSponsorRevenue] = useState(250000)
  const [staffing, setStaffing] = useState(180000)

  const roi = useMemo(() => {
    const annualFans = attendance * events
    const savings = staffing * 0.12
    const sponsorValue = sponsorRevenue * 0.18
    const concessionLift = annualFans * concessions * 0.035
    const total = savings + sponsorValue + concessionLift
    const payback = Math.max(2, Math.round(12 / Math.max(total / 50000, 1)))
    return { savings, sponsorValue, concessionLift, total, payback }
  }, [attendance, events, concessions, sponsorRevenue, staffing])

  return (
    <div className="space-y-6">
      <PageHeader title="Venue Intelligence Pricing" subtitle="Venue-based pricing for live events, arenas, teams, sponsors, and fan experience executives" />

      <ChartCard title="Founding Venue Intelligence Consortium" subtitle="Invitation Only - limited to 10 organizations" accent="teal" className="shadow-[0_0_34px_rgba(20,184,166,0.12)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 items-start">
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#e2e8f0] mb-2">Founding Venue Intelligence Consortium</div>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">For the first organizations helping define the Fan Energy Index standard and the future benchmark dataset for live-event intelligence.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{consortium.map((item) => <Feature key={item}>{item}</Feature>)}</div>
          </div>
          <div className="bg-[#0f1220] border border-[#14b8a6]/30 rounded-xl p-4">
            <div className="text-xs text-[#14b8a6] font-bold uppercase tracking-widest mb-2">Invitation Only</div>
            <div className="text-sm text-[#64748b] mb-4">Custom / Invitation Only</div>
            <button className="w-full rounded-lg bg-[#14b8a6] text-black text-sm font-bold py-2 hover:bg-[#2dd4bf] transition-colors">Apply for Founding Membership</button>
          </div>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <div key={tier.name} className={`bg-[#141824] border rounded-xl p-4 transition-all sm:hover:-translate-y-1 hover:border-[#14b8a6]/50 ${tier.recommended ? 'border-[#14b8a6]/50 shadow-[0_0_28px_rgba(20,184,166,0.12)]' : tier.enterprise ? 'border-[#f59e0b]/40' : 'border-[#2a2f3e]'}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-lg font-black text-[#e2e8f0]">{tier.name}</h3>
              {tier.recommended && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#14b8a6]/15 text-[#14b8a6]">Recommended</span>}
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#14b8a6] mb-1">{tier.price}</div>
            <div className="text-xs text-[#64748b] mb-3">Typical attendance: {tier.attendance}</div>
            <div className="text-xs text-[#94a3b8] mb-4">Examples: {tier.examples}</div>
            <div className="space-y-2 mb-5">{tier.includes.map((item) => <Feature key={item}>{item}</Feature>)}</div>
            <button className={`w-full rounded-lg text-sm font-bold py-2 transition-colors ${tier.enterprise ? 'bg-[#f59e0b] text-black hover:bg-[#fbbf24]' : 'bg-[#1a1f2e] text-[#e2e8f0] hover:bg-[#14b8a6] hover:text-black'}`}>{tier.cta}</button>
          </div>
        ))}
      </div>

      <ChartCard title="ROI Calculator" subtitle="Estimate the business case for venue intelligence" accent="gold">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['Average attendance', attendance, setAttendance], ['Events per year', events, setEvents], ['Average concession spend', concessions, setConcessions], ['Sponsor revenue', sponsorRevenue, setSponsorRevenue], ['Staffing costs', staffing, setStaffing]].map(([label, value, setter]) => (
              <label key={label as string} className="text-xs text-[#94a3b8]">
                {label as string}
                <input className="mt-1 w-full rounded-lg bg-[#1a1f2e] border border-[#2a2f3e] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#14b8a6]" type="number" value={value as number} onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))} />
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
            <div className="bg-[#1a1f2e] rounded-lg p-3"><div className="text-lg sm:text-xl font-black text-[#14b8a6]">${Math.round(roi.savings).toLocaleString()}</div><div className="text-xs text-[#64748b]">Operational savings</div></div>
            <div className="bg-[#1a1f2e] rounded-lg p-3"><div className="text-lg sm:text-xl font-black text-[#f59e0b]">${Math.round(roi.sponsorValue).toLocaleString()}</div><div className="text-xs text-[#64748b]">Additional sponsor value</div></div>
            <div className="bg-[#1a1f2e] rounded-lg p-3"><div className="text-lg sm:text-xl font-black text-[#a855f7]">${Math.round(roi.concessionLift).toLocaleString()}</div><div className="text-xs text-[#64748b]">Concession lift</div></div>
            <div className="bg-[#1a1f2e] rounded-lg p-3"><div className="text-lg sm:text-xl font-black text-[#14b8a6]">${Math.round(roi.total).toLocaleString()}</div><div className="text-xs text-[#64748b]">Estimated annual ROI</div></div>
            <div className="min-[380px]:col-span-2 bg-[#0f1220] border border-[#14b8a6]/30 rounded-lg p-3"><div className="text-lg sm:text-xl font-black text-[#e2e8f0]">{roi.payback} months</div><div className="text-xs text-[#64748b]">Estimated payback period</div></div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="FAQ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{faqs.map(([q, a]) => <div key={q} className="bg-[#1a1f2e] rounded-lg p-3"><div className="text-sm font-semibold text-[#e2e8f0] mb-1">{q}</div><div className="text-xs text-[#64748b] leading-relaxed">{a}</div></div>)}</div>
      </ChartCard>
    </div>
  )
}
