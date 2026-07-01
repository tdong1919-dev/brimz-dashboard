// ── KPIs ─────────────────────────────────────────────────────────────────────
export const kpis = [
  { label: 'Total Attendance',      value: '48,672', change: '+18.2%', up: true, color: 'teal',   icon: 'Users',       sub: 'vs previous 5 events' },
  { label: 'Avg Engagement Score',  value: '76',     change: '+12.4%', up: true, color: 'purple', icon: 'Zap',         sub: 'vs previous 5 events', suffix: '/100' },
  { label: 'Total Energy Generated',value: '1.2M',   change: '+23.7%', up: true, color: 'teal',   icon: 'Activity',    sub: 'vs previous 5 events' },
  { label: 'Revenue (Gross)',        value: '$2.48M', change: '+16.3%', up: true, color: 'gold',   icon: 'DollarSign',  sub: 'vs previous 5 events' },
  { label: 'Sponsorship Revenue',   value: '$756K',  change: '+21.5%', up: true, color: 'gold',   icon: 'Award',       sub: 'vs previous 5 events' },
  { label: 'Net Promoter Score',    value: '64',     change: '+9.1%',  up: true, color: 'purple', icon: 'Star',        sub: 'vs previous 5 events' },
]

// ── Energy timeline ───────────────────────────────────────────────────────────
export const energyTimeline = [
  { time: '6 PM',  energy: 18000, label: 'Doors Open' },
  { time: '6:30',  energy: 31000, label: '' },
  { time: '7 PM',  energy: 48000, label: 'Opening Act' },
  { time: '7:30',  energy: 62000, label: '' },
  { time: '8 PM',  energy: 79000, label: 'Headliner' },
  { time: '8:24',  energy: 98000, label: 'PEAK' },
  { time: '8:30',  energy: 84000, label: '' },
  { time: '9 PM',  energy: 71000, label: '' },
  { time: '9:30',  energy: 66000, label: '' },
  { time: '10 PM', energy: 72000, label: '' },
  { time: '10:15', energy: 89000, label: 'Encore' },
  { time: '10:30', energy: 74000, label: '' },
  { time: '11 PM', energy: 38000, label: '' },
]

// ── Stadium zone engagement ───────────────────────────────────────────────────
export const zoneEngagement = [
  { zone: 'Floor / GA',           score: 92, vsAvg: 18,  capacity: 4800,  filled: 98 },
  { zone: 'Lower Bowl – Center',  score: 85, vsAvg: 12,  capacity: 8200,  filled: 96 },
  { zone: 'Lower Bowl – Ends',    score: 68, vsAvg: 5,   capacity: 6400,  filled: 89 },
  { zone: 'Club Level',           score: 74, vsAvg: 8,   capacity: 3600,  filled: 92 },
  { zone: 'Upper Bowl – Center',  score: 55, vsAvg: -3,  capacity: 10800, filled: 81 },
  { zone: 'Upper Bowl – Ends',    score: 46, vsAvg: -7,  capacity: 8200,  filled: 74 },
]

// ── Fan emotions ──────────────────────────────────────────────────────────────
export const fanEmotions = [
  { emotion: 'Excited', value: 42, color: '#f59e0b' },
  { emotion: 'Happy',   value: 21, color: '#22c55e' },
  { emotion: 'Hyped',   value: 15, color: '#a855f7' },
  { emotion: 'Joyful',  value: 12, color: '#3b82f6' },
  { emotion: 'Other',   value: 10, color: '#64748b' },
]

export const emotionDrivers = [
  { name: 'Artist Performance',  pct: 48 },
  { name: 'Pyro / Visual Effects', pct: 22 },
  { name: 'Crowd Interaction',   pct: 15 },
  { name: 'Surprise Guest',      pct: 10 },
  { name: 'Giveaways / Rewards', pct: 5  },
]

// ── Engagement breakdown ──────────────────────────────────────────────────────
export const engagementBreakdown = {
  stats: [
    { label: 'Poll Participation', value: '18.6K', change: 22, up: true },
    { label: 'Challenges Joined',  value: '12.3K', change: 17, up: true },
    { label: 'Rewards Claimed',    value: '9.7K',  change: 29, up: true },
    { label: 'Social Shares',      value: '6.2K',  change: 31, up: true },
  ],
  timeline: [
    { time: '6 PM',  polls: 800,   challenges: 400,  rewards: 200,  shares: 100  },
    { time: '7 PM',  polls: 2400,  challenges: 1600, rewards: 900,  shares: 600  },
    { time: '8 PM',  polls: 5200,  challenges: 3400, rewards: 2100, shares: 1400 },
    { time: '8:30',  polls: 8400,  challenges: 5800, rewards: 3800, shares: 2200 },
    { time: '9 PM',  polls: 11200, challenges: 7800, rewards: 5400, shares: 3100 },
    { time: '10 PM', polls: 14800, challenges: 9800, rewards: 7200, shares: 4400 },
    { time: '11 PM', polls: 18600, challenges: 12300,rewards: 9700, shares: 6200 },
  ],
}

// ── Demographics ──────────────────────────────────────────────────────────────
export const demographics = {
  ageGroups: [
    { group: '17–17', pct: 2  },
    { group: '18–24', pct: 28 },
    { group: '25–34', pct: 34 },
    { group: '35–44', pct: 18 },
    { group: '45–54', pct: 8  },
    { group: '55+',   pct: 4  },
  ],
  gender: [
    { name: 'Male',            value: 52, color: '#3b82f6' },
    { name: 'Female',          value: 45, color: '#a855f7' },
    { name: 'Non-binary/Other',value: 3,  color: '#f59e0b' },
  ],
  returning: 62,
  locations: [
    { city: 'City A', pct: 42 },
    { city: 'City B', pct: 18 },
    { city: 'City C', pct: 12 },
    { city: 'City D', pct: 8  },
    { city: 'Other',  pct: 20 },
  ],
}

// ── Revenue ───────────────────────────────────────────────────────────────────
export const revenue = {
  total: 2480000,
  change: 16.3,
  breakdown: [
    { category: 'Ticketing',    amount: 1450000, pct: 58, color: '#f59e0b' },
    { category: 'Concessions',  amount: 620000,  pct: 25, color: '#14b8a6' },
    { category: 'Merchandise',  amount: 280000,  pct: 11, color: '#a855f7' },
    { category: 'Sponsorship',  amount: 130000,  pct: 5,  color: '#3b82f6' },
  ],
  perFan: 51.02,
  perFanChange: 14,
  transactions: 72654,
  transactionsChange: 11,
  events: [
    { name: 'Championship Night',   revenue: 980000,  attendance: 48672 },
    { name: 'NFL Playoff Game',     revenue: 720000,  attendance: 36400 },
    { name: 'NBA Finals Watch',     revenue: 480000,  attendance: 28900 },
    { name: 'College Bowl Game',    revenue: 300000,  attendance: 22100 },
  ],
}

// ── Sponsor ROI ───────────────────────────────────────────────────────────────
export const sponsorSummary = {
  total: 756000,
  change: 21.5,
  impressions: { value: '4.2M', change: 19 },
  engagements: { value: '312K', change: 24 },
  clicks:       { value: '48K',  change: 26 },
  conversions:  { value: '12.6K',change: 18 },
  avgROI:       { value: 6.2, change: 15 },
  topSponsor:   { name: 'BRIMZ Energy', roi: 7.8 },
  breakdown: [
    { category: 'Main Arena',    pct: 40, color: '#f59e0b' },
    { category: 'Digital',       pct: 28, color: '#14b8a6' },
    { category: 'Concourse',     pct: 18, color: '#a855f7' },
    { category: 'Activation',    pct: 14, color: '#3b82f6' },
  ],
}

export const sponsors = [
  { name: 'Nike',      impressions: '2.4M', engagements: '184K', clicks: '42K', conversions: '8.2K',  roi: '340%', tier: 'Platinum' },
  { name: 'Red Bull',  impressions: '1.8M', engagements: '142K', clicks: '31K', conversions: '6.1K',  roi: '290%', tier: 'Platinum' },
  { name: 'Samsung',   impressions: '1.2M', engagements: '98K',  clicks: '22K', conversions: '4.4K',  roi: '210%', tier: 'Gold'     },
  { name: 'Spotify',   impressions: '980K', engagements: '76K',  clicks: '18K', conversions: '3.2K',  roi: '180%', tier: 'Gold'     },
  { name: 'Pepsi',     impressions: '720K', engagements: '54K',  clicks: '12K', conversions: '2.1K',  roi: '140%', tier: 'Silver'   },
]

// ── Top moments ───────────────────────────────────────────────────────────────
export const topMoments = [
  { rank: 1, event: "Encore – Song: \"Thunder\"", time: '8:24 PM', energy: 98000, color: '#ef4444' },
  { rank: 2, event: 'Pyro Show',                  time: '8:05 PM', energy: 91000, color: '#f97316' },
  { rank: 3, event: 'Surprise Guest',             time: '8:47 PM', energy: 87000, color: '#f59e0b' },
  { rank: 4, event: 'Crowd Sing Along',           time: '7:32 PM', energy: 76000, color: '#eab308' },
  { rank: 5, event: 'Confetti Drop',              time: '10:16 PM',energy: 72000, color: '#84cc16' },
]

export const crowdTriggers = [
  'Pyro / Visuals', 'Surprise Guest', 'High Energy', 'Crowd Interaction',
  'Song Choice', 'Giveaways', 'Special Effects',
]

// ── Events ────────────────────────────────────────────────────────────────────
export const events = [
  { id: 1, name: 'Championship Night',  date: '2026-06-15', status: 'Upcoming',  attendance: 48672, venue: 'Main Arena'   },
  { id: 2, name: 'NFL Playoff Game',    date: '2026-06-22', status: 'Upcoming',  attendance: 36400, venue: 'Main Arena'   },
  { id: 3, name: 'NBA Finals Watch',    date: '2026-07-04', status: 'Planning',  attendance: 28900, venue: 'Outdoor Stage' },
  { id: 4, name: 'College Bowl Game',   date: '2026-07-19', status: 'Planning',  attendance: 22100, venue: 'Club Level'   },
  { id: 5, name: 'All-Star Weekend',    date: '2026-08-02', status: 'Draft',     attendance: 18000, venue: 'VIP Terrace'  },
]

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alerts = [
  { id: 1, type: 'warning', title: 'Crowd density spike',   message: 'Floor GA at 103% capacity',           time: '2 min ago',  zone: 'Floor GA'   },
  { id: 2, type: 'error',   title: 'Device offline',        message: 'Wristband hub B7 disconnected',        time: '8 min ago',  zone: 'Section B'  },
  { id: 3, type: 'info',    title: 'Peak engagement reached',message: 'Engagement score hit 94.2 — new record',time: '14 min ago', zone: 'All Zones'  },
  { id: 4, type: 'warning', title: 'Security flag',         message: 'Unauthorized access attempt at Gate 4',time: '21 min ago', zone: 'Gate 4'     },
  { id: 5, type: 'info',    title: 'Sponsor activation live',message: 'Nike LED wall activated in VIP Terrace',time: '35 min ago', zone: 'VIP Terrace'},
]

// ── Devices ───────────────────────────────────────────────────────────────────
export const devices = [
  { id: 'WB-001', type: 'Wristband Hub', zone: 'Floor GA',    battery: 87, status: 'Online',  connected: 1240 },
  { id: 'WB-002', type: 'Wristband Hub', zone: 'Section A',   battery: 72, status: 'Online',  connected: 890  },
  { id: 'WB-003', type: 'Wristband Hub', zone: 'Section B',   battery: 65, status: 'Online',  connected: 920  },
  { id: 'WB-004', type: 'Wristband Hub', zone: 'VIP Terrace', battery: 91, status: 'Online',  connected: 380  },
  { id: 'WB-005', type: 'Wristband Hub', zone: 'Upper Deck',  battery: 43, status: 'Warning', connected: 1820 },
  { id: 'WB-B7',  type: 'Wristband Hub', zone: 'Section B',   battery: 0,  status: 'Offline', connected: 0    },
]

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const campaigns = [
  { id: 1, name: 'Season Ticket Loyalty Rewards', type: 'Retention',   status: 'Active',    reach: '12.4K', engagement: '34%', conversion: '8.2%'  },
  { id: 2, name: 'VIP Suite Upgrade Offer',       type: 'Upsell',      status: 'Active',    reach: '3.2K',  engagement: '41%', conversion: '12.1%' },
  { id: 3, name: 'Nike x Brimz Fan Challenge',    type: 'Sponsor',     status: 'Active',    reach: '8.7K',  engagement: '28%', conversion: '5.4%'  },
  { id: 4, name: 'Early Bird Pre-Sale',           type: 'Acquisition', status: 'Scheduled', reach: '—',     engagement: '—',   conversion: '—'     },
  { id: 5, name: 'Post-Game Recap Push',          type: 'Engagement',  status: 'Draft',     reach: '—',     engagement: '—',   conversion: '—'     },
]

// ── Fan segments ──────────────────────────────────────────────────────────────
export const fanSegments = [
  { name: 'Season Ticket Holders', count: 4200,  avgSpend: '$420', visits: 18.2, engagement: 94 },
  { name: 'VIP Suite Members',     count: 1240,  avgSpend: '$680', visits: 12.4, engagement: 97 },
  { name: 'High Engagers',         count: 8800,  avgSpend: '$180', visits: 6.1,  engagement: 88 },
  { name: 'Returning Fans',        count: 18200, avgSpend: '$142', visits: 3.8,  engagement: 76 },
  { name: 'First-Timers',          count: 16232, avgSpend: '$98',  visits: 1.0,  engagement: 62 },
]

// ── UGC content ───────────────────────────────────────────────────────────────
export const ugcContent = [
  { id: 1, type: 'Video',  platform: 'Instagram', shares: 4200,  likes: 28400,  hashtag: '#BrimzFest',     time: '10 min ago' },
  { id: 2, type: 'Photo',  platform: 'TikTok',    shares: 8900,  likes: 142000, hashtag: '#BrimzVibes',    time: '22 min ago' },
  { id: 3, type: 'Story',  platform: 'Instagram', shares: 2100,  likes: 18200,  hashtag: '#LiveMoreBrimz', time: '45 min ago' },
  { id: 4, type: 'Reel',   platform: 'TikTok',    shares: 12400, likes: 210000, hashtag: '#BrimzEnergy',   time: '1 hr ago'   },
  { id: 5, type: 'Tweet',  platform: 'Twitter/X', shares: 680,   likes: 4200,   hashtag: '#Brimz',         time: '1 hr ago'   },
]

// ── Performance data ──────────────────────────────────────────────────────────
export const performanceData = [
  { event: 'Championship',  attendance: 48672, engagement: 91, revenue: 980000,  energy: 94 },
  { event: 'NFL Playoff',   attendance: 36400, engagement: 87, revenue: 720000,  energy: 89 },
  { event: 'NBA Finals',    attendance: 28900, engagement: 84, revenue: 480000,  energy: 88 },
  { event: 'College Bowl',  attendance: 22100, engagement: 78, revenue: 300000,  energy: 76 },
  { event: 'All-Star',      attendance: 18000, engagement: 71, revenue: 220000,  energy: 62 },
]
