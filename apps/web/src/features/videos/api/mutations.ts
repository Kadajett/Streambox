import { apiClient } from '@/lib/api';
import type { VideoDetail } from '@streambox/shared-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadChannelVideo } from './fetchers';
import { videoKeys } from './keys';

// ============================================
// Video Mutations

// ============================================

export function useUploadChannelVideo() {
  const queryClient = useQueryClient();

  type UploadChannelVideoParams = {
    channelId: string;
    formData: FormData;
  };
  return useMutation({
    mutationFn: ({ channelId, formData }: UploadChannelVideoParams) => {
      console.log('Mutation function called with:', channelId, formData);
      return uploadChannelVideo(channelId, formData);
    },
    onSuccess: (data) => {
      // Invalidate any relevant queries, e.g., channel videos or user uploads
      queryClient.invalidateQueries({
        queryKey: videoKeys.channelVideosList(data.channelId),
      });
    },
  });
}

//  const result = await apiClient.post<{ data: VideoDetail } | VideoDetail>(
//   `/channels/${channelId}/videos`,
//   { title, description, file: formData },
//   {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   }
// );

// // Handle both wrapped and unwrapped responses
// return 'data' in result ? result.data : result;
