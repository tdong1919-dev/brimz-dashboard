// Settings (Milestone 3): profile + password via PATCH /auth/me, app info.
import { useState } from 'react'
import { KeyRound, Server, UserCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { patch, API_BASE } from '../api/client'
import { useAuth, type User } from '../auth/AuthContext'

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-[#141824] border border-[#1e2535] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[#14b8a6]" />
        <h2 className="text-xs font-bold tracking-widest text-[#94a3b8] uppercase">{title}</h2>
      </div>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] outline-none focus:border-[#14b8a6]/50'
const labelCls = 'block text-[10px] font-semibold tracking-widest text-[#64748b] uppercase mb-1'
const buttonCls =
  'bg-[#14b8a6] hover:bg-[#0d9488] disabled:opacity-50 text-black text-xs font-bold rounded-lg px-4 py-2 transition-colors'

type Banner = { kind: 'ok' | 'error'; text: string } | null

function BannerBox({ banner }: { banner: Banner }) {
  if (!banner) return null
  const ok = banner.kind === 'ok'
  return (
    <div
      role="status"
      className={`text-xs rounded-lg px-3 py-2 mt-3 border ${
        ok
          ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
          : 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20'
      }`}
    >
      {banner.text}
    </div>
  )
}

export default function Settings() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [profileBanner, setProfileBanner] = useState<Banner>(null)
  const [profileBusy, setProfileBusy] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwBanner, setPwBanner] = useState<Banner>(null)
  const [pwBusy, setPwBusy] = useState(false)

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileBusy(true)
    setProfileBanner(null)
    try {
      const updated = await patch<User>('/api/v1/auth/me', { name })
      setUser(updated)
      setProfileBanner({ kind: 'ok', text: 'Profile saved.' })
    } catch (err) {
      setProfileBanner({ kind: 'error', text: (err as Error).message })
    } finally {
      setProfileBusy(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) {
      setPwBanner({ kind: 'error', text: 'New passwords do not match.' })
      return
    }
    setPwBusy(true)
    setPwBanner(null)
    try {
      await patch<User>('/api/v1/auth/me', { current_password: currentPw, new_password: newPw })
      setPwBanner({ kind: 'ok', text: 'Password changed.' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwBanner({ kind: 'error', text: (err as Error).message })
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" subtitle="Your account and application preferences" />

      <Card title="Profile" icon={UserCircle}>
        <form onSubmit={saveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input value={user?.email ?? ''} disabled className={`${inputCls} opacity-60`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={profileBusy} className={buttonCls}>
              {profileBusy ? 'Saving…' : 'Save profile'}
            </button>
            <span className="text-[10px] text-[#475569]">
              Role: <span className="text-[#94a3b8] font-semibold">{user?.role}</span> (managed by an Admin)
            </span>
          </div>
          <BannerBox banner={profileBanner} />
        </form>
      </Card>

      <Card title="Password" icon={KeyRound}>
        <form onSubmit={changePassword} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Current password</label>
              <input
                type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password" required className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>New password</label>
              <input
                type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password" required minLength={8} className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Confirm new password</label>
              <input
                type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password" required minLength={8} className={inputCls}
              />
            </div>
          </div>
          <button type="submit" disabled={pwBusy} className={buttonCls}>
            {pwBusy ? 'Changing…' : 'Change password'}
          </button>
          <BannerBox banner={pwBanner} />
        </form>
      </Card>

      <Card title="Application" icon={Server}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#1a1f2e] rounded-lg p-3">
            <div className="text-[10px] text-[#64748b] uppercase tracking-widest mb-1">API endpoint</div>
            <div className="text-[#e2e8f0] font-mono break-all">{API_BASE}</div>
          </div>
          <div className="bg-[#1a1f2e] rounded-lg p-3">
            <div className="text-[10px] text-[#64748b] uppercase tracking-widest mb-1">Live updates</div>
            <div className="text-[#e2e8f0]">WebSocket stadium feed, ~2s ticks</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
