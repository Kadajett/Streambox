import { Button } from '@/components/ui/button';
import { useChannel } from '@/features';
import { useUploadChannelVideo } from '@/features/videos/api/mutations';
import { createFileRoute, Link } from '@tanstack/react-router';
import { use, useEffect, useState } from 'react';

export const Route = createFileRoute('/channel/$handle/studio/upload')({
  component: RouteComponent,
});

// Upload a video to the users channel. Show upload form, transcoding process, etc.

function RouteComponent() {
  const { handle } = Route.useParams();
  const uploadVideoMutation = useUploadChannelVideo();
  const { data } = useChannel(handle);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    } else {
      setVideoPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up the object URL when the component unmounts or videoFile changes
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  // handle video upload success, then call video/{id}/transcoding-status
  useEffect(() => {
    if (uploadVideoMutation.isSuccess) {
      const videoId = uploadVideoMutation.data.id;
      console.log('Video uploaded successfully with ID:', videoId);
      // You can now check the transcoding status here if needed
    }
  }, [uploadVideoMutation.isSuccess, uploadVideoMutation.data]);

  const handleVideoUpload = ({
    channelId,
    title,
    description,
    videoFile,
  }: {
    channelId: string;
    title: string;
    description: string;
    videoFile: File;
  }) => {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('channelId', data?.id || '');

    console.log('handleVideoUpload called with:', channelId, title, description, videoFile);
    return uploadVideoMutation.mutateAsync({
      channelId,
      formData,
    });
  };

  return (
    <>
      <Link to="/channel/$handle/view" params={{ handle }}>
        <Button> Back to {handle} channel home</Button>
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Upload Video to {handle} Channel</h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const title = formData.get('title') as string;
          const description = formData.get('description') as string;
          const videoFile = formData.get('videoFile') as File;

          if (!videoFile || !title) {
            alert('Please provide a video file and title.');
            return;
          }

          console.log('Uploading video to channel:', videoFile, title, description, videoFile);

          await handleVideoUpload({
            channelId: handle,
            title,
            description,
            videoFile,
          });

          alert('Video uploaded successfully!');
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Video Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Video Description
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="videoFile" className="block font-medium mb-1">
            Select Video File
          </label>
          <input
            onChange={handleFileChange}
            type="file"
            id="videoFile"
            name="videoFile"
            accept="video/*"
            required
          />
        </div>
        {videoPreviewUrl && (
          <div>
            <h2 className="font-medium mb-1">Video Preview:</h2>
            <video
              src={videoPreviewUrl}
              controls
              className="w-full max-w-lg border border-gray-300 rounded"
            />
          </div>
        )}

        <Button type="submit" disabled={uploadVideoMutation.isPending}>
          {uploadVideoMutation.isPending ? 'Uploading...' : 'Upload Video'}
        </Button>
      </form>
    </>
  );
}
