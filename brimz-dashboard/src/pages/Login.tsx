// Login page (Milestone 3) — authenticates against POST /api/v1/auth/login.
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import BrimzLogo from '../components/BrimzLogo'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <BrimzLogo width={200} />
          <div className="text-[10px] text-[#475569] tracking-wide mt-1">LIVE MORE. CONNECT DEEPER.</div>
        </div>

        <form onSubmit={submit} className="bg-[#141824] border border-[#1e2535] rounded-2xl p-6 space-y-4">
          <div>
            <h1 className="text-lg font-black text-[#f1f5f9]">Sign in</h1>
            <p className="text-xs text-[#64748b] mt-0.5">Venue operator dashboard</p>
          </div>

          <label className="block">
            <span className="text-[10px] font-semibold tracking-widest text-[#64748b] uppercase">Email</span>
            <div className="mt-1 flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg px-3 py-2 focus-within:border-[#14b8a6]/50">
              <Mail className="w-4 h-4 text-[#475569]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@venue.com"
                autoComplete="username"
                required
                className="flex-1 bg-transparent text-sm text-[#e2e8f0] placeholder-[#475569] outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold tracking-widest text-[#64748b] uppercase">Password</span>
            <div className="mt-1 flex items-center gap-2 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg px-3 py-2 focus-within:border-[#14b8a6]/50">
              <Lock className="w-4 h-4 text-[#475569]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="flex-1 bg-transparent text-sm text-[#e2e8f0] placeholder-[#475569] outline-none"
              />
            </div>
          </label>

          {error && (
            <div className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#14b8a6] hover:bg-[#0d9488] disabled:opacity-50 text-black text-sm font-bold rounded-lg py-2.5 transition-colors"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-[10px] text-[#475569] text-center">
            Demo logins: owner@brimz.tech · ops@brimz.tech · analyst@brimz.tech
          </p>
        </form>
      </div>
    </div>
  )
}
