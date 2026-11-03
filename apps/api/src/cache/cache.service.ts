import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private readonly memoryCache = new Map<string, CacheEntry<any>>();
  private readonly inFlight = new Map<string, Promise<any>>();
  private isRedisEnabled = false;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD') || undefined;

    if (redisUrl || redisHost) {
      try {
        if (redisUrl) {
          this.redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 2,
            enableReadyCheck: true,
            lazyConnect: true,
          });
        } else {
          this.redisClient = new Redis({
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            maxRetriesPerRequest: 2,
            enableReadyCheck: true,
            lazyConnect: true,
          });
        }

        this.redisClient.connect().then(() => {
          this.isRedisEnabled = true;
          this.logger.log('Redis Cache connection established successfully');
        }).catch((err) => {
          this.logger.warn(`Redis connection failed: ${err.message}. Operating in high-speed In-Memory cache mode.`);
          this.isRedisEnabled = false;
        });

        this.redisClient.on('error', (err) => {
          this.logger.warn(`Redis error: ${err.message}`);
        });
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Redis: ${err.message}. Fallback to In-Memory cache.`);
      }
    } else {
      this.logger.log('No REDIS_URL found. Operating in built-in High-Speed In-Memory Cache mode (Hot-Key Protected).');
    }

    // Background garbage collection for expired in-memory entries every 60 seconds
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiresAt <= now) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  /**
   * Get an item from Redis or In-Memory cache.
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisEnabled && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) return JSON.parse(raw) as T;
      } catch (err: any) {
        this.logger.warn(`Redis GET error for key ${key}: ${err.message}`);
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set an item in cache with a TTL (seconds). Default TTL = 300s (5 minutes).
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });

    if (this.isRedisEnabled && this.redisClient) {
      try {
        const raw = JSON.stringify(value);
        await this.redisClient.set(key, raw, 'EX', ttlSeconds);
      } catch (err: any) {
        this.logger.warn(`Redis SET error for key ${key}: ${err.message}`);
      }
    }
  }

  /**
   * Delete one or more keys from cache.
   */
  async del(keyOrKeys: string | string[]): Promise<void> {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    for (const k of keys) {
      this.memoryCache.delete(k);
    }

    if (this.isRedisEnabled && this.redisClient && keys.length > 0) {
      try {
        await this.redisClient.del(...keys);
      } catch (err: any) {
        this.logger.warn(`Redis DEL error: ${err.message}`);
      }
    }
  }

  /**
   * Invalidate all keys matching a wildcard pattern, e.g. "notices:*" or "news:*"
   */
  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    if (this.isRedisEnabled && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys && keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err: any) {
        this.logger.warn(`Redis DEL pattern error for ${pattern}: ${err.message}`);
      }
    }
  }

  /**
   * Wrap an async DB fetch with cache + Singleflight stampede protection.
   * If 1,000 requests hit simultaneously, ONLY 1 hits the DB, and all 1,000 get the result!
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    // 1. Check existing cache
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // 2. Singleflight: If a DB fetch for this key is already running, wait for it
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    // 3. Execute DB fetch and store promise in flight
    const promise = (async () => {
      try {
        const result = await fn();
        await this.set(key, result, ttlSeconds);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Atomic increment for real-time counters (e.g. Visitor Count) with Redis INCR support.
   */
  async incrementCounter(key: string, initialOffset: number = 0): Promise<number> {
    if (this.isRedisEnabled && this.redisClient) {
      try {
        const exists = await this.redisClient.exists(key);
        if (!exists && initialOffset > 0) {
          await this.redisClient.set(key, initialOffset);
        }
        const newVal = await this.redisClient.incr(key);
        return newVal;
      } catch (err: any) {
        this.logger.warn(`Redis INCR error for ${key}: ${err.message}`);
      }
    }

    // In-Memory Fallback
    const current = (this.memoryCache.get(key)?.value as number) || initialOffset;
    const next = current + 1;
    this.memoryCache.set(key, { value: next, expiresAt: Date.now() + 86400 * 365 * 1000 });
    return next;
  }

  /**
   * Get current counter value without incrementing.
   */
  async getCounter(key: string, initialOffset: number = 0): Promise<number> {
    if (this.isRedisEnabled && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        if (val !== null) {
          return parseInt(val, 10);
        }
        if (initialOffset > 0) {
          await this.redisClient.set(key, initialOffset);
          return initialOffset;
        }
      } catch (err: any) {
        this.logger.warn(`Redis GET counter error for ${key}: ${err.message}`);
      }
    }

    const current = (this.memoryCache.get(key)?.value as number);
    if (current !== undefined) return current;
    if (initialOffset > 0) {
      this.memoryCache.set(key, { value: initialOffset, expiresAt: Date.now() + 86400 * 365 * 1000 });
      return initialOffset;
    }
    return 0;
  }
}

