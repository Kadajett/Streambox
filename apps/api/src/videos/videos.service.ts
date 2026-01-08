import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TRANSCODE_QUEUE } from './videos.constants';

@Injectable()
export class VideosService {
  constructor(@InjectQueue(TRANSCODE_QUEUE) private transcodeQueue: Queue) {}
}
