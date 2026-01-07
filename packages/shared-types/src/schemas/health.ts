import { z } from 'zod';

// ============================================
// Health Check Schemas
// ============================================

// Service status enum
export const ServiceStatusSchema = z.enum(['connected', 'disconnected', 'degraded']);
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;

// Overall health status enum
export const HealthStatusSchema = z.enum(['ok', 'degraded', 'error']);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

// Health check response
export const HealthCheckResponseSchema = z.object({
  status: HealthStatusSchema,
  timestamp: z.string().datetime(),
  version: z.string().optional(),
  uptime: z.number().nonnegative().optional(), // in seconds
  services: z.object({
    database: ServiceStatusSchema,
    redis: ServiceStatusSchema,
    storage: ServiceStatusSchema,
  }),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// Simple health check (for load balancers)
export const SimpleHealthResponseSchema = z.object({
  status: HealthStatusSchema,
});
export type SimpleHealthResponse = z.infer<typeof SimpleHealthResponseSchema>;
