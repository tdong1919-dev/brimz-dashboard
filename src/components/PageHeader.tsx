interface Props { title: string; subtitle?: string; children?: React.ReactNode }
export default function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 min-w-0">
      <div className="min-w-0">
        <h1 className="text-xl lg:text-2xl font-bold text-[#e2e8f0] leading-tight break-words">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748b] mt-1 leading-relaxed break-words">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  )
}
