import { CreditCard, CheckCircle } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'

const invoices = [
  { id: 'INV-2026-05', period: 'May 2026', amount: '$899', status: 'Paid', date: '2026-05-01' },
  { id: 'INV-2026-04', period: 'Apr 2026', amount: '$899', status: 'Paid', date: '2026-04-01' },
  { id: 'INV-2026-03', period: 'Mar 2026', amount: '$899', status: 'Paid', date: '2026-03-01' },
  { id: 'INV-2026-02', period: 'Feb 2026', amount: '$899', status: 'Paid', date: '2026-02-01' },
  { id: 'INV-2026-01', period: 'Jan 2026', amount: '$799', status: 'Paid', date: '2026-01-01' },
]

const planFeatures = [
  'Up to 5 venues',
  'Unlimited events per month',
  '50,000 fan wristband connections',
  'Advanced AI analytics',
  'Sponsor ROI tracking',
  'Priority support',
  'Custom integrations',
  'White-label reports',
]

const usage = [
  { label: 'Events this month', used: 4, limit: 999, color: '#14b8a6', unit: 'events' },
  { label: 'Fan connections', used: 24847, limit: 50000, color: '#a855f7', unit: 'fans' },
  { label: 'Active devices', used: 5, limit: 20, color: '#f59e0b', unit: 'hubs' },
  { label: 'Reports exported', used: 12, limit: 999, color: '#22c55e', unit: 'reports' },
]

export default function Billing() {
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" subtitle="Subscription plan, usage, and payment history" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Plan */}
        <ChartCard title="Current Plan" accent="gold">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-2xl font-black text-[#f59e0b]">Pro Plan</div>
              <div className="text-sm text-[#64748b] mt-1">$899 / month · Billed monthly</div>
            </div>
            <span className="bg-[#22c55e]/20 text-[#22c55e] px-3 py-1 rounded-full text-xs font-semibold">Active</span>
          </div>
          <div className="space-y-2 mb-4">
            {planFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#22c55e] flex-shrink-0" />
                <span className="text-xs text-[#94a3b8]">{f}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#2a2f3e]">
            <div className="text-xs text-[#64748b] mb-1">Next billing date</div>
            <div className="text-sm font-semibold text-[#e2e8f0]">June 1, 2026</div>
          </div>
        </ChartCard>

        {/* Payment + Usage */}
        <div className="space-y-4">
          <ChartCard title="Payment Method">
            <div className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg">
              <CreditCard className="w-6 h-6 text-[#f59e0b]" />
              <div>
                <div className="text-sm font-semibold text-[#e2e8f0]">Visa ending in 4242</div>
                <div className="text-xs text-[#64748b]">Expires 12/2028</div>
              </div>
              <span className="ml-auto text-xs text-[#22c55e] font-semibold">Default</span>
            </div>
          </ChartCard>

          <ChartCard title="Usage This Month" subtitle="Your current usage against plan limits">
            <div className="space-y-4">
              {usage.map((u) => (
                <div key={u.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[#94a3b8]">{u.label}</span>
                    <span className="text-xs font-semibold text-[#e2e8f0]">
                      {u.used.toLocaleString()} / {u.limit === 999 ? '∞' : u.limit.toLocaleString()} {u.unit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2a2f3e] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min((u.used / (u.limit === 999 ? u.used * 2 : u.limit)) * 100, 100)}%`, backgroundColor: u.color }} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Invoice History">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2f3e]">
                {['Invoice', 'Period', 'Date', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-[#94a3b8]">{inv.id}</td>
                  <td className="py-2.5 px-3 text-[#e2e8f0]">{inv.period}</td>
                  <td className="py-2.5 px-3 text-[#94a3b8]">{inv.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#f59e0b]">{inv.amount}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full text-[10px] font-semibold">{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
