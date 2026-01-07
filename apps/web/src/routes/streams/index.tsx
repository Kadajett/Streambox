import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/streams/')({
  component: StreamsListPage,
});

const mockStreams = [
  { id: 'abc123', title: 'Gaming Stream', category: 'Gaming' },
  { id: 'def456', title: 'Music Production', category: 'Music' },
  { id: 'ghi789', title: 'Coding Session', category: 'Technology' },
];

function StreamsListPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <h1 className="text-4xl font-bold">Live Streams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStreams.map((stream) => (
          <Link
            key={stream.id}
            to="/streams/$streamId"
            params={{ streamId: stream.id }}
            className="block"
          >
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary">
              <CardHeader>
                <CardTitle>{stream.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{stream.category}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
