import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FeedService } from './feed.service';
import { CurrentUser, type CurrentUserPayload } from 'src/auth';
import { FeedQueryDto } from './dto/feed-query.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 60 seconds for feed
  async findAll(@Query() query: FeedQueryDto, @CurrentUser() user?: CurrentUserPayload) {
    return this.feedService.getFeed(query, user?.id);
  }
}
