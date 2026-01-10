/**
 * Skeleton loader for the channel page while data is loading.
 */
export function ChannelPageSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Banner skeleton */}
      <div className="h-32 sm:h-48 bg-secondary rounded-xl animate-pulse" />

      {/* Channel info skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-4 sm:px-0">
        {/* Avatar */}
        <div className="h-24 w-24 sm:h-32 sm:w-32 sm:-mt-16 bg-secondary rounded-full animate-pulse border-4 border-background" />

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-secondary rounded w-48 animate-pulse" />
              <div className="h-4 bg-secondary rounded w-64 animate-pulse" />
            </div>
            <div className="h-10 bg-secondary rounded-full w-32 animate-pulse" />
          </div>
          <div className="h-4 bg-secondary rounded w-96 max-w-full animate-pulse" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4 border-b pb-2">
        <div className="h-8 bg-secondary rounded w-20 animate-pulse" />
        <div className="h-8 bg-secondary rounded w-20 animate-pulse" />
        <div className="h-8 bg-secondary rounded w-20 animate-pulse" />
      </div>

      {/* Videos grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="aspect-video bg-secondary rounded-xl" />
            <div className="h-5 bg-secondary rounded w-3/4" />
            <div className="h-4 bg-secondary rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
