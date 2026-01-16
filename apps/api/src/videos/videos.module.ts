import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { BullModule } from '@nestjs/bullmq';
import { TRANSCODE_QUEUE } from './videos.constants';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSCODE_QUEUE,
    }),
    StorageModule
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
