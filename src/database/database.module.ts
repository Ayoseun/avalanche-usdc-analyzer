// src/modules/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {AppDataSource} from './data-source';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction]),
    TypeOrmModule.forRoot(AppDataSource.options), // Use DataSource config
  ],
})
export class DatabaseModule {}
