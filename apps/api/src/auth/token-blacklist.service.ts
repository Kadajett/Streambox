import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * TokenBlacklistService - Manages token revocation using Redis
 *
 * Blacklisted tokens are stored with their JWT ID (jti) as the key.
 * TTL is set to match the token's remaining lifetime to auto-cleanup.
 */
@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly KEY_PREFIX = 'token:blacklist:';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;

    this.redis = new Redis({
      host,
      port,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis connection failed, token blacklist disabled');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    try {
      await this.redis.connect();
      this.logger.log('Token blacklist Redis connection established');
    } catch (error) {
      this.logger.warn('Token blacklist Redis unavailable, revocation disabled');
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * Add a token to the blacklist
   * @param jti - The JWT ID (unique identifier for the token)
   * @param expiresAt - Unix timestamp when the token expires
   */
  async blacklist(jti: string, expiresAt: number): Promise<void> {
    if (!this.redis?.status || this.redis.status !== 'ready') {
      this.logger.warn('Redis not available, cannot blacklist token');
      return;
    }

    const ttl = Math.max(expiresAt - Math.floor(Date.now() / 1000), 1);
    const key = `${this.KEY_PREFIX}${jti}`;

    try {
      await this.redis.setex(key, ttl, '1');
      this.logger.debug(`Blacklisted token ${jti} for ${ttl}s`);
    } catch (error) {
      this.logger.error(`Failed to blacklist token: ${error}`);
    }
  }

  /**
   * Check if a token is blacklisted
   * @param jti - The JWT ID to check
   * @returns true if the token is blacklisted
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    if (!this.redis?.status || this.redis.status !== 'ready') {
      return false;
    }

    try {
      const result = await this.redis.exists(`${this.KEY_PREFIX}${jti}`);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check blacklist: ${error}`);
      return false;
    }
  }

  /**
   * Blacklist all tokens for a user (used for "logout everywhere")
   * This stores the timestamp after which all tokens are invalid
   * @param userId - The user ID
   * @param ttl - How long to keep this entry (should match max token lifetime)
   */
  async blacklistAllForUser(userId: string, ttl: number = 604800): Promise<void> {
    if (!this.redis?.status || this.redis.status !== 'ready') {
      this.logger.warn('Redis not available, cannot blacklist user tokens');
      return;
    }

    const key = `token:invalidate:${userId}`;
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      await this.redis.setex(key, ttl, timestamp.toString());
      this.logger.debug(`Invalidated all tokens for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate user tokens: ${error}`);
    }
  }

  /**
   * Check if a token was issued before the user's invalidation timestamp
   * @param userId - The user ID
   * @param issuedAt - The token's iat claim
   * @returns true if the token was issued before invalidation
   */
  async isUserTokenInvalidated(userId: string, issuedAt: number): Promise<boolean> {
    if (!this.redis?.status || this.redis.status !== 'ready') {
      return false;
    }

    try {
      const timestamp = await this.redis.get(`token:invalidate:${userId}`);
      if (!timestamp) return false;
      return issuedAt < parseInt(timestamp, 10);
    } catch (error) {
      this.logger.error(`Failed to check user invalidation: ${error}`);
      return false;
    }
  }
}
