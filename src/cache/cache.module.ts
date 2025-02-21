import { Module } from '@nestjs/common';

import { CacheService } from './cache.service';
import { LoggerService } from '../utils/logger';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from 'src/config/config.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        ttl: 60 * 5, // 5 minutes
        max: 100, // Maximum number of items in cache
        isGlobal: true, // Make the cache manager globally available
        store:redisStore,
        host: configService.envConfig.REDIS_HOST ,
        port: configService.envConfig.REDIS_PORT ,
        password: configService.envConfig.REDIS_PASSWORD,
        prefix: 'usdc-analyzer:',
      
      }),
      inject: [ConfigService],
 
    })
  ],
  providers: [CacheService, LoggerService, ConfigService],
  exports: [CacheService, CacheModule],
})
export class CacheModules {}

