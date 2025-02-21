

// avalanche.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AvalancheService } from './avalanche.service';
import { AvalancheGateway } from './avalanche.gateway';


import { DatabaseModule } from '../../database/database.module';
import { CacheModules } from '../../cache/cache.module';
import { DatabaseService } from '../../database/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../database/entities/account.entity';
import { Transaction } from '../../database/entities/transaction.entity';
import { LoggerService } from '../../utils/logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CacheModules,
  ],
  providers: [AvalancheService, AvalancheGateway,DatabaseService,LoggerService],
  exports: [AvalancheService],
})
export class AvalancheModule {}