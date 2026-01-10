// Channel Types - mirroring API responses

export interface Channel {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  subscriberCount: number;
  videoCount: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelWithOwner extends Channel {
  owner: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateChannelInput {
  name: string;
  handle: string;
  description?: string;
}

export interface UpdateChannelInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}
