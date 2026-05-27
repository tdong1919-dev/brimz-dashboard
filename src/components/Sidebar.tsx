import { PageKey } from '../App'
import { BarChart3, Users, Zap, DollarSign, Star, FileText, Calendar, ShieldCheck, Cpu, Bell, PieChart, Megaphone, Image, Building2, Plug, CreditCard, Home, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const nav = [
  {
    section: 'Venue',
    items: [
      { key: 'overview', label: 'Overview', icon: Home },
      { key: 'events',   label: 'Events',   icon: Calendar },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { key: 'performance', label: 'Performance', icon: BarChart3 },
      { key: 'crowd', label: 'Crowd Insights', icon: Zap },
      { key: 'fanengagement', label: 'Fan Engagement', icon: Users },
      { key: 'revenue', label: 'Revenue', icon: DollarSign },
      { key: 'sponsorship', label: 'Sponsorship ROI', icon: Star },
      { key: 'reporting', label: 'Reporting', icon: FileText },
    ],
  },
  {
    section: 'Operations',
    items: [
      { key: 'events', label: 'Event Management', icon: Calendar },
      { key: 'staff', label: 'Staff & Access', icon: ShieldCheck },
      { key: 'devices', label: 'Devices & Inventory', icon: Cpu },
      { key: 'alerts', label: 'Alerts', icon: Bell },
    ],
  },
  {
    section: 'Growth & Marketing',
    items: [
      { key: 'segments', label: 'Fan Segmentation', icon: PieChart },
      { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
      { key: 'ugc', label: 'Content & UGC', icon: Image },
    ],
  },
  {
    section: 'Settings',
    items: [
      { key: 'profile', label: 'Venue Profile', icon: Building2 },
      { key: 'integrations', label: 'Integrations', icon: Plug },
      { key: 'billing', label: 'Billing', icon: CreditCard },
    ],
  },
]

interface Props {
  activePage: PageKey
  setActivePage: (p: PageKey) => void
  isOpen: boolean
}

export default function Sidebar({ activePage, setActivePage, isOpen }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <aside className={`
      fixed lg:relative z-30 h-full w-64 bg-[#0f1220] border-r border-[#2a2f3e] flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-4 border-b border-[#2a2f3e] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1a1f2e] border border-[#2a2f3e] flex items-center justify-center flex-shrink-0">
          <span className="text-base font-black text-[#f59e0b]">B</span>
        </div>
        <div>
          <div className="text-sm font-black tracking-widest text-[#f59e0b] leading-none">BRIMZ</div>
          <div className="text-[9px] text-[#475569] tracking-wide mt-0.5">LIVE MORE. CONNECT DEEPER.</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {nav.map(({ section, items }) => (
          <div key={section} className="mb-2">
            <button
              onClick={() => toggleSection(section)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold tracking-widest text-[#475569] uppercase hover:text-[#94a3b8] transition-colors"
            >
              {section}
              <ChevronDown className={`w-3 h-3 transition-transform ${collapsed[section] ? '-rotate-90' : ''}`} />
            </button>
            {!collapsed[section] && (
              <div className="mt-1 space-y-0.5">
                {items.map(({ key, label, icon: Icon }) => {
                  const active = activePage === key
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePage(key as PageKey)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${active
                          ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20'
                          : 'text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-[#e2e8f0]'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#f59e0b]' : ''}`} />
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2a2f3e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black">VN</div>
          <div>
            <div className="text-sm font-semibold text-[#e2e8f0]">Venue Admin</div>
            <div className="text-xs text-[#64748b]">admin@brimzband.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
