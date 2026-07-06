import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useAlerts, useVenues } from '../api/queries'

interface Props { setSidebarOpen: (v: boolean) => void }

export default function Header({ setSidebarOpen }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const venues = useVenues()
  const alerts = useAlerts()

  const venue = venues.data?.[0]
  const alertCount = alerts.data?.length ?? 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-[#0c0f1a] border-b border-[#1e2535] px-4 lg:px-6 py-2.5 flex items-center gap-3">
      {/* Mobile hamburger */}
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#64748b] hover:text-[#e2e8f0] mr-1">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Venue selector */}
      <div className="flex items-center gap-2 bg-[#141824] border border-[#1e2535] rounded-lg px-3 py-1.5 cursor-pointer hover:border-[#2a2f3e] transition-colors">
        <div className="w-6 h-6 rounded bg-[#1e2535] flex items-center justify-center text-xs">🏟️</div>
        <div>
          <div className="text-xs font-semibold text-[#e2e8f0] leading-tight">{venue?.name ?? '—'}</div>
          <div className="text-[9px] text-[#475569] leading-tight">{venue?.city ?? 'All Venues'}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />
      </div>

      {/* Notifications */}
      <button className="relative text-[#64748b] hover:text-[#e2e8f0] transition-colors" onClick={() => navigate('/alerts')}>
        <Bell className="w-5 h-5" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[9px] flex items-center justify-center text-white font-bold">
            {alertCount}
          </span>
        )}
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          data-testid="user-menu"
          className="flex items-center gap-2 bg-[#141824] border border-[#1e2535] rounded-lg px-2.5 py-1.5 hover:border-[#2a2f3e] transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#a855f7] flex items-center justify-center text-[10px] font-bold text-black">
            {(user?.name ?? '?')[0]?.toUpperCase()}
          </div>
          <span className="hidden sm:block text-xs font-semibold text-[#e2e8f0] max-w-[120px] truncate">{user?.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-40 bg-[#141824] border border-[#2a2f3e] rounded-xl shadow-2xl py-1 min-w-[160px]">
            <div className="px-3 py-2 border-b border-[#1e2535]">
              <div className="text-xs font-semibold text-[#e2e8f0] truncate">{user?.email}</div>
              <div className="text-[10px] text-[#64748b]">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-[#ef4444] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
