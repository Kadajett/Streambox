import { PaginationQuerySchema, SortOrderSchema } from '@streambox/shared-types';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for listing channels with optional filters
 */
export const ListChannelsQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'subscriberCount']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});

/**
 * DTO for listing channels query parameters
 * Used for: GET /channels (if you add a public channel listing endpoint)
 *
 * @property page - Page number (default: 1)
 * @property pageSize - Items per page (default: 20, max: 100)
 * @property search - Optional search query for channel name/handle
 * @property sortBy - Field to sort by (name, createdAt, subscriberCount)
 * @property sortOrder - Sort direction (asc, desc)
 */
export class ListChannelsQueryDto extends createZodDto(ListChannelsQuerySchema) {}
