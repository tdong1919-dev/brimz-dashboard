// Live stadium feed over WebSocket, with reconnect + REST snapshot fallback.
//
// The backend pushes a `tick` frame every couple of seconds as the playback
// engine advances the event clock; each frame carries the whole stadium state
// (per-zone energy, playhead, active moments). Manager/Admin clients may also
// send control frames over the same socket, but the app uses POST /playback.

import { useEffect, useRef, useState } from 'react'
import { API_BASE, loadTokens } from '../api/client'
import type { components } from '../api/types.gen'
import { DEMO_EVENT_ID } from '../api/queries'

type S = components['schemas']
export type StadiumState = S['StadiumStateOut']
export type PlaybackState = S['PlaybackStateOut']

interface TickFrame {
  type: 'tick'
  playback: PlaybackState
  state: StadiumState
}

export interface LiveFeed {
  state: StadiumState | null
  playback: PlaybackState | null
  connected: boolean
}

const MAX_BACKOFF_MS = 15_000

export function useLive(eventId = DEMO_EVENT_ID): LiveFeed {
  const [feed, setFeed] = useState<LiveFeed>({ state: null, playback: null, connected: false })
  const attempt = useRef(0)

  useEffect(() => {
    let ws: WebSocket | null = null
    let retryTimer: number | undefined
    let disposed = false

    const connect = () => {
      const tokens = loadTokens()
      if (!tokens) return // RequireAuth means this only happens mid-logout
      const wsBase = API_BASE.replace(/^http/, 'ws')
      ws = new WebSocket(`${wsBase}/api/v1/live?event_id=${eventId}&token=${tokens.access_token}`)

      ws.onopen = () => {
        attempt.current = 0
      }
      ws.onmessage = (ev) => {
        const frame = JSON.parse(ev.data as string) as TickFrame | { type: 'error'; detail: string }
        if (frame.type === 'tick') {
          setFeed({ state: frame.state, playback: frame.playback, connected: true })
        }
      }
      ws.onclose = () => {
        if (disposed) return
        setFeed((f) => ({ ...f, connected: false }))
        // Capped exponential backoff; a fresh token is read on every attempt.
        const delay = Math.min(1000 * 2 ** attempt.current, MAX_BACKOFF_MS)
        attempt.current += 1
        retryTimer = window.setTimeout(connect, delay)
      }
      ws.onerror = () => ws?.close()
    }

    connect()
    return () => {
      disposed = true
      window.clearTimeout(retryTimer)
      ws?.close()
    }
  }, [eventId])

  return feed
}
