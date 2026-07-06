interface Column { key: string; label: string; render?: (v: unknown, row: Record<string, unknown>) => React.ReactNode }
interface Props { columns: Column[]; data: Record<string, unknown>[]; className?: string }
export default function DataTable({ columns, data, className = '' }: Props) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2f3e]">
            {columns.map(c => (
              <th key={c.key} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wider whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
              {columns.map(c => (
                <td key={c.key} className="py-2.5 px-3 text-[#94a3b8] whitespace-nowrap">
                  {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
