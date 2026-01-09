import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import type { TranscodeJobData } from '@streambox/shared-types';
import { config } from './config.js';
import { probeVideo, transcodeToHLS } from './ffmpeg/index.js';
import { generateThumbnail, generateSpriteSheet } from './thumbnails/index.js';
import { createJobProcessor, updateTranscodeJob } from './jobs/index.js';

export const createWorker = () => {
  const prisma = new PrismaClient();

  const processJob = createJobProcessor({
    prisma,
    probeVideo,
    transcodeToHLS,
    generateThumbnail,
    generateSpriteSheet,
    updateTranscodeJob,
    config: {
      useGpu: config.transcoding.useGpu,
      qualities: config.transcoding.qualities,
    },
  });

  const worker = new Worker<TranscodeJobData>(
    config.queue.name,
    processJob,
    {
      connection: config.redis,
      concurrency: config.transcoding.concurrency,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed for video ${job.data.videoId}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  const start = () => {
    console.log('Transcode worker started');
    console.log(`  Queue: ${config.queue.name}`);
    console.log(`  Concurrency: ${config.transcoding.concurrency}`);
    console.log(`  GPU: ${config.transcoding.useGpu ? 'enabled' : 'disabled'}`);
  };

  const stop = async () => {
    console.log('Stopping transcode worker...');
    await worker.close();
    await prisma.$disconnect();
    console.log('Transcode worker stopped');
  };

  return { start, stop };
};
