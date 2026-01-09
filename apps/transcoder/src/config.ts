import 'dotenv/config';
import { DEFAULT_QUALITY_PRESETS, type QualityPreset } from '@streambox/shared-types';

export const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  transcoding: {
    useGpu: process.env.USE_GPU === 'true',
    concurrency: Number.parseInt(process.env.TRANSCODE_CONCURRENCY || '1', 10),
    qualities: DEFAULT_QUALITY_PRESETS as QualityPreset[],
  },
  queue: {
    name: 'transcode',
  },
} as const;
