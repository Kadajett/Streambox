import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// TODO: Fetch categories from API
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Music' },
  { id: 'tech', label: 'Tech' },
  { id: 'vlogs', label: 'Vlogs' },
  { id: 'education', label: 'Education' },
  { id: 'sports', label: 'Sports' },
  { id: 'news', label: 'News' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'travel', label: 'Travel' },
  { id: 'fitness', label: 'Fitness' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

interface CategoryPillsProps {
  selected?: CategoryId;
  onSelect?: (category: CategoryId) => void;
  className?: string;
}

/**
 * Horizontally scrollable category filter pills for the home page.
 * Features: smooth scroll buttons, gradient fade edges, keyboard navigation.
 */
export function CategoryPills({
  selected = 'all',
  onSelect,
  className,
}: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = direction === 'left' ? -200 : 200;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: CategoryId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(categoryId);
    }
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Left Scroll Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('left')}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border/50 transition-opacity',
          showLeftButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Pills Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-8 py-2"
        role="tablist"
        aria-label="Video categories"
      >
        {CATEGORIES.map((category) => {
          const isSelected = selected === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect?.(category.id)}
              onKeyDown={(e) => handleKeyDown(e, category.id)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/5 text-muted-foreground border border-border/50 hover:bg-white/10 hover:text-foreground'
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('right')}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border/50 transition-opacity',
          showRightButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-label="Scroll categories right"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
