//src/modules/dto/get-stats.dto.ts

// // src/modules/dto/get-stats.dto.ts
// import { IsISO8601, IsOptional, IsPositive } from 'class-validator';

// export class GetStatsDto {
//   @IsOptional()
//   @IsISO8601()
//   start?: Date;

//   @IsOptional()
//   @IsISO8601()
//   end?: Date;
// }

// export class GetTopAccountsDto {
//   @IsOptional()
//   @IsPositive()
//   limit?: number = 10;
// }


// get-stats.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TransferResponseDto {
  @ApiProperty({ description: 'Transaction hash' })
  txHash: string;

  @ApiProperty({ description: 'Block number where transaction was included' })
  blockNumber: number;

  @ApiProperty({ description: 'Timestamp of the block' })
  timestamp: Date;

  @ApiProperty({ description: 'Sender address' })
  from: string;

  @ApiProperty({ description: 'Recipient address' })
  to: string;

  @ApiProperty({ description: 'USDC amount transferred' })
  amount: number;

  @ApiProperty({ description: 'Gas used by the transaction' })
  gasUsed: number;

  @ApiProperty({ description: 'Gas price in gwei' })
  gasPrice: number;

  @ApiProperty({ description: 'Transaction fee in AVAX' })
  fee: number;
}

export class AccountTransactionDto {
  @ApiProperty({ description: 'Transaction hash' })
  txHash: string;

  @ApiProperty({ description: 'Block number where transaction was included' })
  blockNumber: number;

  @ApiProperty({ description: 'Timestamp of the block' })
  timestamp: Date;

  @ApiProperty({ description: 'Counter-party address' })
  counterparty: string;

  @ApiProperty({ description: 'USDC amount transferred' })
  amount: number;

  @ApiProperty({ description: 'Type of transfer (in/out)' })
  direction: 'in' | 'out';

  @ApiProperty({ description: 'Transaction fee in AVAX' })
  fee: number;
}

export class AccountStatsDto {
  @ApiProperty({ description: 'Account address' })
  address: string;

  @ApiProperty({ description: 'Current USDC balance' })
  balance: number;

  @ApiProperty({ description: 'Total USDC sent' })
  totalSent: number;

  @ApiProperty({ description: 'Total USDC received' })
  totalReceived: number;

  @ApiProperty({ description: 'Total number of transactions' })
  transactionCount: number;

  @ApiProperty({ description: 'Timestamp of last activity' })
  lastActivityTimestamp: Date;

  @ApiProperty({ description: 'Recent transactions', type: [AccountTransactionDto] })
  transactions: AccountTransactionDto[];
}

export class TopAccountDto {
  @ApiProperty({ description: 'Account address' })
  address: string;

  @ApiProperty({ description: 'Total volume (sent + received)' })
  volume: number;

  @ApiProperty({ description: 'Current USDC balance' })
  balance: number;

  @ApiProperty({ description: 'Number of transactions' })
  transactionCount: number;
}

export class TimeframeStatsDto {
  @ApiProperty({ description: '24-hour USDC transfer volume' })
  volume24h: number;

  @ApiProperty({ description: 'Top accounts by volume', type: [TopAccountDto] })
  topAccounts: TopAccountDto[];

  @ApiProperty({ description: 'Latest processed block number' })
  latestBlock: number;

  @ApiProperty({ description: 'Timestamp when stats were generated' })
  timestamp: Date;
}

export class TradingPairDto {
  @ApiProperty({ description: 'First address in the pair' })
  address1: string;

  @ApiProperty({ description: 'Second address in the pair' })
  address2: string;

  @ApiProperty({ description: 'Total volume between the pair' })
  volume: number;

  @ApiProperty({ description: 'Number of transactions between the pair' })
  transactionCount: number;

  @ApiProperty({ description: 'Last transaction timestamp' })
  lastActivityTimestamp: Date;
}

export class VolumeDistributionDto {
  @ApiProperty({ description: 'Time period label' })
  period: string;

  @ApiProperty({ description: 'Start of the time period' })
  startTime: Date;

  @ApiProperty({ description: 'End of the time period' })
  endTime: Date;

  @ApiProperty({ description: 'Total volume in the period' })
  volume: number;
}

export class HealthStatusDto {
  @ApiProperty({ description: 'Service health status' })
  status: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty({ description: 'Latest processed block number' })
  latestBlock: number;

  @ApiProperty({ description: 'Synchronization status details' })
  syncStatus: {
    latestProcessedBlock: number;
    currentNetworkBlock: number;
    blocksRemaining: number;
    isSynced: boolean;
    syncPercentage: string;
    estimatedTimeRemaining: number;
  };

  @ApiProperty({ description: 'RPC connection status' })
  rpcStatus: {
    connected: boolean;
    latency?: string;
    url?: string;
    error?: string;
  };

  @ApiProperty({ description: 'Timestamp of health check' })
  timestamp: Date;
}