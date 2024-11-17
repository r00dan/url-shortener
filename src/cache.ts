import { Redis, RedisOptions } from "ioredis";

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379,
};

export class Cache {
  public readonly redis: Redis;
  private static instance: Cache;

  private constructor() {
    this.redis = new Redis(redisConfig);
  }

  public static getInstance() {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }

    return Cache.instance;
  }
}
