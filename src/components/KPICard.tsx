import { TrendingUp, TrendingDown, Users, Zap, Activity, DollarSign, Star, Award } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  suffix?: string
  change: string
  up: boolean
  color: 'teal' | 'gold' | 'purple'
  icon: string
  sub?: string
}

const iconMap: Record<string, LucideIcon> = { Users, Zap, Activity, DollarSign, Star, Award, TrendingUp, TrendingDown }

const colorMap = {
  teal:   { bg: 'rgba(20,184,166,0.12)',  text: '#14b8a6', icon: '#14b8a6' },
  gold:   { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b', icon: '#f59e0b' },
  purple: { bg: 'rgba(168,85,247,0.12)',  text: '#a855f7', icon: '#a855f7' },
}

export default function KPICard({ label, value, suffix, change, up, color, icon, sub }: Props) {
  const c = colorMap[color]
  const IconComponent = iconMap[icon]

  return (
    <div className="bg-[#141824] border border-[#2a2f3e] rounded-xl p-3 sm:p-4 flex flex-col justify-between min-h-[104px] sm:min-h-[110px] hover:border-[#3a3f4e] transition-all">
      {/* Label + icon */}
      <div className="flex items-start justify-between mb-2">
        <div className="text-[10px] font-semibold tracking-widest text-[#64748b] uppercase leading-tight pr-2">{label}</div>
        {IconComponent && (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg }}>
            <IconComponent className="w-4 h-4" style={{ color: c.icon }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-[22px] sm:text-[26px] font-black text-[#f1f5f9] leading-none mb-1">
        {value}
        {suffix && <span className="text-sm font-semibold text-[#475569] ml-0.5">{suffix}</span>}
      </div>

      {/* Change + sub */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-xs font-bold flex items-center gap-0.5 ${up ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
        {sub && <span className="text-[10px] text-[#475569]">{sub}</span>}
      </div>
    </div>
  )
}
