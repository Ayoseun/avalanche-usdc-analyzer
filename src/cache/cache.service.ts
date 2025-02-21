// cache.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  // Cache keys
  private readonly KEYS = {
    LATEST_BLOCK: 'latest_block',
    ACCOUNT_STATS: (address: string) => `account_stats:${address}`,
    TOP_ACCOUNTS: 'top_accounts',
    VOLUME_24H: '24h_volume',
    TRANSACTION_COUNT: (timeframe: string) => `transaction_count:${timeframe}`,
    TRANSFERS: (startTime: string, endTime: string, limit: number) => 
      `transfers:${startTime}:${endTime}:${limit}`,
    TOP_PAIRS: (limit: number) => `top-pairs:${limit}`,
    VOLUME_DISTRIBUTION: (timeframe: string) => `volume-distribution:${timeframe}`,
  };

  // Block related methods
  async getLatestBlock(): Promise<number|null> {
    return this.cacheManager.get<number>(this.KEYS.LATEST_BLOCK);
  }

  async setLatestBlock(blockNumber: number): Promise<void> {
    await this.cacheManager.set(this.KEYS.LATEST_BLOCK, blockNumber, 3600); // 1 hour TTL
  }

  // Account related methods
  async getAccountStats(address: string): Promise<any> {
    return this.cacheManager.get(this.KEYS.ACCOUNT_STATS(address));
  }

  async setAccountStats(address: string, stats: any): Promise<void> {
    await this.cacheManager.set(this.KEYS.ACCOUNT_STATS(address), stats, 1800); // 30 minutes TTL
  }

  async clearAccountCache(address: string): Promise<void> {
    await this.cacheManager.del(this.KEYS.ACCOUNT_STATS(address));
  }

  // Top accounts methods
  async getTopAccounts(): Promise<any[]|null> {
    return this.cacheManager.get<any[]>(this.KEYS.TOP_ACCOUNTS);
  }

  async setTopAccounts(accounts: any[]): Promise<void> {
    await this.cacheManager.set(this.KEYS.TOP_ACCOUNTS, accounts, 3600); // 1 hour TTL
  }

  // Volume methods
  async get24HVolume(): Promise<number|null> {
    return this.cacheManager.get<number>(this.KEYS.VOLUME_24H);
  }

  async set24HVolume(volume: number): Promise<void> {
    await this.cacheManager.set(this.KEYS.VOLUME_24H, volume, 300); // 5 minutes TTL
  }

  // Transaction count methods
  async getTransactionCount(timeframe: string): Promise<number|null> {
    return this.cacheManager.get<number>(
      this.KEYS.TRANSACTION_COUNT(timeframe),
    );
  }

  async setTransactionCount(
    timeframe: string,
    count: number,
  ): Promise<void> {
    await this.cacheManager.set(
      this.KEYS.TRANSACTION_COUNT(timeframe),
      count,
      1800, // 30 minutes TTL
    );
  }

  // Transfer methods
  async getTransfers(startTime: Date, endTime: Date, limit: number): Promise<any[]|null> {
    const key = this.KEYS.TRANSFERS(
      startTime.toISOString(),
      endTime.toISOString(),
      limit
    );
    return this.cacheManager.get<any[]>(key);
  }

  async setTransfers(startTime: Date, endTime: Date, limit: number, transfers: any[]): Promise<void> {
    const key = this.KEYS.TRANSFERS(
      startTime.toISOString(),
      endTime.toISOString(),
      limit
    );
    await this.cacheManager.set(key, transfers, 300); // 5 minutes TTL
  }

  // Trading pairs methods
  async getTopTradingPairs(limit: number): Promise<any[]|null> {
    return this.cacheManager.get<any[]>(this.KEYS.TOP_PAIRS(limit));
  }

  async setTopTradingPairs(limit: number, pairs: any[]): Promise<void> {
    await this.cacheManager.set(this.KEYS.TOP_PAIRS(limit), pairs, 900); // 15 minutes TTL
  }

  // Volume distribution methods
  async getVolumeDistribution(timeframe: string): Promise<any[]|null> {
    return this.cacheManager.get<any[]>(this.KEYS.VOLUME_DISTRIBUTION(timeframe));
  }

  async setVolumeDistribution(timeframe: string, data: any[]): Promise<void> {
    const ttl = this.getVolumeDistributionTTL(timeframe);
    await this.cacheManager.set(this.KEYS.VOLUME_DISTRIBUTION(timeframe), data, ttl);
  }

  private getVolumeDistributionTTL(timeframe: string): number {
    switch(timeframe) {
      case 'hourly':
        return 300; // 5 minutes
      case 'daily':
        return 1800; // 30 minutes
      case 'weekly':
        return 7200; // 2 hours
      default:
        return 900; // 15 minutes
    }
  }
}