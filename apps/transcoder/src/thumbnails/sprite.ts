import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { SpriteSheetOptions, SpriteSheetResult } from '@streambox/shared-types';
import { probeVideo } from '../ffmpeg/probe.js';
import { generateVTT } from './vtt.js';

export const calculateSpriteInterval = (
  duration: number,
  columns: number,
  rows: number,
  minInterval: number
): number => {
  const totalFrames = columns * rows;
  return Math.max(minInterval, duration / totalFrames);
};

export const calculateThumbDimensions = (
  sourceWidth: number,
  sourceHeight: number,
  thumbWidth: number
): { width: number; height: number } => {
  const aspectRatio = sourceHeight / sourceWidth;
  return {
    width: thumbWidth,
    height: Math.round(thumbWidth * aspectRatio),
  };
};

export const generateSpriteSheet = async (
  inputPath: string,
  outputPath: string,
  options: Partial<SpriteSheetOptions> = {}
): Promise<SpriteSheetResult> => {
  const { columns = 10, rows = 10, thumbWidth = 160, interval = 5 } = options;

  const metadata = await probeVideo(inputPath);
  const actualInterval = calculateSpriteInterval(metadata.duration, columns, rows, interval);
  const { width, height: thumbHeight } = calculateThumbDimensions(
    metadata.width,
    metadata.height,
    thumbWidth
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-vf fps=1/${actualInterval},scale=${width}:${thumbHeight},tile=${columns}x${rows}`,
        '-frames:v 1',
        '-q:v 5',
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Sprite sheet generation failed: ${err.message}`)))
      .run();
  });

  const vttContent = generateVTT(
    metadata.duration,
    actualInterval,
    columns,
    rows,
    width,
    thumbHeight,
    path.basename(outputPath)
  );

  return {
    vttContent,
    spriteWidth: width * columns,
    spriteHeight: thumbHeight * rows,
  };
};
