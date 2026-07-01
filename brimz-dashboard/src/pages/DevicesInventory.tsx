import { Cpu, AlertTriangle, Wifi, WifiOff, Battery } from 'lucide-react'
import { devices } from '../data/mockData'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const statusColors: Record<string, string> = {
  Online: '#22c55e',
  Warning: '#f59e0b',
  Offline: '#ef4444',
}

function BatteryBar({ level }: { level: number }) {
  const color = level > 60 ? '#22c55e' : level > 30 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 bg-[#2a2f3e] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${level}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{level}%</span>
    </div>
  )
}

export default function DevicesInventory() {
  const online = devices.filter((d) => d.status === 'Online').length
  const warning = devices.filter((d) => d.status === 'Warning').length
  const offline = devices.filter((d) => d.status === 'Offline').length
  const totalConnected = devices.reduce((sum, d) => sum + d.connected, 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Devices & Inventory" subtitle="Connected wristband hubs, battery status, and device health" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Hubs', value: devices.length, color: '#14b8a6' },
          { label: 'Online', value: online, color: '#22c55e' },
          { label: 'Warning', value: warning, color: '#f59e0b' },
          { label: 'Offline', value: offline, color: '#ef4444' },
        ].map((k) => (
          <div key={k.label} className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-4">
            <div className="text-3xl font-black mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-[#64748b]">{k.label}</div>
          </div>
        ))}
      </div>

      <ChartCard title="Device Status Overview" subtitle={`${totalConnected.toLocaleString()} total wristbands connected`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {devices.map((d) => (
            <div key={d.id} className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#64748b]" />
                  <span className="text-sm font-semibold text-[#e2e8f0]">{d.id}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: `${statusColors[d.status]}20`, color: statusColors[d.status] }}>
                  {d.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#64748b]">
                  <span>Zone</span><span className="text-[#94a3b8]">{d.zone}</span>
                </div>
                <div className="flex justify-between text-[#64748b]">
                  <span>Connected</span><span className="text-[#14b8a6] font-semibold">{d.connected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[#64748b]">
                  <span>Battery</span>
                  <BatteryBar level={d.battery} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Replacement Alerts" subtitle="Devices requiring attention" accent="gold">
        <div className="space-y-3">
          {devices.filter(d => d.status !== 'Online').map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg border-l-2"
              style={{ borderLeftColor: statusColors[d.status] }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: statusColors[d.status] }} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#e2e8f0]">{d.id} — {d.zone}</div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  {d.status === 'Offline' ? 'Hub offline — check connection and power' : `Battery at ${d.battery}% — schedule replacement`}
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${statusColors[d.status]}20`, color: statusColors[d.status] }}>
                {d.status}
              </span>
            </div>
          ))}
          {devices.filter(d => d.battery > 0 && d.battery < 50 && d.status === 'Online').map((d) => (
            <div key={`${d.id}-low`} className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg border-l-2 border-[#f59e0b]">
              <Battery className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#e2e8f0]">{d.id} — {d.zone}</div>
                <div className="text-xs text-[#64748b] mt-0.5">Battery at {d.battery}% — consider swap within 2 hours</div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] flex-shrink-0">Low Battery</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
