import { createZodDto } from 'nestjs-zod';
import { LoginRequestSchema } from '@streambox/shared-types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export class LoginDto extends createZodDto(LoginRequestSchema) {}
