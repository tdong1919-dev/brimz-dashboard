import { ShieldCheck, User } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const staff = [
  { name: 'Marcus Rivera', role: 'Venue Manager', zone: 'All Zones', access: 'Admin', status: 'On-Site' },
  { name: 'Asha Chen', role: 'Operations Lead', zone: 'Floor GA', access: 'Manager', status: 'On-Site' },
  { name: 'Jordan Lee', role: 'Security Chief', zone: 'All Gates', access: 'Security', status: 'On-Site' },
  { name: 'Priya Nair', role: 'Tech Coordinator', zone: 'Control Room', access: 'Tech', status: 'On-Site' },
  { name: 'Tyler Banks', role: 'Concessions Mgr', zone: 'Upper Deck', access: 'Staff', status: 'Break' },
  { name: 'Zoe Santos', role: 'Fan Experience', zone: 'VIP Terrace', access: 'Staff', status: 'On-Site' },
]

const accessColors: Record<string, string> = {
  Admin: '#a855f7',
  Manager: '#f59e0b',
  Security: '#ef4444',
  Tech: '#14b8a6',
  Staff: '#64748b',
}

const statusColors: Record<string, string> = {
  'On-Site': '#22c55e',
  'Break': '#f59e0b',
  'Off-Site': '#64748b',
}

const permissions = [
  { role: 'Admin', view: true, edit: true, export: true, billing: true, users: true },
  { role: 'Manager', view: true, edit: true, export: true, billing: false, users: false },
  { role: 'Security', view: true, edit: false, export: false, billing: false, users: false },
  { role: 'Tech', view: true, edit: true, export: false, billing: false, users: false },
  { role: 'Staff', view: true, edit: false, export: false, billing: false, users: false },
]

export default function StaffAccess() {
  return (
    <div className="space-y-6">
      <PageHeader title="Staff & Access" subtitle="Team roles, permissions, and real-time status" />

      <ChartCard title="Venue Team">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2f3e]">
                {['Name', 'Role', 'Zone', 'Access Level', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={i} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#2a2f3e] flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-[#94a3b8]" />
                      </div>
                      <span className="font-medium text-[#e2e8f0]">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#94a3b8]">{s.role}</td>
                  <td className="py-2.5 px-3 text-[#94a3b8]">{s.zone}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: `${accessColors[s.access]}20`, color: accessColors[s.access] }}>
                      {s.access}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: `${statusColors[s.status]}20`, color: statusColors[s.status] }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard title="Permissions Matrix" subtitle="Access rights by role">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2f3e]">
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase">Role</th>
                {['View Data', 'Edit Settings', 'Export Reports', 'Billing', 'Manage Users'].map((h) => (
                  <th key={h} className="text-center py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.role} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/30">
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-xs" style={{ color: accessColors[p.role] }}>{p.role}</span>
                  </td>
                  {[p.view, p.edit, p.export, p.billing, p.users].map((allowed, i) => (
                    <td key={i} className="py-2.5 px-3 text-center">
                      {allowed
                        ? <span className="text-[#22c55e]">✓</span>
                        : <span className="text-[#2a2f3e]">—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
