import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">About StreamBox</CardTitle>
          <CardDescription className="text-lg">
            A next-generation streaming platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            StreamBox is built with modern web technologies to provide the best streaming experience
            possible.
          </p>
          <p>Powered by React, TanStack Router, and Tailwind CSS.</p>
        </CardContent>
      </Card>
    </div>
  );
}
