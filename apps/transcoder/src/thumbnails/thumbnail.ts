import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { ThumbnailOptions } from '@streambox/shared-types';
import { probeVideo } from '../ffmpeg/probe.js';

export const calculateTimestamp = (duration: number, position: number): number => {
  return duration * Math.max(0, Math.min(1, position));
};

export const generateThumbnail = async (
  inputPath: string,
  outputPath: string,
  position = 0.25,
  options: Partial<ThumbnailOptions> = {}
): Promise<void> => {
  const { width = 640, quality = 5 } = options;

  const metadata = await probeVideo(inputPath);
  const timestamp = calculateTimestamp(metadata.duration, position);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(timestamp)
      .frames(1)
      .outputOptions([`-vf scale=${width}:-1`, `-q:v ${quality}`])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Thumbnail generation failed: ${err.message}`)))
      .run();
  });
};
