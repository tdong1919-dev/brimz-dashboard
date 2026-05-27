import { Menu, Bell, ChevronDown, Download } from 'lucide-react'
import { useState } from 'react'

interface Props { setSidebarOpen: (v: boolean) => void }

export default function Header({ setSidebarOpen }: Props) {
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  const handleExport = () => {
    setExporting(true)
    setExported(false)
    setTimeout(() => { setExporting(false); setExported(true) }, 2000)
    setTimeout(() => setExported(false), 5000)
  }

  return (
    <header className="bg-[#0c0f1a] border-b border-[#1e2535] px-4 lg:px-6 py-2.5 flex items-center gap-3">
      {/* Mobile hamburger */}
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#64748b] hover:text-[#e2e8f0] mr-1">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Venue selector (matches reference top-right area) */}
      <div className="flex items-center gap-2 bg-[#141824] border border-[#1e2535] rounded-lg px-3 py-1.5 cursor-pointer hover:border-[#2a2f3e] transition-colors">
        {/* Stadium icon placeholder */}
        <div className="w-6 h-6 rounded bg-[#1e2535] flex items-center justify-center text-xs">🏟️</div>
        <div>
          <div className="text-xs font-semibold text-[#e2e8f0] leading-tight">Demo Arena</div>
          <div className="text-[9px] text-[#475569] leading-tight">All Venues</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />
      </div>

      {/* Notifications */}
      <button className="relative text-[#64748b] hover:text-[#e2e8f0] transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[9px] flex items-center justify-center text-white font-bold">3</span>
      </button>

      {/* Export toast */}
      {(exporting || exported) && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a1f2e] border border-[#2a2f3e] rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3">
          <Download className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-sm font-medium text-[#e2e8f0]">
            {exporting ? 'Report export started...' : 'Report ready for download!'}
          </span>
        </div>
      )}
    </header>
  )
}
