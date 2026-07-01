import { MapPin, Users, Phone, Mail, Globe } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const zones = [
  { name: 'Floor GA', capacity: 3200, type: 'General Admission' },
  { name: 'Section A (Left)', capacity: 2100, type: 'Reserved Seating' },
  { name: 'Section B (Right)', capacity: 2100, type: 'Reserved Seating' },
  { name: 'VIP Terrace', capacity: 800, type: 'Premium' },
  { name: 'Upper Deck', capacity: 4200, type: 'General Seating' },
  { name: 'Suites', capacity: 600, type: 'Private Suites' },
]

export default function VenueProfile() {
  return (
    <div className="space-y-6">
      <PageHeader title="Venue Profile" subtitle="Main Arena configuration and branding settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Venue Information">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[#64748b] mb-1">Venue Name</div>
              <div className="text-lg font-bold text-[#e2e8f0]">Main Arena — Brimz</div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#f59e0b]" />
              <div>
                <div className="text-xs text-[#64748b]">Location</div>
                <div className="text-sm text-[#e2e8f0]">1200 Arena Blvd, Los Angeles, CA 90012</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#14b8a6]" />
              <div>
                <div className="text-xs text-[#64748b]">Total Capacity</div>
                <div className="text-sm font-bold text-[#14b8a6]">13,000</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a2f3e]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#64748b]" />
                <div>
                  <div className="text-xs text-[#64748b]">Phone</div>
                  <div className="text-sm text-[#e2e8f0]">+1 (213) 555-0198</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#64748b]" />
                <div>
                  <div className="text-xs text-[#64748b]">Email</div>
                  <div className="text-sm text-[#e2e8f0]">ops@brimzband.com</div>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Globe className="w-4 h-4 text-[#64748b]" />
                <div>
                  <div className="text-xs text-[#64748b]">Website</div>
                  <div className="text-sm text-[#14b8a6]">brimzband.com</div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Brand Settings" subtitle="Visual identity configuration">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[#64748b] mb-2">Brand Colors</div>
              <div className="flex gap-3">
                {[
                  { name: 'Primary', color: '#f59e0b' },
                  { name: 'Secondary', color: '#14b8a6' },
                  { name: 'Accent', color: '#a855f7' },
                  { name: 'Background', color: '#0a0d14' },
                ].map((c) => (
                  <div key={c.name} className="text-center">
                    <div className="w-10 h-10 rounded-lg border border-[#2a2f3e] mb-1" style={{ backgroundColor: c.color }} />
                    <div className="text-[10px] text-[#64748b]">{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-2">Logo Text</div>
              <div className="text-2xl font-black tracking-widest text-[#f59e0b]">BRIMZ</div>
              <div className="text-xs text-[#64748b] mt-1 tracking-wider">Live More. Connect Deeper.</div>
            </div>
            <div className="pt-2 border-t border-[#2a2f3e]">
              <div className="text-xs text-[#64748b] mb-1">Venue Tier</div>
              <span className="bg-[#a855f7]/20 text-[#a855f7] px-3 py-1 rounded-full text-sm font-semibold">Premium Partner</span>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Sections & Zones" subtitle="Venue floor plan and capacity breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2f3e]">
                {['Zone', 'Type', 'Capacity', 'Share of Total'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.name} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#e2e8f0]">{z.name}</td>
                  <td className="py-2.5 px-3 text-[#94a3b8]">{z.type}</td>
                  <td className="py-2.5 px-3 text-[#14b8a6] font-semibold">{z.capacity.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-[#2a2f3e] rounded-full overflow-hidden">
                        <div className="h-full bg-[#14b8a6] rounded-full" style={{ width: `${(z.capacity / 13000) * 100}%` }} />
                      </div>
                      <span className="text-xs text-[#64748b]">{Math.round((z.capacity / 13000) * 100)}%</span>
                    </div>
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
