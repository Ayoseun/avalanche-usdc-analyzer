// src/modules/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {AppDataSource} from './data-source';


@Module({
  imports: [
    
    TypeOrmModule.forRoot(AppDataSource.options), // Use DataSource config
  ],
})
export class DatabaseModule {}
