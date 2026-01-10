import type { Job } from 'bullmq';
import type { PrismaClient } from '@streambox/database';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import type {
  TranscodeJobData,
  QualityPreset,
  EncodingOptions,
  VideoMetadata,
  SpriteSheetResult,
} from '@streambox/shared-types';
import type { ProgressCallback } from '../ffmpeg/index.js';

export interface ProcessorDeps {
  prisma: PrismaClient;
  probeVideo: (inputPath: string) => Promise<VideoMetadata>;
  transcodeToHLS: (
    inputPath: string,
    outputDir: string,
    qualities: QualityPreset[],
    encodingOptions: EncodingOptions,
    onProgress?: ProgressCallback
  ) => Promise<void>;
  generateThumbnail: (
    inputPath: string,
    outputPath: string,
    position: number,
    options: { width: number; quality: number }
  ) => Promise<void>;
  generateSpriteSheet: (
    inputPath: string,
    outputPath: string,
    options: { columns: number; rows: number; thumbWidth: number; interval: number }
  ) => Promise<SpriteSheetResult>;
  updateTranscodeJob: (
    prisma: PrismaClient,
    videoId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress: number,
    error?: string
  ) => Promise<void>;
  config: {
    useGpu: boolean;
    qualities: QualityPreset[];
  };
}

export const createJobProcessor = (deps: ProcessorDeps) => {
  const {
    prisma,
    probeVideo,
    transcodeToHLS,
    generateThumbnail,
    generateSpriteSheet,
    updateTranscodeJob,
    config,
  } = deps;

  return async (job: Job<TranscodeJobData>): Promise<void> => {
    const { videoId, inputPath, outputDir } = job.data;

    console.log(`Processing video ${videoId}`);
    console.log(`  Input: ${inputPath}`);
    console.log(`  Output: ${outputDir}`);

    try {
      await updateTranscodeJob(prisma, videoId, 'processing', 0);

      // Step 1: Probe video metadata
      console.log('Probing video...');
      const metadata = await probeVideo(inputPath);
      console.log(
        `  Duration: ${metadata.duration}s, Resolution: ${metadata.width}x${metadata.height}`
      );

      // Step 2: Transcode to HLS (0-80%)
      console.log('Transcoding to HLS...');
      const encodingOptions: EncodingOptions = {
        videoEncoder: config.useGpu ? 'h264_nvenc' : 'libx264',
        audioEncoder: 'aac',
        preset: config.useGpu ? 'fast' : 'medium',
      };

      await transcodeToHLS(
        inputPath,
        outputDir,
        config.qualities,
        encodingOptions,
        async (progress) => {
          const transcodeProgress = Math.round(progress.percent * 0.8);
          await updateTranscodeJob(prisma, videoId, 'processing', transcodeProgress);
          await job.updateProgress(transcodeProgress);
          console.log(`  Progress: ${transcodeProgress}% (${progress.currentQuality})`);
        }
      );

      // Step 3: Generate thumbnail (85%)
      console.log('Generating thumbnail...');
      const thumbnailDir = path.join(path.dirname(outputDir), 'thumbnails');
      const thumbnailPath = path.join(thumbnailDir, `${videoId}.jpg`);
      await generateThumbnail(inputPath, thumbnailPath, 0.25, { width: 640, quality: 5 });
      await updateTranscodeJob(prisma, videoId, 'processing', 85);
      await job.updateProgress(85);

      // Step 4: Generate sprite sheet (95%)
      console.log('Generating sprite sheet...');
      const spritePath = path.join(thumbnailDir, `${videoId}-sprite.jpg`);
      const spriteResult = await generateSpriteSheet(inputPath, spritePath, {
        columns: 10,
        rows: 10,
        thumbWidth: 160,
        interval: 5,
      });

      const vttPath = path.join(thumbnailDir, `${videoId}-sprite.vtt`);
      await fs.writeFile(vttPath, spriteResult.vttContent);

      await updateTranscodeJob(prisma, videoId, 'processing', 95);
      await job.updateProgress(95);

      // Step 5: Update video record
      console.log('Updating video record...');
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'ready',
          duration: Math.round(metadata.duration),
          thumbnailUrl: `/thumbnails/${videoId}.jpg`,
          hlsPath: `/hls/${videoId}/master.m3u8`,
          spriteUrl: `/thumbnails/${videoId}-sprite.jpg`,
          vttPath: `/thumbnails/${videoId}-sprite.vtt`,
        },
      });

      await updateTranscodeJob(prisma, videoId, 'completed', 100);
      await job.updateProgress(100);

      console.log(`Video ${videoId} processing completed!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to process video ${videoId}:`, errorMessage);

      await updateTranscodeJob(prisma, videoId, 'failed', 0, errorMessage);
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'failed' },
      });

      throw error;
    }
  };
};
