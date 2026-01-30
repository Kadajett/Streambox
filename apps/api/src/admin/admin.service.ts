import { Injectable, NotFoundException } from '@nestjs/common';
import { generateSlug, generateUniqueSlug } from '../utils/slug';
import { VideoRepository, ChannelRepository, UserRepository } from '../database';

@Injectable()
export class AdminService {
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly userRepository: UserRepository
  ) {}
  /**
   * Get all videos pending moderation
   */
  async getModerationQueue(limit = 50, offset = 0) {
    const [videos, total] = await Promise.all([
      this.videoRepository.findPendingModeration({ skip: offset, take: limit }),
      this.videoRepository.countPendingModeration(),
    ]);

    return {
      data: videos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + videos.length < total,
      },
    };
  }

  /**
   * Approve a video for public viewing
   */
  async approveVideo(videoId: string, approvedBy?: string) {
    const video = await this.videoRepository.findById(videoId);

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updated = await this.videoRepository.update(videoId, {
      moderation: 'approved',
      moderationReason: approvedBy ? `Approved by ${approvedBy}` : 'Approved',
    });

    return { data: updated };
  }

  /**
   * Reject a video
   */
  async rejectVideo(videoId: string, reason?: string, rejectedBy?: string) {
    const video = await this.videoRepository.findById(videoId);

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updated = await this.videoRepository.update(videoId, {
      moderation: 'rejected',
      moderationReason: reason || (rejectedBy ? `Rejected by ${rejectedBy}` : 'Rejected'),
    });

    return { data: updated };
  }

  /**
   * Get admin stats overview
   */
  async getStats() {
    const [
      totalVideos,
      pendingModeration,
      approvedVideos,
      rejectedVideos,
      processingVideos,
      totalChannels,
      totalUsers,
    ] = await Promise.all([
      this.videoRepository.count(),
      this.videoRepository.count({ moderation: 'pending' }),
      this.videoRepository.count({ moderation: 'approved' }),
      this.videoRepository.count({ moderation: 'rejected' }),
      this.videoRepository.count({ status: 'processing' }),
      this.channelRepository.count(),
      this.userRepository.count(),
    ]);

    return {
      data: {
        videos: {
          total: totalVideos,
          pendingModeration,
          approved: approvedVideos,
          rejected: rejectedVideos,
          processing: processingVideos,
        },
        channels: totalChannels,
        users: totalUsers,
      },
    };
  }

  /**
   * Get a specific video with full details for admin review
   */
  async getVideoForReview(videoId: string) {
    const video = await this.videoRepository.findForAdminReview(videoId);

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return { data: video };
  }

  /**
   * Backfill slugs for videos that don't have one
   */
  async backfillSlugs() {
    const videosWithoutSlug = await this.videoRepository.findWithoutSlug();

    const results: { id: string; slug: string }[] = [];

    for (const video of videosWithoutSlug) {
      const baseSlug = generateSlug(video.title);
      const slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await this.videoRepository.findBySlug(s);
        return existing !== null;
      });

      await this.videoRepository.update(video.id, { slug });

      results.push({ id: video.id, slug });
    }

    return {
      data: {
        updated: results.length,
        videos: results,
      },
    };
  }
}
