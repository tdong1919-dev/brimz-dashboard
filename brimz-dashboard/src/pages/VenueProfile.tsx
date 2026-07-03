import { MapPin, Users, Phone, Mail, Globe } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'
import QueryBoundary from '../components/QueryBoundary'
import { useVenues, useZoneEngagement } from '../api/queries'

// demo-static: contact details and brand tagline are not stored in the API.
const CONTACT = {
  phone: '+1 (213) 555-0198',
  email: 'ops@brimzband.com',
  website: 'brimzband.com',
  tagline: 'Live More. Connect Deeper.',
  tier: 'Premium Partner',
}

export default function VenueProfile() {
  const venuesQuery = useVenues()
  const zonesQuery = useZoneEngagement()

  return (
    <div className="space-y-6">
      <PageHeader title="Venue Profile" subtitle="Main Arena configuration and branding settings" />

      <QueryBoundary query={venuesQuery} compact>
        {(venues) => {
          const venue = venues[0]
          const primary = venue?.brand_primary_color ?? '#f59e0b'
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Venue Information">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-[#64748b] mb-1">Venue Name</div>
                    <div className="text-lg font-bold text-[#e2e8f0]">{venue?.name ?? '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#f59e0b]" />
                    <div>
                      <div className="text-xs text-[#64748b]">Location</div>
                      <div className="text-sm text-[#e2e8f0]">{venue?.city ?? '—'} · {venue?.timezone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#14b8a6]" />
                    <div>
                      <div className="text-xs text-[#64748b]">Total Capacity</div>
                      <div className="text-sm font-bold text-[#14b8a6]">{venue?.capacity != null ? venue.capacity.toLocaleString() : '—'}</div>
                    </div>
                  </div>
                  {/* demo-static: phone/email/website not modeled in the API */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a2f3e]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#64748b]" />
                      <div>
                        <div className="text-xs text-[#64748b]">Phone</div>
                        <div className="text-sm text-[#e2e8f0]">{CONTACT.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#64748b]" />
                      <div>
                        <div className="text-xs text-[#64748b]">Email</div>
                        <div className="text-sm text-[#e2e8f0]">{CONTACT.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Globe className="w-4 h-4 text-[#64748b]" />
                      <div>
                        <div className="text-xs text-[#64748b]">Website</div>
                        <div className="text-sm text-[#14b8a6]">{CONTACT.website}</div>
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
                        // Primary is the venue's real brand color; the rest are demo-static presentation swatches.
                        { name: 'Primary', color: primary },
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
                    <div className="text-2xl font-black tracking-widest" style={{ color: primary }}>{(venue?.name ?? 'BRIMZ').toUpperCase()}</div>
                    {/* demo-static: tagline */}
                    <div className="text-xs text-[#64748b] mt-1 tracking-wider">{CONTACT.tagline}</div>
                  </div>
                  {/* demo-static: venue tier not modeled in the API */}
                  <div className="pt-2 border-t border-[#2a2f3e]">
                    <div className="text-xs text-[#64748b] mb-1">Venue Tier</div>
                    <span className="bg-[#a855f7]/20 text-[#a855f7] px-3 py-1 rounded-full text-sm font-semibold">{CONTACT.tier}</span>
                  </div>
                </div>
              </ChartCard>
            </div>
          )
        }}
      </QueryBoundary>

      <ChartCard title="Sections & Zones" subtitle="Venue floor plan and capacity breakdown">
        <QueryBoundary query={zonesQuery} compact>
          {(zones) => {
            const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0) || 1
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2a2f3e]">
                      {['Zone', 'Fill', 'Capacity', 'Share of Total'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((z) => {
                      const share = (z.capacity / totalCapacity) * 100
                      return (
                        <tr key={z.zone} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-[#e2e8f0]">{z.zone}</td>
                          <td className="py-2.5 px-3 text-[#94a3b8]">{Math.round(z.filled)}%</td>
                          <td className="py-2.5 px-3 text-[#14b8a6] font-semibold">{z.capacity.toLocaleString()}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 bg-[#2a2f3e] rounded-full overflow-hidden">
                                <div className="h-full bg-[#14b8a6] rounded-full" style={{ width: `${share}%` }} />
                              </div>
                              <span className="text-xs text-[#64748b]">{Math.round(share)}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          }}
        </QueryBoundary>
      </ChartCard>
    </div>
  )
}
