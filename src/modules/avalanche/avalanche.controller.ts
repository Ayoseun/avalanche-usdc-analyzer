


// avalanche.controller.ts
import { Controller, Get, Query, Param,  ParseIntPipe, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AvalancheService } from './avalanche.service';
import { TimeframeStatsDto, AccountStatsDto, TransferResponseDto } from '../dto/get-stats.dto';


@ApiTags('USDC Transfers')
@Controller('api/v1/avalanche')

export class AvalancheController {
  constructor(private readonly avalancheService: AvalancheService) {}

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get overview statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns overview statistics including 24h volume, transaction count, etc.',
    type: TimeframeStatsDto 
  })
  async getOverviewStats(): Promise<TimeframeStatsDto> {
    try {
      const [
        volume24h,
        topAccounts,
        latestBlock
      ] = await Promise.all([
        this.avalancheService.get24HourVolume(),
        this.avalancheService.getTopAccountsByVolume(),
        this.avalancheService.getLatestProcessedBlock()
      ]);

      return {
        volume24h: volume24h || 0,
        topAccounts,
        latestBlock:latestBlock|| 0,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch overview statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('account/:address')
  @ApiOperation({ summary: 'Get account statistics and history' })
  @ApiParam({ name: 'address', description: 'Ethereum address to query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to return' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns account statistics and transaction history',
    type: AccountStatsDto 
  })
  async getAccountStats(
    @Param('address') address: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 100
  ): Promise<AccountStatsDto> {
    try {
      return await this.avalancheService.getAccountTransfers(address, limit);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch account statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get USDC transfers within a time range' })
  @ApiQuery({ name: 'startTime', required: true, description: 'Start timestamp (ISO format)' })
  @ApiQuery({ name: 'endTime', required: true, description: 'End timestamp (ISO format)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transfers to return' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of transfers within the specified time range',
    type: [TransferResponseDto] 
  })
  async getTransfers(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 100
  ): Promise<TransferResponseDto[]> {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException(
          'Invalid date format',
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.avalancheService.getTransfersByTimeRange(start, end, limit);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch transfers',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }



  @Get('analytics/volume-distribution')
  @ApiOperation({ summary: 'Get volume distribution by time' })
  @ApiQuery({ name: 'timeframe', required: true, description: 'Timeframe (hourly/daily/weekly)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns volume distribution over specified timeframe' 
  })
  async getVolumeDistribution(
    @Query('timeframe') timeframe: 'hourly' | 'daily' | 'weekly'
  ): Promise<any> {
    try {
      const validTimeframes = ['hourly', 'daily', 'weekly'];
      if (!validTimeframes.includes(timeframe)) {
        throw new HttpException(
          'Invalid timeframe. Must be hourly, daily, or weekly',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.avalancheService.getVolumeDistribution(timeframe);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch volume distribution',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Get service health status' })
  @ApiResponse({ status: 200, description: 'Returns service health information' })
  async getHealthStatus(): Promise<any> {
    try {
      const [
        latestBlock,
        syncStatus,
        rpcStatus
      ] = await Promise.all([
        this.avalancheService.getLatestProcessedBlock(),
        this.avalancheService.getSyncStatus(),
        this.avalancheService.checkRPCStatus()
      ]);

      return {
        status: 'healthy',
        latestBlock,
        syncStatus,
        rpcStatus,
        timestamp: new Date()
      };
    } catch (error) {
      throw new HttpException(
        'Service health check failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}