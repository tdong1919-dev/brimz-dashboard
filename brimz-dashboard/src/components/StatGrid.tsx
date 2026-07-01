interface Stat { label: string; value: string; sub?: string; color?: string }
interface Props { stats: Stat[]; cols?: number }
export default function StatGrid({ stats, cols = 2 }: Props) {
  const colClass: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }
  return (
    <div className={`grid ${colClass[cols] ?? 'grid-cols-2'} gap-3`}>
      {stats.map((s, i) => (
        <div key={i} className="bg-[#1a1f2e] rounded-lg p-3">
          <div className="text-xs text-[#64748b] mb-1">{s.label}</div>
          <div className="text-lg font-bold" style={{ color: s.color || '#e2e8f0' }}>{s.value}</div>
          {s.sub && <div className="text-[10px] text-[#64748b] mt-0.5">{s.sub}</div>}
        </div>
      ))}
    </div>
  )
}
