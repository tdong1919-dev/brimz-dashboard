import Sidebar from './Sidebar'
import Header from './Header'
import { PageKey } from '../App'

interface Props {
  children: React.ReactNode
  activePage: PageKey
  setActivePage: (p: PageKey) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

export default function Layout({ children, activePage, setActivePage, sidebarOpen, setSidebarOpen }: Props) {
  return (
    <div className="app-shell flex bg-[#0a0d14] overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activePage={activePage} setActivePage={(p) => { setActivePage(p); setSidebarOpen(false) }} isOpen={sidebarOpen} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="dashboard-scroll flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
    </div>
  )
}
