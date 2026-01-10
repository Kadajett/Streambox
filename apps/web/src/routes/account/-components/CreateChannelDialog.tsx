import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CreateChannelInput } from '@/features/channels';

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateChannelInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateChannelDialogProps) {
  const [formData, setFormData] = useState<CreateChannelInput>({
    name: '',
    handle: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Channel name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Channel name must be at least 3 characters';
    }

    if (!formData.handle.trim()) {
      newErrors.handle = 'Handle is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.handle)) {
      newErrors.handle = 'Handle can only contain letters, numbers, and underscores';
    } else if (formData.handle.length < 3) {
      newErrors.handle = 'Handle must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit(formData);
    setFormData({ name: '', handle: '', description: '' });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ name: '', handle: '', description: '' });
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new channel</DialogTitle>
            <DialogDescription>
              Channels let you organize and share your videos with the world.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Channel Name */}
            <div className="space-y-2">
              <Label htmlFor="channelName">Channel name</Label>
              <Input
                id="channelName"
                placeholder="My Awesome Channel"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Handle */}
            <div className="space-y-2">
              <Label htmlFor="channelHandle">Handle</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="channelHandle"
                  placeholder="myawesomechannel"
                  className="rounded-l-none"
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
                  This will be your channel's unique URL
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="channelDescription">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="channelDescription"
                placeholder="What's your channel about?"
                value={formData.description ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="glow" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create channel'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
