/**
 * Skeleton loader for the watch page while video data is loading.
 */
export function WatchPageSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Back button skeleton */}
      <div className="h-10 w-32 bg-secondary rounded-lg animate-pulse" />

      {/* Video player skeleton */}
      <div className="aspect-video bg-secondary rounded-xl animate-pulse" />

      {/* Video info skeleton */}
      <div className="space-y-4">
        <div className="h-7 bg-secondary rounded w-3/4 animate-pulse" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-secondary rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-secondary rounded w-32 animate-pulse" />
              <div className="h-3 bg-secondary rounded w-24 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-secondary rounded-full animate-pulse" />
            <div className="h-9 w-20 bg-secondary rounded-full animate-pulse" />
          </div>
        </div>

        {/* Description skeleton */}
        <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
          <div className="h-4 bg-secondary rounded w-48 animate-pulse" />
          <div className="h-4 bg-secondary rounded w-full animate-pulse" />
          <div className="h-4 bg-secondary rounded w-5/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
