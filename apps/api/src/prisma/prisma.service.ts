import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error('=== PRISMA ERROR ===');
      console.error('DATABASE_URL environment variable is not set!');
      throw new Error('DATABASE_URL environment variable is required');
    }

    console.log('[PrismaService] Initializing with connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));

    try {
      const adapter = new PrismaPg({ connectionString });
      super({ adapter });
      console.log('[PrismaService] PrismaClient created successfully');
    } catch (error) {
      console.error('=== PRISMA ADAPTER ERROR ===');
      console.error('Failed to create PrismaPg adapter:');
      console.error(error);
      throw error;
    }
  }

  async onModuleInit() {
    try {
      console.log('[PrismaService] Connecting to database...');
      await this.$connect();
      console.log('[PrismaService] Connected successfully');
    } catch (error) {
      console.error('=== PRISMA CONNECTION ERROR ===');
      console.error('Failed to connect to database:');
      console.error(error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
