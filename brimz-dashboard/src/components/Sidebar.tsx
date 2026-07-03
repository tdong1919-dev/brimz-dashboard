import { NavLink } from 'react-router-dom'
import {
  Activity, BarChart3, Bell, Calendar, CreditCard, FileText, Home, Landmark,
  Megaphone, Radio, Settings as SettingsIcon, Share2, Shield, Star, Users,
  Wrench, Zap, ChevronDown, DollarSign, Plug, PieChart,
} from 'lucide-react'
import { useState } from 'react'
import BrimzLogo from './BrimzLogo'
import { useAuth } from '../auth/AuthContext'

const nav = [
  {
    section: 'Venue Intelligence',
    items: [
      { to: '/', label: 'Overview', icon: Home },
      { to: '/crowd-insights', label: 'Crowd Insights', icon: Activity },
      { to: '/fan-energy', label: 'Fan Energy Index', icon: Zap },
      { to: '/heatmaps', label: 'Heat Maps', icon: BarChart3 },
      { to: '/theme-nights', label: 'Theme Nights', icon: Calendar },
      { to: '/sponsor-intelligence', label: 'Sponsor Intelligence', icon: Star },
      { to: '/emotional-peaks', label: 'Emotional Peaks', icon: Bell },
      { to: '/event-comparison', label: 'Event Comparison', icon: BarChart3 },
      { to: '/executive-insights', label: 'Executive Insights', icon: FileText },
    ],
  },
  {
    section: 'Operations',
    items: [
      { to: '/events', label: 'Event Management', icon: Calendar },
      { to: '/performance', label: 'Performance', icon: PieChart },
      { to: '/alerts', label: 'Alerts', icon: Bell },
      { to: '/devices', label: 'Devices & Inventory', icon: Radio },
      { to: '/venue', label: 'Venue Profile', icon: Landmark },
      { to: '/staff', label: 'Staff & Access', icon: Shield },
      { to: '/integrations', label: 'Integrations', icon: Plug },
    ],
  },
  {
    section: 'Fans',
    items: [
      { to: '/fan-engagement', label: 'Fan Engagement', icon: Users },
      { to: '/fan-segmentation', label: 'Fan Segmentation', icon: Users },
      { to: '/content', label: 'Content & UGC', icon: Share2 },
    ],
  },
  {
    section: 'Commercial',
    items: [
      { to: '/revenue', label: 'Revenue', icon: DollarSign },
      { to: '/sponsorship-roi', label: 'Sponsorship ROI', icon: Star },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/reporting', label: 'Reporting', icon: FileText },
      { to: '/billing', label: 'Billing', icon: CreditCard },
    ],
  },
]

interface Props {
  isOpen: boolean
  onNavigate: () => void
}

export default function Sidebar({ isOpen, onNavigate }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const { user } = useAuth()

  const toggleSection = (section: string) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // System section is role-aware: everyone gets Settings, Admins get the
  // simulation-control screen.
  const systemItems = [
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
    ...(user?.role === 'Admin' ? [{ to: '/admin', label: 'Admin', icon: Wrench }] : []),
  ]
  const sections = [...nav, { section: 'System', items: systemItems }]

  const initials = (user?.name ?? '?')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className={`
      fixed lg:relative z-30 h-full w-64 bg-[#0f1220] border-r border-[#2a2f3e] flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="px-4 py-3 border-b border-[#2a2f3e] flex flex-col gap-1">
        <BrimzLogo width={172} />
        <div className="text-[9px] text-[#475569] tracking-wide">LIVE MORE. CONNECT DEEPER.</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map(({ section, items }) => (
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
                {items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={onNavigate}
                    className={({ isActive }) => `
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
                      ${isActive
                        ? 'bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20'
                        : 'text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-[#e2e8f0]'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#14b8a6]' : ''}`} />
                        <span className="truncate">{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2a2f3e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#e2e8f0] truncate">{user?.name ?? '—'}</div>
            <div className="text-xs text-[#64748b] truncate">{user?.role ?? ''}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
