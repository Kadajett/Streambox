import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

const searchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  page: z.number().optional().default(1),
  sort: z.enum(['popular', 'recent', 'viewers']).optional().default('popular'),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

export const Route = createFileRoute('/streams/search')({
  validateSearch: zodSearchValidator(searchParamsSchema),
  component: StreamSearchPage,
});

function StreamSearchPage() {
  const { query, category, page, sort } = Route.useSearch();
  const navigate = Route.useNavigate();

  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Search Streams</h1>
        <p className="text-muted-foreground mt-2">
          Search params are in the URL - share this link to share your search!
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          type="text"
          placeholder="Search streams..."
          value={query ?? ''}
          onChange={(e) => updateSearch({ query: e.target.value || undefined })}
          className="flex-1 min-w-[200px]"
        />

        <Select
          value={category ?? 'all'}
          onValueChange={(value) => updateSearch({ category: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="art">Art</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) => updateSearch({ sort: value as typeof sort })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="viewers">Most Viewers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Current search: query="{query ?? ''}", category="{category ?? 'all'}", sort="{sort}",
            page={page}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => updateSearch({ page: Math.max(1, page - 1) })}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" onClick={() => updateSearch({ page: page + 1 })}>
          Next
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Example shareable links</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <Link
                to="/streams/search"
                search={{ query: 'fortnite', category: 'gaming', sort: 'viewers' }}
                className="text-primary hover:underline"
              >
                Gaming streams about Fortnite sorted by viewers
              </Link>
            </li>
            <li>
              <Link
                to="/streams/search"
                search={{ category: 'music', sort: 'recent', page: 2 }}
                className="text-primary hover:underline"
              >
                Recent music streams (page 2)
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
