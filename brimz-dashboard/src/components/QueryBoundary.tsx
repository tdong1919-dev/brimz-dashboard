// Shared loading/error shell so every page handles query states consistently.
import { RefreshCw } from 'lucide-react'
import type { UseQueryResult } from '@tanstack/react-query'

interface Props<T> {
  query: UseQueryResult<T>
  children: (data: T) => React.ReactNode
  /** compact = inline card-sized states (for one card among many) */
  compact?: boolean
}

export default function QueryBoundary<T>({ query, children, compact }: Props<T>) {
  if (query.isPending) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'py-6' : 'py-16'}`}>
        <div className="flex items-center gap-2 text-[#475569] text-xs">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Loading…
        </div>
      </div>
    )
  }
  if (query.isError) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 ${compact ? 'py-6' : 'py-16'}`}>
        <div className="text-xs text-[#ef4444]">Failed to load: {(query.error as Error).message}</div>
        <button
          onClick={() => query.refetch()}
          className="text-xs text-[#14b8a6] border border-[#14b8a6]/30 rounded-lg px-3 py-1 hover:bg-[#14b8a6]/10"
        >
          Retry
        </button>
      </div>
    )
  }
  return <>{children(query.data as T)}</>
}
