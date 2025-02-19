import { Module,  } from '@nestjs/common';

import { AvalancheModule } from './modules/avalanche/avalanche.module';
import { ConfigModule } from './config/config.module';

import { CacheModules } from './cache/cache.module';
import { AppController } from './app.controller';
import { CacheService } from './cache/cache.service';
import { LoggerService } from './utils/logger';

@Module({
  imports: [
    ConfigModule,
    AvalancheModule,
    CacheModules,
  ],
  providers: [CacheService,LoggerService],
  controllers: [AppController],
})
export class AppModule {}
