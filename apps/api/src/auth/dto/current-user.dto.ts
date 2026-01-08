import { CurrentUserSchema } from '@streambox/shared-types';
import { createZodDto } from 'nestjs-zod';

export class CurrentUserDto extends createZodDto(CurrentUserSchema) {}
