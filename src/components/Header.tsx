import { Menu, Bell, ChevronDown, Download } from 'lucide-react'
import { useState } from 'react'
import BrimzLogo from './BrimzLogo'

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
    <header className="bg-[#0c0f1a] border-b border-[#1e2535] px-3 sm:px-4 lg:px-6 py-2.5 flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 -ml-1 flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] flex-shrink-0" aria-label="Open navigation">
        <Menu className="w-5 h-5" />
      </button>

      <div className="lg:hidden flex-1 min-w-0">
        <BrimzLogo width={104} />
      </div>

      <div className="hidden lg:block flex-1" />

      <button className="min-w-0 max-w-[148px] sm:max-w-none flex items-center gap-2 bg-[#141824] border border-[#1e2535] rounded-lg px-2 sm:px-3 py-1.5 hover:border-[#2a2f3e] transition-colors">
        <div className="w-6 h-6 rounded bg-[#1e2535] flex items-center justify-center text-xs flex-shrink-0">🏟️</div>
        <div className="min-w-0 text-left">
          <div className="text-xs font-semibold text-[#e2e8f0] leading-tight truncate">Demo Arena</div>
          <div className="text-[9px] text-[#475569] leading-tight truncate">All Venues</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#475569] flex-shrink-0" />
      </button>

      <button className="relative w-10 h-10 flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] transition-colors flex-shrink-0" aria-label="Notifications">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[9px] flex items-center justify-center text-white font-bold">3</span>
      </button>

      {(exporting || exported) && (
        <div className="fixed left-3 right-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-[#1a1f2e] border border-[#2a2f3e] rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3">
          <Download className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
          <span className="text-sm font-medium text-[#e2e8f0]">
            {exporting ? 'Report export started...' : 'Report ready for download!'}
          </span>
        </div>
      )}
    </header>
  )
}
