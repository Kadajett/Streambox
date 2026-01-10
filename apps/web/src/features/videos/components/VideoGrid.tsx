import type { VideoWithChannel } from '@streambox/shared-types';
import VideoCard from './VideoCard';

const VideoGrid = ({ videos }: { videos: VideoWithChannel[] }) => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video) => (
          <VideoCard key={video.id} videoId={video.id} />
        ))}
      </div>
    </section>
  );
};

export default VideoGrid;
