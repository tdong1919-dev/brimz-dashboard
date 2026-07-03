// Typed fetch wrapper for the Brimz API: base URL, Bearer token, and a
// single-flight 401 → refresh → retry cycle shared by every query.

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000'

export interface Tokens {
  access_token: string
  refresh_token: string
}

const STORAGE_KEY = 'brimz.auth'

export function loadTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Tokens) : null
  } catch {
    return null
  }
}

export function saveTokens(tokens: Tokens | null): void {
  if (tokens) localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  else localStorage.removeItem(STORAGE_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
  }
}

// AuthContext registers a callback so a dead refresh token logs the user out.
let authFailureHandler: (() => void) | null = null
export function onAuthFailure(handler: (() => void) | null): void {
  authFailureHandler = handler
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    const tokens = loadTokens()
    if (!tokens) return false
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      })
      if (!res.ok) return false
      const pair = (await res.json()) as Tokens
      saveTokens(pair)
      return true
    } catch {
      return false
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

async function rawRequest(path: string, init: RequestInit): Promise<Response> {
  const tokens = loadTokens()
  const headers = new Headers(init.headers)
  if (tokens) headers.set('Authorization', `Bearer ${tokens.access_token}`)
  if (init.body) headers.set('Content-Type', 'application/json')
  return fetch(`${API_BASE}${path}`, { ...init, headers })
}

/** JSON request against the API; retries once through a token refresh on 401. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await rawRequest(path, init)
  if (res.status === 401) {
    if (await refreshTokens()) {
      res = await rawRequest(path, init)
    } else {
      saveTokens(null)
      authFailureHandler?.()
    }
  }
  if (!res.ok) {
    let detail = res.statusText
    try {
      detail = ((await res.json()) as { detail?: string }).detail ?? detail
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

export const get = <T>(path: string) => api<T>(path)
export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })
export const patch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
