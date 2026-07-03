// Admin (Milestone 3) — the "user simulation" cockpit.
//
// The dashboard always *looks* live because the playback engine loops the
// seeded event; this screen is where an Admin controls what "live" is showing:
//   · Playback panel — play/pause/seek/speed over the event energy curve
//   · Data panel — reseed/reset the simulated stadium (background task)
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AreaChart, Area, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Activity, Database, FastForward, Pause, Play, RadioTower, RotateCcw, Zap } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import QueryBoundary from '../components/QueryBoundary'
import { get, post } from '../api/client'
import { DEMO_EVENT_ID, fmtClockFull, human, useEnergyTimeline, useMoments } from '../api/queries'
import { useLive } from '../live/useLive'
import type { components } from '../api/types.gen'

type S = components['schemas']

const panelCls = 'bg-[#141824] border border-[#1e2535] rounded-xl p-5'
const btnCls =
  'flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-2 transition-colors disabled:opacity-40'
const tealBtn = `${btnCls} bg-[#14b8a6] hover:bg-[#0d9488] text-black`
const darkBtn = `${btnCls} bg-[#1a1f2e] border border-[#2a2f3e] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#3a3f4e]`

const LOOP_PRESETS = [
  { label: '1 min loop', seconds: 60 },
  { label: '5 min loop', seconds: 300 },
  { label: '15 min loop', seconds: 900 },
]

function SectionTitle({ icon: Icon, title, right }: { icon: React.ElementType; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#14b8a6]" />
        <h2 className="text-xs font-bold tracking-widest text-[#94a3b8] uppercase">{title}</h2>
      </div>
      {right}
    </div>
  )
}

// ── Playback panel ────────────────────────────────────────────────────────────

function PlaybackPanel() {
  const live = useLive()
  const timeline = useEnergyTimeline()
  const moments = useMoments()
  const queryClient = useQueryClient()

  const control = useMutation({
    mutationFn: (body: S['PlaybackControlIn']) => post<S['PlaybackStateOut']>('/api/v1/playback', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playback'] }),
  })

  const playback = live.playback
  const state = live.state
  const mode = playback?.mode ?? '—'
  const playhead = playback ? fmtClockFull(playback.playhead) : '—'
  const hottest = state ? [...state.zones].sort((a, b) => b.energy - a.energy).slice(0, 3) : []

  const seekTo = (ts: string) => control.mutate({ mode: 'seek', seek: ts })

  return (
    <div className={panelCls}>
      <SectionTitle
        icon={RadioTower}
        title="Playback — live simulation"
        right={
          <span
            data-testid="ws-status"
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              live.connected
                ? 'text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20'
                : 'text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20'
            }`}
          >
            {live.connected ? '● LIVE FEED' : '○ RECONNECTING'}
          </span>
        }
      />

      {/* Live readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-[#1a1f2e] rounded-lg p-2.5">
          <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Playhead</div>
          <div className="text-sm font-black text-[#e2e8f0]" data-testid="playhead">{playhead}</div>
        </div>
        <div className="bg-[#1a1f2e] rounded-lg p-2.5">
          <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Mode</div>
          <div className="text-sm font-black text-[#14b8a6] uppercase" data-testid="playback-mode">{mode}</div>
        </div>
        <div className="bg-[#1a1f2e] rounded-lg p-2.5">
          <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Total energy</div>
          <div className="text-sm font-black text-[#f59e0b]" data-testid="total-energy">
            {state ? human(state.total_energy) : '—'}
          </div>
        </div>
        <div className="bg-[#1a1f2e] rounded-lg p-2.5">
          <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Speed</div>
          <div className="text-sm font-black text-[#e2e8f0]">
            {playback ? `${Math.round(playback.speed)}×` : '—'}
          </div>
        </div>
      </div>

      {/* Transport */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button className={tealBtn} onClick={() => control.mutate({ mode: 'live' })} data-testid="play">
          <Play className="w-3.5 h-3.5" /> Play (live loop)
        </button>
        <button className={darkBtn} onClick={() => control.mutate({ mode: 'paused' })} data-testid="pause">
          <Pause className="w-3.5 h-3.5" /> Pause
        </button>
        <div className="w-px h-6 bg-[#2a2f3e] mx-1" />
        {LOOP_PRESETS.map((p) => (
          <button
            key={p.seconds}
            className={`${darkBtn} ${playback && Math.round(playback.loop_seconds) === p.seconds ? 'border-[#14b8a6]/40 text-[#14b8a6]' : ''}`}
            onClick={() => control.mutate({ loop_seconds: p.seconds })}
          >
            <FastForward className="w-3.5 h-3.5" /> {p.label}
          </button>
        ))}
      </div>

      {/* Scrub timeline — click the curve to seek */}
      <div className="mb-1 text-[10px] text-[#64748b]">Click anywhere on the curve to seek the whole dashboard to that moment.</div>
      <QueryBoundary query={timeline} compact>
        {(points) => (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={points}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              onClick={(e) => {
                const ts = (e?.activePayload?.[0]?.payload as { ts?: string } | undefined)?.ts
                if (ts) seekTo(ts)
              }}
              style={{ cursor: 'pointer' }}
            >
              <defs>
                <linearGradient id="adminEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, 'Energy']}
              />
              <Area type="monotone" dataKey="energy" stroke="#14b8a6" strokeWidth={2} fill="url(#adminEnergy)" dot={false} />
              {playback && (
                <ReferenceLine
                  x={points.reduce(
                    (best, p) =>
                      Math.abs(new Date(p.ts).getTime() - new Date(playback.playhead).getTime()) <
                      Math.abs(new Date(best.ts).getTime() - new Date(playback.playhead).getTime())
                        ? p
                        : best,
                    points[0],
                  )?.time}
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </QueryBoundary>

      {/* Jump to moment */}
      <QueryBoundary query={moments} compact>
        {(items) => (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {items.map((m) =>
              m.occurredAt ? (
                <button
                  key={m.rank}
                  onClick={() => seekTo(m.occurredAt!)}
                  className="text-[10px] font-semibold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded px-2 py-1 hover:bg-[#f59e0b]/20"
                >
                  ⚡ {m.event} · {m.time}
                </button>
              ) : null,
            )}
          </div>
        )}
      </QueryBoundary>

      {/* Hottest zones right now */}
      {hottest.length > 0 && (
        <div className="mt-4 border-t border-[#1e293b] pt-3">
          <div className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide mb-2">Hottest sections right now</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {hottest.map((z) => (
              <div key={z.zone_id} className="flex items-center gap-2 bg-[#1a1f2e] rounded-lg p-2">
                <Zap className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-[#e2e8f0] truncate">{z.name}</div>
                  <div className="text-[10px] text-[#f59e0b] font-bold">{human(z.energy)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Data panel ────────────────────────────────────────────────────────────────

function DataPanel() {
  const queryClient = useQueryClient()
  const [attendees, setAttendees] = useState(500)
  const [confirmText, setConfirmText] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const wasRunning = useRef(false)

  const status = useQuery({
    queryKey: ['admin', 'status'],
    queryFn: () => get<S['AdminStatusOut']>('/api/v1/admin/status'),
  })

  const task = useQuery({
    queryKey: ['admin', 'task'],
    queryFn: () => get<S['AdminTaskOut']>('/api/v1/admin/task'),
    retry: false,
    refetchInterval: (q) => (q.state.data?.state === 'running' ? 1000 : false),
  })
  const running = task.data?.state === 'running'

  // When a task finishes, every dataset on screen may have changed — refetch all.
  useEffect(() => {
    if (wasRunning.current && !running) {
      queryClient.invalidateQueries()
    }
    wasRunning.current = !!running
  }, [running, queryClient])

  const start = useMutation({
    mutationFn: (body: { kind: 'seed' | 'reset'; payload: unknown }) =>
      post<S['AdminTaskOut']>(`/api/v1/admin/${body.kind}`, body.payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'task'] }),
  })

  return (
    <div className={panelCls}>
      <SectionTitle icon={Database} title="Mock data — simulated stadium" />

      {/* Current data */}
      <QueryBoundary query={status} compact>
        {(s) => (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="bg-[#1a1f2e] rounded-lg p-2.5">
              <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Attendees</div>
              <div className="text-sm font-black text-[#e2e8f0]" data-testid="admin-attendees">{s.attendees.toLocaleString()}</div>
            </div>
            <div className="bg-[#1a1f2e] rounded-lg p-2.5">
              <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Total rows</div>
              <div className="text-sm font-black text-[#e2e8f0]">{s.total.toLocaleString()}</div>
            </div>
            <div className="bg-[#1a1f2e] rounded-lg p-2.5">
              <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Tables</div>
              <div className="text-sm font-black text-[#e2e8f0]">{Object.keys(s.tables).length}</div>
            </div>
            <div className="bg-[#1a1f2e] rounded-lg p-2.5">
              <div className="text-[9px] text-[#64748b] uppercase tracking-wide">Demo event</div>
              <div className="text-sm font-black text-[#14b8a6]">#{s.demo_event_id}</div>
            </div>
          </div>
        )}
      </QueryBoundary>

      {/* Task progress */}
      {task.data && (
        <div
          data-testid="admin-task"
          className={`text-xs rounded-lg px-3 py-2 mb-4 border ${
            task.data.state === 'running'
              ? 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20'
              : task.data.state === 'done'
                ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
                : 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20'
          }`}
        >
          {task.data.state === 'running' && (
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              {task.data.kind === 'seed' ? 'Reseeding the stadium…' : 'Resetting tables…'} the live feed will pick up the new data automatically.
            </span>
          )}
          {task.data.state === 'done' && (
            <span>
              Last {task.data.kind} finished{task.data.counts?.attendees != null ? ` — ${task.data.counts.attendees} attendees` : ''}. Dashboard refreshed.
            </span>
          )}
          {task.data.state === 'failed' && <span>Task failed: {task.data.error}</span>}
        </div>
      )}

      {/* Reseed */}
      <div className="border-t border-[#1e293b] pt-4 mb-4">
        <div className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide mb-2">Reseed stadium</div>
        <p className="text-[11px] text-[#64748b] mb-3">
          Regenerates the whole simulated stadium (attendees, wearable samples, per-zone energy) from the deterministic
          seed. The playback loop keeps running — sections re-light from the new data as soon as it lands.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[10px] font-semibold tracking-widest text-[#64748b] uppercase mb-1">Attendees</label>
            <input
              type="number"
              min={1}
              max={100000}
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              data-testid="seed-attendees"
              className="w-28 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#14b8a6]/50"
            />
          </div>
          <button
            className={tealBtn}
            disabled={running || start.isPending}
            data-testid="seed-run"
            onClick={() => start.mutate({ kind: 'seed', payload: { attendees } })}
          >
            <Database className="w-3.5 h-3.5" /> {running ? 'Task running…' : 'Reseed now'}
          </button>
        </div>
      </div>

      {/* Reset (destructive) */}
      <div className="border-t border-[#1e293b] pt-4">
        <div className="text-[10px] font-semibold text-[#ef4444] uppercase tracking-wide mb-2">Danger zone</div>
        {!confirmOpen ? (
          <button className={`${darkBtn} hover:!text-[#ef4444] hover:!border-[#ef4444]/40`} onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset all tables…
          </button>
        ) : (
          <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-lg p-3">
            <p className="text-[11px] text-[#ef4444] mb-2">
              This drops and recreates every table, leaving the database <b>empty</b> — the dashboard will have nothing to
              show until you reseed. Type <b>RESET</b> to confirm.
            </p>
            <div className="flex items-center gap-2">
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET"
                className="w-28 bg-[#1a1f2e] border border-[#ef4444]/30 rounded-lg px-3 py-2 text-sm text-[#e2e8f0] outline-none"
              />
              <button
                className={`${btnCls} bg-[#ef4444] hover:bg-[#dc2626] text-white`}
                disabled={confirmText !== 'RESET' || running}
                onClick={() => {
                  start.mutate({ kind: 'reset', payload: { reseed: false } })
                  setConfirmOpen(false)
                  setConfirmText('')
                }}
              >
                Reset everything
              </button>
              <button className={darkBtn} onClick={() => { setConfirmOpen(false); setConfirmText('') }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Admin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin — Stadium Simulation"
        subtitle="Drive the live playback and control the mock data behind every dashboard view"
      />
      <PlaybackPanel />
      <DataPanel />
    </div>
  )
}
