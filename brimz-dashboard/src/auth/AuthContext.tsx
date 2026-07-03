// Session state: current user, login/logout, and startup token restore.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { get, loadTokens, onAuthFailure, post, saveTokens, type Tokens } from '../api/client'
import type { components } from '../api/types.gen'

export type User = components['schemas']['UserOut']

type LoginResponse = Tokens & { user: User }

interface AuthState {
  user: User | null
  /** true while the stored token is being validated on startup */
  restoring: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (u: User) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [restoring, setRestoring] = useState(() => loadTokens() !== null)

  // Restore the session from a stored token (validates against /auth/me).
  useEffect(() => {
    if (!loadTokens()) return
    get<User>('/api/v1/auth/me')
      .then(setUser)
      .catch(() => saveTokens(null))
      .finally(() => setRestoring(false))
  }, [])

  // A failed token refresh anywhere in the app logs the user out.
  useEffect(() => {
    onAuthFailure(() => setUser(null))
    return () => onAuthFailure(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      restoring,
      login: async (email, password) => {
        const res = await post<LoginResponse>('/api/v1/auth/login', { email, password })
        saveTokens({ access_token: res.access_token, refresh_token: res.refresh_token })
        setUser(res.user)
      },
      logout: () => {
        saveTokens(null)
        setUser(null)
      },
      setUser,
    }),
    [user, restoring],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Roles allowed to drive playback (mirrors the backend's CONTROL_ROLES). */
export const CONTROL_ROLES = ['Admin', 'Manager']
