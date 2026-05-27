interface Props { title: string; subtitle?: string; children?: React.ReactNode }
export default function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#e2e8f0]">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748b] mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
