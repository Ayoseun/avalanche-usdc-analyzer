import { Module,  } from '@nestjs/common';

import { AvalancheModule } from './modules/avalanche/avalanche.module';
import { ConfigModule } from './config/config.module';

import { CacheModules } from './cache/cache.module';
import { AppController } from './app.controller';
import { CacheService } from './cache/cache.service';
import { LoggerService } from './utils/logger';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule,
    AvalancheModule,
    CacheModules,
    DatabaseModule
  ],
  providers: [CacheService,LoggerService],
  controllers: [AppController],
})
export class AppModule {}
