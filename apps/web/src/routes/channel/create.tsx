import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Loader2, ArrowLeft, Tv2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateChannel, type CreateChannelInput } from '@/features/channels';
import { useAuth } from '@/features';

export const Route = createFileRoute('/channel/create')({
  component: CreateChannelPage,
});

function CreateChannelPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const createChannel = useCreateChannel();

  const [formData, setFormData] = useState<CreateChannelInput>({
    name: '',
    handle: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Tv2 className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to be signed in to create a channel.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="glow">
              <Link to="/auth/login">
                Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Channel name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Channel name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Channel name must be less than 50 characters';
    }

    if (!formData.handle.trim()) {
      newErrors.handle = 'Handle is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.handle)) {
      newErrors.handle = 'Handle can only contain letters, numbers, and underscores';
    } else if (formData.handle.length < 3) {
      newErrors.handle = 'Handle must be at least 3 characters';
    } else if (formData.handle.length > 30) {
      newErrors.handle = 'Handle must be less than 30 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const channel = await createChannel.mutateAsync(formData);
      // Navigate to studio upload page for the new channel
      navigate({
        to: '/channel/$handle/studio/upload',
        params: { handle: channel.handle },
      });
    } catch (error: any) {
      // Handle API errors (e.g., handle already taken)
      if (error?.message?.includes('handle')) {
        setErrors({ handle: 'This handle is already taken' });
      } else {
        setErrors({ submit: error?.message || 'Failed to create channel. Please try again.' });
      }
    }
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));

    // Auto-generate handle from name if handle is empty or was auto-generated
    if (!formData.handle || formData.handle === generateHandle(formData.name)) {
      setFormData((prev) => ({
        ...prev,
        name: value,
        handle: generateHandle(value),
      }));
    }
  };

  const generateHandle = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 30);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate({ to: '/account' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to account
        </Button>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative">
                <Tv2 className="h-10 w-10 text-primary" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <CardTitle className="text-2xl">Create your channel</CardTitle>
            <CardDescription className="text-base">
              Your channel is where you'll share your videos with the world. Choose a memorable name
              and handle.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Channel Name */}
              <div className="space-y-2">
                <Label htmlFor="channelName" className="text-base">
                  Channel name
                </Label>
                <Input
                  id="channelName"
                  placeholder="My Awesome Channel"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  aria-invalid={!!errors.name}
                  className="h-11"
                  autoFocus
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                <p className="text-xs text-muted-foreground">
                  This is the display name that viewers will see
                </p>
              </div>

              {/* Handle */}
              <div className="space-y-2">
                <Label htmlFor="channelHandle" className="text-base">
                  Handle
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="channelHandle"
                    placeholder="myawesomechannel"
                    className="rounded-l-none h-11"
                    value={formData.handle}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, handle: e.target.value.toLowerCase() }));
                      if (errors.handle) setErrors((prev) => ({ ...prev, handle: '' }));
                    }}
                    aria-invalid={!!errors.handle}
                  />
                </div>
                {errors.handle ? (
                  <p className="text-sm text-destructive">{errors.handle}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    streambox.tv/channel/@{formData.handle || 'yourhandle'}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="channelDescription" className="text-base">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="channelDescription"
                  placeholder="Tell viewers what your channel is about..."
                  value={formData.description ?? ''}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }));
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                {errors.description ? (
                  <p className="text-sm text-destructive">{errors.description}</p>
                ) : (
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.description?.length ?? 0}/500
                  </p>
                )}
              </div>

              {/* Submit error */}
              {errors.submit && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  className="w-full"
                  disabled={createChannel.isPending}
                >
                  {createChannel.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating channel...
                    </>
                  ) : (
                    'Create channel'
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  After creating your channel, you'll be taken to upload your first video
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
