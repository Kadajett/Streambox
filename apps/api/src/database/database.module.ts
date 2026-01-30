import { Global, Module } from '@nestjs/common';
import {
  UserRepository,
  ChannelRepository,
  VideoRepository,
  TranscodeJobRepository,
} from './repositories';

/**
 * DatabaseModule - Provides repository pattern for database access
 *
 * This module encapsulates all Prisma database operations behind repository classes,
 * enabling easier testing through dependency injection and cleaner service code.
 *
 * Marked as @Global() so repositories are available throughout the app without
 * needing to import DatabaseModule in every feature module.
 */
@Global()
@Module({
  providers: [UserRepository, ChannelRepository, VideoRepository, TranscodeJobRepository],
  exports: [UserRepository, ChannelRepository, VideoRepository, TranscodeJobRepository],
})
export class DatabaseModule {}
