import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/stats
   * Get admin dashboard statistics
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  /**
   * GET /admin/moderation-queue
   * Get all videos pending moderation
   */
  @Get('moderation-queue')
  async getModerationQueue(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.adminService.getModerationQueue(
      page ? Number.parseInt(page, 10) : 1,
      pageSize ? Number.parseInt(pageSize, 10) : 50
    );
  }

  /**
   * GET /admin/videos/:videoId
   * Get full video details for admin review
   */
  @Get('videos/:videoId')
  async getVideoForReview(@Param('videoId') videoId: string) {
    return this.adminService.getVideoForReview(videoId);
  }

  /**
   * POST /admin/videos/:videoId/approve
   * Approve a video for public viewing
   */
  @Post('videos/:videoId/approve')
  async approveVideo(@Param('videoId') videoId: string) {
    return this.adminService.approveVideo(videoId);
  }

  /**
   * POST /admin/videos/:videoId/reject
   * Reject a video
   */
  @Post('videos/:videoId/reject')
  async rejectVideo(@Param('videoId') videoId: string, @Body() body: { reason?: string }) {
    return this.adminService.rejectVideo(videoId, body?.reason);
  }

  /**
   * POST /admin/backfill-slugs
   * Generate slugs for all videos that don't have one
   */
  @Post('backfill-slugs')
  async backfillSlugs() {
    return this.adminService.backfillSlugs();
  }
}
