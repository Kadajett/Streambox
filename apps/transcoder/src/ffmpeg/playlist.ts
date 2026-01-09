import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { QualityPreset } from '@streambox/shared-types';

export const buildPlaylistContent = (qualities: QualityPreset[]): string => {
  const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];

  for (const quality of qualities) {
    const bandwidth = Number.parseInt(quality.bitrate) * 1000;
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.width}x${quality.height}`
    );
    lines.push(`${quality.name}/playlist.m3u8`);
  }

  return lines.join('\n');
};

export const generateMasterPlaylist = async (
  outputDir: string,
  qualities: QualityPreset[]
): Promise<void> => {
  const content = buildPlaylistContent(qualities);
  const playlistPath = path.join(outputDir, 'master.m3u8');
  await fs.writeFile(playlistPath, content);
};
