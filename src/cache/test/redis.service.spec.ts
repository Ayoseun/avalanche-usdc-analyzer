
// test-redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from 'src/config/config.service';


@Injectable()
export class TestRedisService {
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.envConfig.REDIS_HOST,
      port: parseInt (this.configService.envConfig.REDIS_PORT),
      
    });
  }

  async ping(): Promise<string> {
    return this.redis.ping();
  }

  async clearTestData(): Promise<void> {
    await this.redis.flushdb();
  }

  async setTestData(key: string, value: any): Promise<void> {
    await this.redis.set(key, JSON.stringify(value));
  }

  async getTestData(key: string): Promise<any> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}