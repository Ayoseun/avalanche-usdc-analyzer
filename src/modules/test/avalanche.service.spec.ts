

import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../utils/logger';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '../../config/config.service';
import { AvalancheService } from '../avalanche/avalanche.service';
import { CacheService } from '../../cache/cache.service';

describe('AvalancheService', () => {
  let service: AvalancheService;
  let logger: LoggerService;
  let configService: ConfigService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
  
      providers: [
        AvalancheService,
        LoggerService,
        ConfigService,
        CacheService,
       
      ],
    }).compile();

    service = module.get<AvalancheService>(AvalancheService);
    logger = module.get<LoggerService>(LoggerService);
    configService = module.get<ConfigService>(ConfigService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch USDC transfers', async () => {
    const fromBlock = 123456;
    const toBlock = 123459;
    const transferData = await service.getUsdcTransfers(fromBlock, toBlock);
    expect(transferData).toBeDefined();
    expect(transferData.length).toBeGreaterThan(0);
  });

  it('should cache USDC transfers', async () => {
    const fromBlock = 123456;
    const toBlock = 123459;
    const transferData = await service.getUsdcTransfers(fromBlock, toBlock);
    expect(transferData).toBeDefined();
    expect(transferData.length).toBeGreaterThan(0);

    const cachedData = await cacheService.get(`usdc_transfers_${fromBlock}_${toBlock}`);
    expect(cachedData).toEqual(transferData);
  });
});

