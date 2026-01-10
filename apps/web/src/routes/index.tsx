import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { usePublicFeed } from '@/features/videos';
import { FeedVideoGrid, CategoryPills } from './-components/home';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const [category, setCategory] = useState<string>('all');

  const {
    data: feed,
    isLoading,
    error,
  } = usePublicFeed({
    pageSize: 20,
    category: category === 'all' ? undefined : category,
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Category Filter */}
      <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <CategoryPills
          selected={category as 'all'}
          onSelect={(cat) => setCategory(cat)}
          className="py-2"
        />
      </div>

      {/* Video Feed */}
      {error ? (
        <div className="text-center py-16">
          <p className="text-destructive">Failed to load videos</p>
          <p className="text-muted-foreground text-sm mt-2">
            Please try again later
          </p>
        </div>
      ) : (
        <FeedVideoGrid videos={feed?.data ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
