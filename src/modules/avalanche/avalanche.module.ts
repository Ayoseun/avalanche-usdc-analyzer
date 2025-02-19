import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AvalancheController } from './avalanche.controller';
import { AvalancheService } from './avalanche.service';
import { ConfigService } from '../../config/config.service';
import { LoggerService } from '../../utils/logger';
import { AvalancheGateway } from './avalanche.gateway';
import { CacheService } from '../../cache/cache.service';

@Module({
  imports: [CacheModule.register(     {ttl: 60 * 5}, )],
  controllers: [AvalancheController],
  providers: [AvalancheService, AvalancheGateway,CacheService, ConfigService, LoggerService],
  exports: [AvalancheService],
})
export class AvalancheModule {}
