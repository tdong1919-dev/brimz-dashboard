interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  accent?: 'gold' | 'teal' | 'purple'
}

const accentMap = {
  gold: 'border-[#f59e0b]/30',
  teal: 'border-[#14b8a6]/30',
  purple: 'border-[#a855f7]/30',
}

export default function ChartCard({ title, subtitle, children, className = '', accent }: Props) {
  return (
    <div className={`bg-[#141824] border ${accent ? accentMap[accent] : 'border-[#2a2f3e]'} rounded-xl p-3 sm:p-4 overflow-hidden min-w-0 ${className}`}>
      <div className="mb-4 min-w-0">
        <h3 className="text-sm font-semibold text-[#e2e8f0] leading-snug break-words">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed break-words">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
