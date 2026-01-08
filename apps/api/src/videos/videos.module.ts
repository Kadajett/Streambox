import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { BullModule } from '@nestjs/bullmq';
import { TRANSCODE_QUEUE } from './videos.constants';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSCODE_QUEUE,
    }),
  ],
  controllers: [VideosController],
  providers: [VideosService, StorageService],
  exports: [VideosService, StorageService],
})
export class VideosModule {}
