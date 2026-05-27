import { useState, useMemo } from 'react'

type Tab = 'peak' | 'avg' | 'total'

// ── Stadium geometry ──────────────────────────────────────────────────────────
const CX = 268, CY = 192
const OUTER_RX = 250, OUTER_RY = 168   // outer rim
const INNER_RX = 142, INNER_RY = 88    // inner edge (club level / field wall)

// Concentric rings (grid structure)
const RINGS = Array.from({ length: 11 }, (_, i) => {
  const t = i / 10
  return {
    rx: INNER_RX + t * (OUTER_RX - INNER_RX),
    ry: INNER_RY + t * (OUTER_RY - INNER_RY),
  }
})

// Radial spokes (grid structure) – 32 spokes
const SPOKES = Array.from({ length: 32 }, (_, i) => {
  const a = (i / 32) * 2 * Math.PI
  const c = Math.cos(a), s = Math.sin(a)
  return {
    x1: CX + INNER_RX * c, y1: CY + INNER_RY * s,
    x2: CX + OUTER_RX * c, y2: CY + OUTER_RY * s,
  }
})

// ── Heat blob definitions per tab ─────────────────────────────────────────────
type Blob = { cx: number; cy: number; rx: number; ry: number; fill: string; opacity: number; blur: number }
type Cfg  = { blobs: Blob[]; label: string; sub: string }

const P = { cx: CX, cy: CY }   // shorthand for center

const CONFIGS: Record<Tab, Cfg> = {
  // ── PEAK ENERGY ─────────────────────────────────────────────────────────────
  peak: {
    blobs: [
      // Cold outer base
      { ...P, rx: 250, ry: 168, fill: '#0e1040', opacity: 0.95, blur: 0  },
      // Blue outer ring
      { ...P, rx: 250, ry: 168, fill: '#1e3a8a', opacity: 0.70, blur: 18 },
      // Teal mid-band
      { ...P, rx: 215, ry: 140, fill: '#0369a1', opacity: 0.50, blur: 22 },
      // Green-yellow lower bowl band
      { cx: CX, cy: CY + 15, rx: 185, ry: 118, fill: '#a16207', opacity: 0.45, blur: 26 },
      // Left orange blob
      { cx: CX - 156, cy: CY,      rx: 76,  ry: 100, fill: '#ea580c', opacity: 0.82, blur: 18 },
      { cx: CX - 154, cy: CY,      rx: 42,  ry: 56,  fill: '#f97316', opacity: 0.72, blur: 10 },
      // Right orange blob
      { cx: CX + 156, cy: CY,      rx: 76,  ry: 100, fill: '#ea580c', opacity: 0.82, blur: 18 },
      { cx: CX + 154, cy: CY,      rx: 42,  ry: 56,  fill: '#f97316', opacity: 0.72, blur: 10 },
      // Top red hotspot (stage/artist end)
      { cx: CX,       cy: CY - 106, rx: 108, ry: 62,  fill: '#dc2626', opacity: 0.95, blur: 20 },
      { cx: CX,       cy: CY - 100, rx: 60,  ry: 35,  fill: '#ef4444', opacity: 1.00, blur: 10 },
      { cx: CX,       cy: CY - 97,  rx: 28,  ry: 17,  fill: '#ff7070', opacity: 0.90, blur: 5  },
      // Bottom red hotspot (Floor/GA)
      { cx: CX,       cy: CY + 112, rx: 112, ry: 63,  fill: '#dc2626', opacity: 0.95, blur: 20 },
      { cx: CX,       cy: CY + 107, rx: 62,  ry: 37,  fill: '#ef4444', opacity: 1.00, blur: 10 },
      { cx: CX,       cy: CY + 105, rx: 29,  ry: 18,  fill: '#ff7070', opacity: 0.90, blur: 5  },
    ],
    label: 'Peak Moment: 8:24 PM',
    sub:   'During Artist Encore – Song: "Thunder"',
  },

  // ── AVG ENERGY ──────────────────────────────────────────────────────────────
  avg: {
    blobs: [
      // Cold base
      { ...P, rx: 250, ry: 168, fill: '#0e1040', opacity: 0.95, blur: 0  },
      // Deep blue outer
      { ...P, rx: 250, ry: 168, fill: '#1d4ed8', opacity: 0.58, blur: 18 },
      // Blue mid
      { ...P, rx: 222, ry: 146, fill: '#0284c7', opacity: 0.48, blur: 22 },
      // Green layer (shifted toward stage end)
      { cx: CX, cy: CY - 28, rx: 190, ry: 120, fill: '#15803d', opacity: 0.40, blur: 26 },
      // Warm amber upper bowl
      { cx: CX, cy: CY - 55, rx: 158, ry: 97,  fill: '#b45309', opacity: 0.42, blur: 24 },
      // Left mild yellow
      { cx: CX - 138, cy: CY - 12, rx: 82,  ry: 104, fill: '#ca8a04', opacity: 0.58, blur: 20 },
      { cx: CX - 136, cy: CY - 12, rx: 46,  ry: 58,  fill: '#d97706', opacity: 0.50, blur: 12 },
      // Right mild yellow
      { cx: CX + 138, cy: CY - 12, rx: 82,  ry: 104, fill: '#ca8a04', opacity: 0.58, blur: 20 },
      { cx: CX + 136, cy: CY - 12, rx: 46,  ry: 58,  fill: '#d97706', opacity: 0.50, blur: 12 },
      // Top – main hotspot (orange-red)
      { cx: CX, cy: CY - 106, rx: 115, ry: 65,  fill: '#ea580c', opacity: 0.90, blur: 22 },
      { cx: CX, cy: CY - 100, rx: 64,  ry: 37,  fill: '#dc2626', opacity: 0.92, blur: 12 },
      { cx: CX, cy: CY - 96,  rx: 30,  ry: 18,  fill: '#ef4444', opacity: 0.86, blur: 6  },
      // Floor/GA – cooler blue-green
      { cx: CX, cy: CY + 108, rx: 102, ry: 58,  fill: '#0369a1', opacity: 0.62, blur: 20 },
      { cx: CX, cy: CY + 105, rx: 54,  ry: 31,  fill: '#0ea5e9', opacity: 0.50, blur: 10 },
    ],
    label: 'Average Energy: 6.7 / 10',
    sub:   'Overall crowd energy across the entire event',
  },

  // ── TOTAL ENERGY ────────────────────────────────────────────────────────────
  total: {
    blobs: [
      // Dark cold base
      { ...P, rx: 250, ry: 168, fill: '#0a0820', opacity: 1.00, blur: 0  },
      // Cold purple-blue outer
      { ...P, rx: 250, ry: 168, fill: '#1e1b6e', opacity: 0.80, blur: 15 },
      // Blue ring
      { ...P, rx: 238, ry: 158, fill: '#1d4ed8', opacity: 0.62, blur: 15 },
      // Cyan ring
      { ...P, rx: 222, ry: 145, fill: '#0284c7', opacity: 0.52, blur: 18 },
      // Green ring
      { ...P, rx: 202, ry: 130, fill: '#059669', opacity: 0.46, blur: 20 },
      // Yellow ring
      { ...P, rx: 180, ry: 114, fill: '#ca8a04', opacity: 0.40, blur: 20 },
      // Corner green connectors
      { cx: CX - 98,  cy: CY - 78, rx: 96, ry: 70, fill: '#16a34a', opacity: 0.55, blur: 18 },
      { cx: CX + 98,  cy: CY - 78, rx: 96, ry: 70, fill: '#16a34a', opacity: 0.55, blur: 18 },
      { cx: CX - 98,  cy: CY + 78, rx: 96, ry: 70, fill: '#16a34a', opacity: 0.55, blur: 18 },
      { cx: CX + 98,  cy: CY + 78, rx: 96, ry: 70, fill: '#16a34a', opacity: 0.55, blur: 18 },
      // Top red hotspot
      { cx: CX,       cy: CY - 108, rx: 118, ry: 66,  fill: '#dc2626', opacity: 0.95, blur: 22 },
      { cx: CX,       cy: CY - 102, rx: 65,  ry: 37,  fill: '#ef4444', opacity: 1.00, blur: 11 },
      { cx: CX,       cy: CY - 98,  rx: 32,  ry: 18,  fill: '#ff5555', opacity: 0.95, blur: 5  },
      // Bottom red hotspot
      { cx: CX,       cy: CY + 115, rx: 118, ry: 62,  fill: '#dc2626', opacity: 0.95, blur: 22 },
      { cx: CX,       cy: CY + 110, rx: 63,  ry: 36,  fill: '#ef4444', opacity: 1.00, blur: 11 },
      { cx: CX,       cy: CY + 113, rx: 30,  ry: 17,  fill: '#ff5555', opacity: 0.95, blur: 5  },
      // Left red-orange hotspot
      { cx: CX - 168, cy: CY,       rx: 72,  ry: 96,  fill: '#ea580c', opacity: 0.92, blur: 20 },
      { cx: CX - 166, cy: CY,       rx: 40,  ry: 54,  fill: '#dc2626', opacity: 0.84, blur: 11 },
      { cx: CX - 165, cy: CY,       rx: 20,  ry: 27,  fill: '#f97316', opacity: 0.76, blur: 5  },
      // Right red-orange hotspot
      { cx: CX + 168, cy: CY,       rx: 72,  ry: 96,  fill: '#ea580c', opacity: 0.92, blur: 20 },
      { cx: CX + 166, cy: CY,       rx: 40,  ry: 54,  fill: '#dc2626', opacity: 0.84, blur: 11 },
      { cx: CX + 165, cy: CY,       rx: 20,  ry: 27,  fill: '#f97316', opacity: 0.76, blur: 5  },
    ],
    label: 'Total Energy: 1.2M',
    sub:   'Cumulative energy generated throughout the entire event',
  },
}

// All unique blur values across all configs
const BLUR_VALUES = [...new Set(
  Object.values(CONFIGS).flatMap(c => c.blobs.map(b => b.blur))
)].filter(b => b > 0).sort((a, b) => a - b)

// ══════════════════════════════════════════════════════════════════════════════
export default function HeatmapCard() {
  const [tab, setTab] = useState<Tab>('peak')
  const cfg = CONFIGS[tab]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {([['peak','Peak Energy'],['avg','Avg Energy'],['total','Total Energy']] as [Tab,string][]).map(([t, lbl]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all border ${
              tab === t
                ? 'bg-transparent border-[#14b8a6] text-[#14b8a6]'
                : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >{lbl}</button>
        ))}
      </div>

      {/* SVG heatmap */}
      <svg viewBox="0 0 560 385" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          {/* One filter per unique blur value */}
          {BLUR_VALUES.map(b => (
            <filter key={b} id={`hb${b}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation={b} />
            </filter>
          ))}

          {/* Clip to outer oval */}
          <clipPath id="heatClip">
            <ellipse cx={CX} cy={CY} rx={OUTER_RX} ry={OUTER_RY} />
          </clipPath>

          {/* Colour scale bar gradient */}
          <linearGradient id="heatScale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ef4444" />
            <stop offset="16%"  stopColor="#f97316" />
            <stop offset="32%"  stopColor="#eab308" />
            <stop offset="50%"  stopColor="#22c55e" />
            <stop offset="66%"  stopColor="#06b6d4" />
            <stop offset="83%"  stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Page background */}
        <rect width="560" height="385" fill="#0a0d14" />

        {/* ── Stadium outer shell ── */}
        <ellipse cx={CX} cy={CY} rx={OUTER_RX} ry={OUTER_RY} fill="#0d1117" stroke="#1e293b" strokeWidth="1" />

        {/* ── Everything inside the oval ── */}
        <g clipPath="url(#heatClip)">

          {/* Heat blobs */}
          {cfg.blobs.map((b, i) => (
            <ellipse
              key={i}
              cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry}
              fill={b.fill} opacity={b.opacity}
              filter={b.blur > 0 ? `url(#hb${b.blur})` : undefined}
            />
          ))}

          {/* ── Grid lines ── */}
          {/* Concentric rings */}
          {RINGS.map((r, i) => (
            <ellipse key={i} cx={CX} cy={CY} rx={r.rx} ry={r.ry}
              fill="none" stroke="#22d3ee" strokeWidth="0.55" opacity="0.28" />
          ))}
          {/* Radial spokes */}
          {SPOKES.map((sp, i) => (
            <line key={i} x1={sp.x1} y1={sp.y1} x2={sp.x2} y2={sp.y2}
              stroke="#22d3ee" strokeWidth="0.5" opacity="0.22" />
          ))}

          {/* ── Playing field (centre, dark) ── */}
          <rect x="130" y="128" width="276" height="128" rx="12" fill="#070e08" />
          {/* Grass */}
          <rect x="133" y="131" width="270" height="122" rx="10" fill="#0b1a0e" stroke="#142b18" strokeWidth="0.8" />
          {/* Grass alternating stripes */}
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x="133" y={131 + i * 17.4} width="270" height="17.4"
              fill={i % 2 === 0 ? '#0b1a0e' : '#0d2012'} />
          ))}
          {/* Pitch markings */}
          <rect x="137" y="135" width="262" height="114" fill="none" stroke="#1a3d22" strokeWidth="0.8" />
          <line x1="268" y1="135" x2="268" y2="249" stroke="#1a3d22" strokeWidth="0.8" />
          <circle cx="268" cy="192" r="22" fill="none" stroke="#1a3d22" strokeWidth="0.8" />
          <circle cx="268" cy="192" r="2.5" fill="#1a3d22" />
          {/* Left penalty area */}
          <rect x="137" y="160" width="52" height="64" fill="none" stroke="#1a3d22" strokeWidth="0.7" />
          <rect x="137" y="172" width="28" height="40" fill="none" stroke="#1a3d22" strokeWidth="0.6" />
          {/* Right penalty area */}
          <rect x="347" y="160" width="52" height="64" fill="none" stroke="#1a3d22" strokeWidth="0.7" />
          <rect x="371" y="172" width="28" height="40" fill="none" stroke="#1a3d22" strokeWidth="0.6" />

        </g>

        {/* ── Zone labels — outside clip path, never clipped ── */}
        {/* UPPER DECK: above the oval in the dark margin */}
        <text x={CX} y="18" textAnchor="middle" fill="rgba(255,255,255,0.72)" fontSize="9.5" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="2.5">UPPER DECK</text>

        {/* CLUB LEVEL: outer seating band on each side */}
        <text x="66"  y={CY - 5} textAnchor="middle" fill="rgba(255,255,255,0.52)" fontSize="8" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1.5">CLUB</text>
        <text x="66"  y={CY + 7} textAnchor="middle" fill="rgba(255,255,255,0.52)" fontSize="8" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1.5">LEVEL</text>
        <text x="470" y={CY - 5} textAnchor="middle" fill="rgba(255,255,255,0.52)" fontSize="8" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1.5">CLUB</text>
        <text x="470" y={CY + 7} textAnchor="middle" fill="rgba(255,255,255,0.52)" fontSize="8" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1.5">LEVEL</text>

        {/* LOWER BOWL: inner seating band on each side (between club and field wall) */}
        <text x="103" y={CY - 5} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7.5" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1">LOWER</text>
        <text x="103" y={CY + 6} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7.5" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1">BOWL</text>
        <text x="433" y={CY - 5} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7.5" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1">LOWER</text>
        <text x="433" y={CY + 6} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7.5" fontWeight="600" fontFamily="Inter,sans-serif" letterSpacing="1">BOWL</text>

        {/* FLOOR / GA: below the oval in the dark margin */}
        <text x={CX} y="375" textAnchor="middle" fill="rgba(255,255,255,0.72)" fontSize="9.5" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="2.5">FLOOR / GA</text>

        {/* ── Colour scale bar (outside clip) ── */}
        <rect x="535" y="32"  width="12" height="158" rx="6" fill="url(#heatScale)" />
        <text x="530" y="28"  textAnchor="end" fill="#94a3b8" fontSize="9"  fontFamily="Inter,sans-serif">Highest</text>
        <text x="530" y="200" textAnchor="end" fill="#94a3b8" fontSize="9"  fontFamily="Inter,sans-serif">Lowest</text>
      </svg>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="text-xs font-bold" style={{ color: CONFIGS[tab].label.startsWith('Total') ? '#14b8a6' : '#14b8a6' }}>
          {cfg.label}
        </span>
        <span className="text-[10px] text-[#64748b]">{cfg.sub}</span>
      </div>
    </div>
  )
}
