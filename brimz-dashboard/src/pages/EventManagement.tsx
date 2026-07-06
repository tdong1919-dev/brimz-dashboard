import { Calendar, CheckCircle, Circle, Clock, MapPin } from 'lucide-react'
import { useEvents } from '../api/queries'
import QueryBoundary from '../components/QueryBoundary'
import ChartCard from '../components/ChartCard'
import PageHeader from '../components/PageHeader'

const statusColors: Record<string, string> = {
  Upcoming: '#14b8a6',
  Planning: '#f59e0b',
  Draft: '#64748b',
  Completed: '#22c55e',
}

const checklist = [
  { task: 'Venue layout approved', done: true },
  { task: 'Artist rider confirmed', done: true },
  { task: 'Wristband system configured', done: true },
  { task: 'Staff schedule finalized', done: false },
  { task: 'Sponsor activations mapped', done: false },
  { task: 'Emergency exits briefed', done: false },
  { task: 'App push notifications scheduled', done: false },
]

const timeline = [
  { time: '2:00 PM', activity: 'Venue doors open — crew access' },
  { time: '3:30 PM', activity: 'Wristband activation stations live' },
  { time: '5:00 PM', activity: 'Sponsor activations go live' },
  { time: '6:00 PM', activity: 'Fan doors open' },
  { time: '7:30 PM', activity: 'Opening act begins' },
  { time: '9:00 PM', activity: 'Headliner set starts' },
  { time: '11:30 PM', activity: 'Event close — post-event survey push' },
]

export default function EventManagement() {
  const eventsQuery = useEvents()

  return (
    <div className="space-y-6">
      <PageHeader title="Event Management" subtitle="Upcoming events, setup checklists, and activation timelines" />

      <ChartCard title="Upcoming Events">
        <QueryBoundary query={eventsQuery} compact>
          {(events) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2f3e]">
                    {['Event', 'Date', 'Venue', 'Expected Attendance', 'Status'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-[#e2e8f0]">{e.name}</td>
                      <td className="py-2.5 px-3 text-[#94a3b8]">{e.date}</td>
                      <td className="py-2.5 px-3 text-[#94a3b8]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {e.venue}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#94a3b8]">{e.attendance.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: `${statusColors[e.status]}20`, color: statusColors[e.status] }}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryBoundary>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Event Setup Checklist" subtitle="Summer Fest Night 1 · Jun 15, 2026">
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1f2e] transition-colors">
                {item.done
                  ? <CheckCircle className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-[#2a2f3e] flex-shrink-0" />
                }
                <span className={`text-sm ${item.done ? 'line-through text-[#64748b]' : 'text-[#e2e8f0]'}`}>{item.task}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#2a2f3e]">
            <div className="text-xs text-[#64748b]">3 of 7 tasks completed</div>
            <div className="h-1.5 bg-[#2a2f3e] rounded-full mt-2">
              <div className="h-full bg-[#22c55e] rounded-full" style={{ width: '43%' }} />
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Activation Timeline" subtitle="Day-of schedule for next event">
          <div className="space-y-3">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 text-right w-16">
                  <span className="text-xs font-semibold text-[#f59e0b]">{t.time}</span>
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#14b8a6] mt-1" />
                  {i < timeline.length - 1 && <div className="w-px h-8 bg-[#2a2f3e] mt-1" />}
                </div>
                <div className="text-sm text-[#94a3b8] pb-2">{t.activity}</div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
