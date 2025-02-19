//src/database/database.module.ts

/**TODO needs implementation for 
 * 1. src/database/database.service.ts
 * 2. src/database/entity/account.entity.ts
 * 3. src/database/entity/transaction.entity.ts
 * 4. src/database/migrations/001-init-schema.ts
 * */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.DATABASE_URL,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
