import { createZodDto } from 'nestjs-zod';
import { CreateVideoRequestSchema, UpdateVideoRequestSchema } from '@streambox/shared-types';

export class CreateVideoDto extends createZodDto(CreateVideoRequestSchema) {}

export class UpdateVideoDto extends createZodDto(UpdateVideoRequestSchema) {}
