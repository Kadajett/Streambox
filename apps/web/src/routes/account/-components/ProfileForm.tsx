import { useState } from 'react';
import { Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/features/auth';

interface ProfileFormProps {
  user: User;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ProfileFormData {
  displayName: string;
  bio: string;
}

export function ProfileForm({ user, onSubmit, isSubmitting = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: user.displayName || '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName || user.username} />
            <AvatarFallback className="text-lg">
              {getInitials(user.displayName || user.username)}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change avatar"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
        </div>
        <div>
          <h3 className="font-medium">{user.displayName || user.username}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Your email cannot be changed
        </p>
      </div>

      {/* Username (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={user.username}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Your username cannot be changed
        </p>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Your display name"
          value={formData.displayName}
          onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground">
          This is the name that will be displayed on your profile
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button type="submit" variant="glow" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </form>
  );
}
