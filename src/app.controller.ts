import { Controller, Get, } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheService } from './cache/cache.service';
import { Cache } from '@nestjs/cache-manager';
import { LoggerService } from './utils/logger';


@Controller()
export class AppController {
  private  cacheService: CacheService
  private readonly appService: AppService
  private logger: LoggerService
  private cache:Cache

  constructor() {
    
    this.cacheService = new CacheService(this.cache,this.logger);
  }

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

}
