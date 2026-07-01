interface Props { value: number; max?: number; color?: string; label?: string; showValue?: boolean }
export default function ProgressBar({ value, max = 100, color = '#14b8a6', label, showValue = true }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="min-w-0">
      {(label || showValue) && (
        <div className="flex justify-between gap-3 mb-1 min-w-0">
          {label && <span className="text-xs text-[#94a3b8] leading-snug min-w-0 break-words">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-[#e2e8f0] flex-shrink-0">{value}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-[#2a2f3e] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
