import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@streambox/database';
import { generateSlug, generateUniqueSlug } from '../utils/slug';

@Injectable()
export class AdminService {
  /**
   * Get all videos pending moderation
   */
  async getModerationQueue(limit = 50, offset = 0) {
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: { moderation: 'pending' },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
        include: {
          channel: {
            select: {
              id: true,
              name: true,
              handle: true,
            },
          },
        },
      }),
      prisma.video.count({
        where: { moderation: 'pending' },
      }),
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
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updated = await prisma.video.update({
      where: { id: videoId },
      data: {
        moderation: 'approved',
        moderationReason: approvedBy ? `Approved by ${approvedBy}` : 'Approved',
      },
    });

    return { data: updated };
  }

  /**
   * Reject a video
   */
  async rejectVideo(videoId: string, reason?: string, rejectedBy?: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updated = await prisma.video.update({
      where: { id: videoId },
      data: {
        moderation: 'rejected',
        moderationReason: reason || (rejectedBy ? `Rejected by ${rejectedBy}` : 'Rejected'),
      },
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
      prisma.video.count(),
      prisma.video.count({ where: { moderation: 'pending' } }),
      prisma.video.count({ where: { moderation: 'approved' } }),
      prisma.video.count({ where: { moderation: 'rejected' } }),
      prisma.video.count({ where: { status: 'processing' } }),
      prisma.channel.count(),
      prisma.user.count(),
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
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        channel: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return { data: video };
  }

  /**
   * Backfill slugs for videos that don't have one
   */
  async backfillSlugs() {
    const videosWithoutSlug = await prisma.video.findMany({
      where: { slug: undefined },
      select: { id: true, title: true },
    });

    const results: { id: string; slug: string }[] = [];

    for (const video of videosWithoutSlug) {
      const baseSlug = generateSlug(video.title);
      const slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await prisma.video.findUnique({ where: { slug: s } });
        return existing !== null;
      });

      await prisma.video.update({
        where: { id: video.id },
        data: { slug },
      });

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
