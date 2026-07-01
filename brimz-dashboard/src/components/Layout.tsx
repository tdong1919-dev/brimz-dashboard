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
    <div className="flex h-screen bg-[#0a0d14] overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activePage={activePage} setActivePage={(p) => { setActivePage(p); setSidebarOpen(false) }} isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
