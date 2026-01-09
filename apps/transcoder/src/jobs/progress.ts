import type { PrismaClient } from '@prisma/client';
import type { TranscodeStatus } from '@streambox/shared-types';

export type TranscodeJobStatus = TranscodeStatus;

export const updateTranscodeJob = async (
  prisma: PrismaClient,
  videoId: string,
  status: TranscodeJobStatus,
  progress: number,
  error?: string
): Promise<void> => {
  const existingJob = await prisma.transcodeJob.findFirst({
    where: { videoId },
    orderBy: { createdAt: 'desc' },
  });

  if (existingJob) {
    await prisma.transcodeJob.update({
      where: { id: existingJob.id },
      data: { status, progress, error },
    });
  } else {
    await prisma.transcodeJob.create({
      data: { videoId, status, progress, error },
    });
  }
};

export const markJobCompleted = async (
  prisma: PrismaClient,
  videoId: string
): Promise<void> => {
  await updateTranscodeJob(prisma, videoId, 'completed', 100);
};

export const markJobFailed = async (
  prisma: PrismaClient,
  videoId: string,
  error: string
): Promise<void> => {
  await updateTranscodeJob(prisma, videoId, 'failed', 0, error);
};
