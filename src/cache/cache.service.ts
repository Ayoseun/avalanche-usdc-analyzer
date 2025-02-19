import { Injectable, Inject, Scope } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoggerService } from 'src/utils/logger';

@Injectable({ scope: Scope.TRANSIENT })
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private client: Cache,
    private logger:LoggerService
  ) {}

  async get(key: string): Promise<string|undefined|null> {

    const value:string|undefined|null = await this.client.get(key);
    if (!value) return "";

    try {
      this.logger.log(`Getting cache key: ${key} data: ${value}`);
      return value;
    } catch (error) {
      this.logger.warn(`Error parsing cache value for key: ${key}`);
      return null;
    }
  }

  async set(key: string, value:string): Promise<void> {
    this.logger.log(`Setting cache key: ${key}, ${ value},`);
   
    await this.client.set(key, value);
  }



  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

}