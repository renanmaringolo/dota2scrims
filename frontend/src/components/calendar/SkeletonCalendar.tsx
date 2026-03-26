import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonCalendarProps {
  viewMode: 'week' | 'day'
}

export default function SkeletonCalendar({ viewMode }: SkeletonCalendarProps) {
  if (viewMode === 'day') {
    return (
      <div className="flex flex-col gap-3" data-testid="skeleton-day">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-3" data-testid="skeleton-week">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}
