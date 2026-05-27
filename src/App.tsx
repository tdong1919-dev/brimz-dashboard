import { useState } from 'react'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Performance from './pages/Performance'
import CrowdInsights from './pages/CrowdInsights'
import FanEngagement from './pages/FanEngagement'
import Revenue from './pages/Revenue'
import SponsorshipROI from './pages/SponsorshipROI'
import Reporting from './pages/Reporting'
import EventManagement from './pages/EventManagement'
import StaffAccess from './pages/StaffAccess'
import DevicesInventory from './pages/DevicesInventory'
import Alerts from './pages/Alerts'
import FanSegmentation from './pages/FanSegmentation'
import Campaigns from './pages/Campaigns'
import ContentUGC from './pages/ContentUGC'
import VenueProfile from './pages/VenueProfile'
import Integrations from './pages/Integrations'
import Billing from './pages/Billing'

export type PageKey = 'overview' | 'performance' | 'crowd' | 'fanengagement' | 'revenue' | 'sponsorship' | 'reporting' | 'events' | 'staff' | 'devices' | 'alerts' | 'segments' | 'campaigns' | 'ugc' | 'profile' | 'integrations' | 'billing'

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pages: Record<PageKey, React.ReactNode> = {
    overview: <Overview />,
    performance: <Performance />,
    crowd: <CrowdInsights />,
    fanengagement: <FanEngagement />,
    revenue: <Revenue />,
    sponsorship: <SponsorshipROI />,
    reporting: <Reporting />,
    events: <EventManagement />,
    staff: <StaffAccess />,
    devices: <DevicesInventory />,
    alerts: <Alerts />,
    segments: <FanSegmentation />,
    campaigns: <Campaigns />,
    ugc: <ContentUGC />,
    profile: <VenueProfile />,
    integrations: <Integrations />,
    billing: <Billing />,
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {pages[activePage]}
    </Layout>
  )
}
