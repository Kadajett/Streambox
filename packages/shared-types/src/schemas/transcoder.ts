import { z } from 'zod';

// ============================================
// Transcoder Schemas
// ============================================
// Types for the video transcoding service (FFmpeg, HLS, thumbnails)

// ============================================
// Video Metadata (from ffprobe)
// ============================================

export const VideoMetadataSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  duration: z.number().nonnegative(), // seconds (can be fractional)
  codec: z.string().optional(),
  bitrate: z.number().int().nonnegative().optional(), // bits per second
  fps: z.number().nonnegative().optional(),
});
export type VideoMetadata = z.infer<typeof VideoMetadataSchema>;

// ============================================
// HLS Quality Presets
// ============================================

export const QualityPresetNameSchema = z.enum(['360p', '480p', '720p', '1080p', '1440p', '4k']);
export type QualityPresetName = z.infer<typeof QualityPresetNameSchema>;

export const QualityPresetSchema = z.object({
  name: QualityPresetNameSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bitrate: z.string(), // e.g., '800k', '2500k', '5000k'
  audioBitrate: z.string().optional(), // e.g., '128k'
});
export type QualityPreset = z.infer<typeof QualityPresetSchema>;

// Default quality presets
export const DEFAULT_QUALITY_PRESETS: QualityPreset[] = [
  { name: '360p', width: 640, height: 360, bitrate: '800k', audioBitrate: '96k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k', audioBitrate: '128k' },
  { name: '1080p', width: 1920, height: 1080, bitrate: '5000k', audioBitrate: '192k' },
];

// ============================================
// Transcode Progress
// ============================================

export const TranscodeProgressSchema = z.object({
  percent: z.number().min(0).max(100),
  currentQuality: QualityPresetNameSchema.optional(),
  fps: z.number().nonnegative().optional(),
  speed: z.number().nonnegative().optional(), // e.g., 2.5x realtime
  eta: z.number().nonnegative().optional(), // seconds remaining
});
export type TranscodeProgress = z.infer<typeof TranscodeProgressSchema>;

// ============================================
// Transcode Job Data (BullMQ payload)
// ============================================

export const TranscodeJobDataSchema = z.object({
  videoId: z.string().cuid(),
  inputPath: z.string().min(1),
  outputDir: z.string().min(1),
});
export type TranscodeJobData = z.infer<typeof TranscodeJobDataSchema>;

// ============================================
// Thumbnail Options
// ============================================

export const ThumbnailOptionsSchema = z.object({
  width: z.number().int().positive().default(640),
  quality: z.number().int().min(1).max(31).default(5), // JPEG quality (1-31, lower is better)
});
export type ThumbnailOptions = z.infer<typeof ThumbnailOptionsSchema>;

// ============================================
// Sprite Sheet Options
// ============================================

export const SpriteSheetOptionsSchema = z.object({
  columns: z.number().int().positive().default(10),
  rows: z.number().int().positive().default(10),
  thumbWidth: z.number().int().positive().default(160),
  interval: z.number().positive().default(5), // seconds between frames
});
export type SpriteSheetOptions = z.infer<typeof SpriteSheetOptionsSchema>;

// ============================================
// Sprite Sheet Result
// ============================================

export const SpriteSheetResultSchema = z.object({
  vttContent: z.string(),
  spriteWidth: z.number().int().positive(),
  spriteHeight: z.number().int().positive(),
});
export type SpriteSheetResult = z.infer<typeof SpriteSheetResultSchema>;

// ============================================
// Encoding Options
// ============================================

export const VideoEncoderSchema = z.enum([
  'libx264', // CPU H.264
  'h264_nvenc', // NVIDIA GPU H.264
  'h264_vaapi', // Intel/AMD VAAPI H.264
  'h264_qsv', // Intel QuickSync H.264
  'libx265', // CPU H.265/HEVC
  'hevc_nvenc', // NVIDIA GPU H.265
]);
export type VideoEncoder = z.infer<typeof VideoEncoderSchema>;

export const AudioEncoderSchema = z.enum(['aac', 'libfdk_aac', 'libopus']);
export type AudioEncoder = z.infer<typeof AudioEncoderSchema>;

export const EncodingOptionsSchema = z.object({
  videoEncoder: VideoEncoderSchema.default('libx264'),
  audioEncoder: AudioEncoderSchema.default('aac'),
  preset: z
    .enum([
      'ultrafast',
      'superfast',
      'veryfast',
      'faster',
      'fast',
      'medium',
      'slow',
      'slower',
      'veryslow',
    ])
    .default('medium'),
  crf: z.number().int().min(0).max(51).optional(), // Constant Rate Factor (lower = better quality)
  maxrate: z.string().optional(), // e.g., '5000k' for VBV buffering
  bufsize: z.string().optional(), // e.g., '10000k' for VBV buffer
});
export type EncodingOptions = z.infer<typeof EncodingOptionsSchema>;

// ============================================
// Transcoder Configuration
// ============================================

export const TranscoderConfigSchema = z.object({
  useGpu: z.boolean().default(false),
  concurrency: z.number().int().positive().default(1),
  qualities: z.array(QualityPresetSchema).default(DEFAULT_QUALITY_PRESETS),
  hlsSegmentDuration: z.number().int().positive().default(6), // seconds per HLS segment
  hlsPlaylistType: z.enum(['vod', 'event']).default('vod'),
});
export type TranscoderConfig = z.infer<typeof TranscoderConfigSchema>;

// ============================================
// Redis/Queue Configuration
// ============================================

export const RedisConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().int().positive().default(6379),
  password: z.string().optional(),
  db: z.number().int().nonnegative().default(0),
});
export type RedisConfig = z.infer<typeof RedisConfigSchema>;

export const QueueConfigSchema = z.object({
  name: z.string().default('transcode-queue'),
  defaultJobOptions: z
    .object({
      attempts: z.number().int().positive().default(3),
      backoff: z
        .object({
          type: z.enum(['fixed', 'exponential']).default('exponential'),
          delay: z.number().int().positive().default(5000), // ms
        })
        .optional(),
      removeOnComplete: z.boolean().default(true),
      removeOnFail: z.boolean().default(false),
    })
    .optional(),
});
export type QueueConfig = z.infer<typeof QueueConfigSchema>;

// ============================================
// Error Constants
// ============================================

export const TRANSCODER_ERRORS = {
  FFMPEG_NOT_FOUND: 'FFmpeg not found on system',
  FFPROBE_FAILED: 'Failed to probe video metadata',
  TRANSCODE_FAILED: 'Video transcoding failed',
  INVALID_INPUT: 'Invalid input file',
  OUTPUT_DIR_ERROR: 'Failed to create output directory',
  THUMBNAIL_FAILED: 'Thumbnail generation failed',
  SPRITE_FAILED: 'Sprite sheet generation failed',
  GPU_NOT_AVAILABLE: 'GPU encoding requested but not available',
  REDIS_CONNECTION_FAILED: 'Failed to connect to Redis',
  JOB_NOT_FOUND: 'Transcode job not found',
} as const;

export type TranscoderErrorCode = keyof typeof TRANSCODER_ERRORS;
export type TranscoderErrorMessage = (typeof TRANSCODER_ERRORS)[TranscoderErrorCode];
