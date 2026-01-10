import { FeedQuerySchema, TrendingQuerySchema } from '@streambox/shared-types';
import { createZodDto } from 'nestjs-zod';

const SafeFeedQuerySchema = FeedQuerySchema.default({
  page: 1,
  pageSize: 10,
  sortBy: 'popular',
});
const SafeTrendingQuerySchema = TrendingQuerySchema.default({
  page: 1,
  pageSize: 10,
});

export class FeedQueryDto extends createZodDto(SafeFeedQuerySchema) {}
export class TrendingQueryDto extends createZodDto(SafeTrendingQuerySchema) {}
