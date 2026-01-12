import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly baseDir: string;
  private readonly rawDir: string;
  private readonly hlsDir: string;
  private readonly thumbnailsDir: string;

  constructor(private configService: ConfigService) {
    this.baseDir = this.configService.get<string>('STORAGE_PATH') || '';
    this.rawDir = path.join(this.baseDir, 'raw');
    this.hlsDir = path.join(this.baseDir, 'hls');
    this.thumbnailsDir = path.join(this.baseDir, 'thumbnails');
  }

  async onModuleInit() {
    await this.ensureDirectories();
  }

  private async ensureDirectories() {
    const dirs = [this.rawDir, this.hlsDir, this.thumbnailsDir];
    for (const dir of dirs) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  // Path for raw uploaded video
  getRawPath(videoId: string, filename: string): string {
    return path.join(this.rawDir, filename);
  }

  // Directory for HLS output
  getHlsDir(videoId: string): string {
    return path.join(this.hlsDir, videoId);
  }

  // Path for thumbnail
  getThumbnailPath(videoId: string): string {
    return path.join(this.thumbnailsDir, `${videoId}.jpg`);
  }

  // Path for sprite sheet
  getSpritePath(videoId: string): string {
    return path.join(this.thumbnailsDir, `${videoId}-sprite.jpg`);
  }

  // Get multer destination for uploads
  getUploadDestination(): string {
    return this.rawDir;
  }

  // Clean up files for a video
  async deleteVideoFiles(videoId: string, rawFileName?: string): Promise<void> {
    const hlsDir = this.getHlsDir(videoId);
    const thumbnail = this.getThumbnailPath(videoId);
    const sprite = this.getSpritePath(videoId);

    // Delete raw file(s) - find any files matching videoId prefix
    try {
      if (rawFileName) {
        await fs.promises.unlink(path.join(this.rawDir, rawFileName)).catch(() => {});
      }
    } catch {
      // Directory might not exist
    }

    // Delete HLS directory
    await fs.promises.rm(hlsDir, { recursive: true, force: true });

    // Delete thumbnails
    await fs.promises.unlink(thumbnail).catch(() => {});
    await fs.promises.unlink(sprite).catch(() => {});
  }
}
