import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth, RequireRole } from './auth/RequireAuth'
import Login from './pages/Login'
import Overview from './pages/Overview'
import CrowdInsights from './pages/CrowdInsights'
import EventManagement from './pages/EventManagement'
import Performance from './pages/Performance'
import Alerts from './pages/Alerts'
import DevicesInventory from './pages/DevicesInventory'
import VenueProfile from './pages/VenueProfile'
import StaffAccess from './pages/StaffAccess'
import Integrations from './pages/Integrations'
import FanEngagement from './pages/FanEngagement'
import FanSegmentation from './pages/FanSegmentation'
import ContentUGC from './pages/ContentUGC'
import Revenue from './pages/Revenue'
import SponsorshipROI from './pages/SponsorshipROI'
import Campaigns from './pages/Campaigns'
import Reporting from './pages/Reporting'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import {
  FanEnergyIndex,
  HeatMaps,
  ThemeNights,
  SponsorIntelligence,
  EmotionalPeaks,
  EventComparison,
  ExecutiveInsights,
} from './pages/Intelligence'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Overview /> },
          { path: '/crowd-insights', element: <CrowdInsights /> },
          { path: '/fan-energy', element: <FanEnergyIndex /> },
          { path: '/heatmaps', element: <HeatMaps /> },
          { path: '/theme-nights', element: <ThemeNights /> },
          { path: '/sponsor-intelligence', element: <SponsorIntelligence /> },
          { path: '/emotional-peaks', element: <EmotionalPeaks /> },
          { path: '/event-comparison', element: <EventComparison /> },
          { path: '/executive-insights', element: <ExecutiveInsights /> },
          { path: '/events', element: <EventManagement /> },
          { path: '/performance', element: <Performance /> },
          { path: '/alerts', element: <Alerts /> },
          { path: '/devices', element: <DevicesInventory /> },
          { path: '/venue', element: <VenueProfile /> },
          { path: '/staff', element: <StaffAccess /> },
          { path: '/integrations', element: <Integrations /> },
          { path: '/fan-engagement', element: <FanEngagement /> },
          { path: '/fan-segmentation', element: <FanSegmentation /> },
          { path: '/content', element: <ContentUGC /> },
          { path: '/revenue', element: <Revenue /> },
          { path: '/sponsorship-roi', element: <SponsorshipROI /> },
          { path: '/campaigns', element: <Campaigns /> },
          { path: '/reporting', element: <Reporting /> },
          { path: '/billing', element: <Billing /> },
          { path: '/settings', element: <Settings /> },
          {
            element: <RequireRole roles={['Admin']} />,
            children: [{ path: '/admin', element: <Admin /> }],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
