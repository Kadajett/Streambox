import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">Welcome to StreamBox</CardTitle>
          <CardDescription className="text-lg">
            Your streaming platform for the modern web.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            Discover live streams, connect with creators, and enjoy content from around the world.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
