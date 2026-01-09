import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { QualityPreset, TranscodeProgress, EncodingOptions } from '@streambox/shared-types';
import { probeVideo } from './probe.js';
import { generateMasterPlaylist } from './playlist.js';

export type ProgressCallback = (progress: TranscodeProgress) => void;

export const transcodeQuality = async (
  inputPath: string,
  outputDir: string,
  quality: QualityPreset,
  encodingOptions: EncodingOptions,
  duration: number,
  onProgress?: ProgressCallback
): Promise<void> => {
  const qualityDir = path.join(outputDir, quality.name);
  await fs.mkdir(qualityDir, { recursive: true });

  const outputPath = path.join(qualityDir, 'playlist.m3u8');

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .videoCodec(encodingOptions.videoEncoder)
      .audioCodec(encodingOptions.audioEncoder)
      .outputOptions([
        `-vf scale=${quality.width}:${quality.height}`,
        `-b:v ${quality.bitrate}`,
        `-maxrate ${quality.bitrate}`,
        `-bufsize ${Number.parseInt(quality.bitrate) * 2}k`,
        `-preset ${encodingOptions.preset}`,
        `-b:a ${quality.audioBitrate || '128k'}`,
        '-hls_time 6',
        '-hls_list_size 0',
        '-hls_segment_filename',
        path.join(qualityDir, 'segment_%03d.ts'),
        '-f hls',
      ])
      .output(outputPath);

    if (onProgress) {
      command.on('progress', (p) => {
        const percent =
          duration > 0 ? (p.timemark ? parseTimemark(p.timemark) / duration : 0) * 100 : 0;
        onProgress({
          percent: Math.min(100, Math.max(0, percent)),
          currentQuality: quality.name as TranscodeProgress['currentQuality'],
          fps: p.currentFps,
          speed: p.currentKbps ? p.currentKbps / Number.parseInt(quality.bitrate) : undefined,
        });
      });
    }

    command
      .on('end', () => resolve())
      .on('error', (err) =>
        reject(new Error(`Transcode failed for ${quality.name}: ${err.message}`))
      )
      .run();
  });
};

export const transcodeToHLS = async (
  inputPath: string,
  outputDir: string,
  qualities: QualityPreset[],
  encodingOptions: EncodingOptions,
  onProgress?: ProgressCallback
): Promise<void> => {
  await fs.mkdir(outputDir, { recursive: true });

  const metadata = await probeVideo(inputPath);
  const totalQualities = qualities.length;

  for (let i = 0; i < qualities.length; i++) {
    const quality = qualities[i];

    // Skip qualities higher than source resolution
    if (quality.height > metadata.height) {
      continue;
    }

    await transcodeQuality(
      inputPath,
      outputDir,
      quality,
      encodingOptions,
      metadata.duration,
      onProgress
        ? (p) => {
            const basePercent = (i / totalQualities) * 100;
            const qualityPercent = p.percent / totalQualities;
            onProgress({
              ...p,
              percent: basePercent + qualityPercent,
            });
          }
        : undefined
    );
  }

  // Generate master playlist with only the qualities we transcoded
  const transcodedQualities = qualities.filter((q) => q.height <= metadata.height);
  await generateMasterPlaylist(outputDir, transcodedQualities);
};

const parseTimemark = (timemark: string): number => {
  const parts = timemark.split(':');
  if (parts.length !== 3) return 0;
  const [hours, minutes, seconds] = parts.map(Number.parseFloat);
  return hours * 3600 + minutes * 60 + seconds;
};
