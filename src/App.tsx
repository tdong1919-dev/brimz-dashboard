import { useState } from 'react'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Billing from './pages/Billing'
import {
  FanEnergyIndex,
  HeatMaps,
  ThemeNights,
  SponsorIntelligence,
  EmotionalPeaks,
  EventComparison,
  ExecutiveInsights,
} from './pages/Intelligence'

export type PageKey = 'overview' | 'fei' | 'heatmaps' | 'themes' | 'sponsorIntel' | 'peaks' | 'comparison' | 'insights' | 'billing'

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pages: Record<PageKey, React.ReactNode> = {
    overview: <Overview />,
    fei: <FanEnergyIndex />,
    heatmaps: <HeatMaps />,
    themes: <ThemeNights />,
    sponsorIntel: <SponsorIntelligence />,
    peaks: <EmotionalPeaks />,
    comparison: <EventComparison />,
    insights: <ExecutiveInsights />,
    billing: <Billing />,
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {pages[activePage]}
    </Layout>
  )
}
