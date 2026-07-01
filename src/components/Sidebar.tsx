import { PageKey } from '../App'
import { BarChart3, Zap, Star, FileText, Calendar, Bell, CreditCard, Home, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import BrimzLogo from './BrimzLogo'

const nav = [
  {
    section: 'Venue Intelligence',
    items: [
      { key: 'overview', label: 'Overview', icon: Home },
      { key: 'fei', label: 'Fan Energy Index', icon: Zap },
      { key: 'heatmaps', label: 'Heat Maps', icon: BarChart3 },
      { key: 'themes', label: 'Theme Nights', icon: Calendar },
      { key: 'sponsorIntel', label: 'Sponsor Intelligence', icon: Star },
      { key: 'peaks', label: 'Emotional Peaks', icon: Bell },
      { key: 'comparison', label: 'Event Comparison', icon: BarChart3 },
      { key: 'insights', label: 'Executive Insights', icon: FileText },
    ],
  },
  {
    section: 'Commercial',
    items: [
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
      fixed lg:relative z-40 h-[100dvh] w-[min(18rem,86vw)] lg:w-64 bg-[#0f1220] border-r border-[#2a2f3e] flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="px-4 py-3 border-b border-[#2a2f3e] flex flex-col gap-1">
        <BrimzLogo width={156} />
        <div className="text-[9px] text-[#475569] tracking-wide">LIVE MORE. CONNECT DEEPER.</div>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain py-4 px-2 sm:px-3">
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
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
                        ${active
                          ? 'bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20'
                          : 'text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-[#e2e8f0]'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#14b8a6]' : ''}`} />
                      <span className="truncate">{label}</span>
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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black">VN</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#e2e8f0]">Venue Admin</div>
            <div className="text-xs text-[#64748b] truncate">admin@brimzband.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
