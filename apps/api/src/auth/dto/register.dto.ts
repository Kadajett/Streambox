import { createZodDto } from 'nestjs-zod';
import { RegisterRequestSchema } from '@streambox/shared-types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export class RegisterDto extends createZodDto(RegisterRequestSchema) {}
