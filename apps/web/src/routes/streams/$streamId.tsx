import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/streams/$streamId')({
  component: StreamDetailPage,
});

function StreamDetailPage() {
  const { streamId } = Route.useParams();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/streams" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to streams
        </Link>
      </Button>

      <h1 className="text-4xl font-bold">Stream: {streamId}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Stream Player</CardTitle>
          <CardDescription>Stream ID: {streamId}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 bg-muted rounded-md">
          <p className="text-muted-foreground">Stream player placeholder</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stream Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>
            This is a dynamic route. The stream ID{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{streamId}</code> is
            extracted from the URL.
          </p>
          <p>This URL can be shared to link directly to this stream.</p>
        </CardContent>
      </Card>
    </div>
  );
}
