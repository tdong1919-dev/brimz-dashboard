import { User } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import QueryBoundary from '../components/QueryBoundary'
import { useStaff, useAccessRoles } from '../api/queries'

const accessColors: Record<string, string> = {
  Admin: '#a855f7',
  Manager: '#f59e0b',
  Viewer: '#14b8a6',
  Security: '#ef4444',
  Tech: '#14b8a6',
  Staff: '#64748b',
}

const statusColors: Record<string, string> = {
  Active: '#22c55e',
  Inactive: '#64748b',
}

// demo-static: per-role permission grants are not modeled in the API — the
// role list below comes from useAccessRoles(), but which capabilities each role
// unlocks is a fixed demo lookup keyed by role name.
const permissionGrants: Record<string, { view: boolean; edit: boolean; export: boolean; billing: boolean; users: boolean }> = {
  Admin: { view: true, edit: true, export: true, billing: true, users: true },
  Manager: { view: true, edit: true, export: true, billing: false, users: false },
  Viewer: { view: true, edit: false, export: false, billing: false, users: false },
}
const DEFAULT_GRANT = { view: true, edit: false, export: false, billing: false, users: false }

export default function StaffAccess() {
  const staffQuery = useStaff()
  const rolesQuery = useAccessRoles()

  return (
    <div className="space-y-6">
      <PageHeader title="Staff & Access" subtitle="Team roles, permissions, and real-time status" />

      <ChartCard title="Venue Team">
        <QueryBoundary query={staffQuery} compact>
          {(staff) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2f3e]">
                    {['Name', 'Email', 'Role', 'Status'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => {
                    const status = s.is_active ? 'Active' : 'Inactive'
                    return (
                      <tr key={s.id} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#2a2f3e] flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-[#94a3b8]" />
                            </div>
                            <span className="font-medium text-[#e2e8f0]">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#94a3b8]">{s.email}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ backgroundColor: `${accessColors[s.role] ?? '#64748b'}20`, color: accessColors[s.role] ?? '#64748b' }}>
                            {s.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ backgroundColor: `${statusColors[status]}20`, color: statusColors[status] }}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </QueryBoundary>
      </ChartCard>

      <ChartCard title="Permissions Matrix" subtitle="Access rights by role">
        <QueryBoundary query={rolesQuery} compact>
          {(roles) => (
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
                  {roles.map((r) => {
                    const p = permissionGrants[r.name] ?? DEFAULT_GRANT
                    return (
                      <tr key={r.id} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/30">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-xs" style={{ color: accessColors[r.name] ?? '#64748b' }}>{r.name}</span>
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </QueryBoundary>
      </ChartCard>
    </div>
  )
}
