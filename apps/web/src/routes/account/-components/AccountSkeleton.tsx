import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton loader for account pages while data is loading.
 */
export function AccountSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <div className="h-6 bg-secondary rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-secondary rounded w-1/2 animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar skeleton */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-secondary rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 bg-secondary rounded w-32 animate-pulse" />
              <div className="h-4 bg-secondary rounded w-24 animate-pulse" />
            </div>
          </div>

          {/* Form fields skeleton */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-secondary rounded w-24 animate-pulse" />
              <div className="h-10 bg-secondary rounded animate-pulse" />
            </div>
          ))}

          {/* Button skeleton */}
          <div className="flex justify-end">
            <div className="h-10 bg-secondary rounded w-32 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Skeleton for channel list on the channels page.
 */
export function ChannelListSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-secondary rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-secondary rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-secondary rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-secondary rounded w-2/3 animate-pulse mt-2" />
                <div className="flex gap-4 mt-3">
                  <div className="h-4 bg-secondary rounded w-20 animate-pulse" />
                  <div className="h-5 bg-secondary rounded-full w-24 animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
