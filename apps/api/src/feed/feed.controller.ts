import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CurrentUser, type CurrentUserPayload } from 'src/auth';
import { FeedQueryDto } from './dto/feed-query.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Query() query: FeedQueryDto, @CurrentUser() user?: CurrentUserPayload) {
    return this.feedService.getFeed(query, user?.id);
  }
}
