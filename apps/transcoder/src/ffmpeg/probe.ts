import ffmpeg from 'fluent-ffmpeg';
import type { VideoMetadata } from '@streambox/shared-types';

const parseFrameRate = (frameRate: string): number | undefined => {
  if (!frameRate) return undefined;
  const parts = frameRate.split('/');
  if (parts.length === 2) {
    const numerator = Number.parseFloat(parts[0]);
    const denominator = Number.parseFloat(parts[1]);
    if (denominator === 0) return undefined;
    return numerator / denominator;
  }
  const parsed = Number.parseFloat(frameRate);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const probeVideo = (inputPath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to probe video: ${err.message}`));
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        width: videoStream.width || 1920,
        height: videoStream.height || 1080,
        duration: metadata.format.duration || 0,
        codec: videoStream.codec_name,
        bitrate: metadata.format.bit_rate ? Number(metadata.format.bit_rate) : undefined,
        fps: videoStream.r_frame_rate ? parseFrameRate(videoStream.r_frame_rate) : undefined,
      });
    });
  });
};
