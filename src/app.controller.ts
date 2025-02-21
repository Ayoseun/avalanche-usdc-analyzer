import { Controller, Get, } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheService } from './cache/cache.service';
import { Cache } from '@nestjs/cache-manager';
import { LoggerService } from './utils/logger';


@Controller()
export class AppController {

  private readonly appService: AppService


  constructor() {
  }

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

}
