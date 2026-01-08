import { z } from 'zod';

// ============================================
// Common/Shared Schemas
// ============================================

// Timestamps used across entities
export const TimestampsSchema = z.object({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Timestamps = z.infer<typeof TimestampsSchema>;

// Pagination metadata
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// Pagination query params (for requests)
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// Generic paginated response wrapper
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

// Generic API response wrapper
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: PaginationMetaSchema.optional(),
  });

// API Error detail
export const ApiErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});
export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;

// API Error response
export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(ApiErrorDetailSchema).optional(),
  }),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// Success message response
export const MessageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponse = z.infer<typeof MessageResponseSchema>;

// ID parameter (for route params)
export const IdParamSchema = z.object({
  id: z.string().min(1),
});
export type IdParam = z.infer<typeof IdParamSchema>;

// Sort order enum
export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;
