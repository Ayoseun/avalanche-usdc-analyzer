

// avalanche.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AvalancheGateway } from './avalanche.gateway';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { AVALANCHE_CONSTANTS } from './avalanche.constants';
import { TransferEvent } from './avalanche.interface';
import { formatUSDCAmount } from './avalanche.utils';
import { ethers } from 'ethers';
import { AccountStatsDto, TransferResponseDto } from '../dto/get-stats.dto';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AvalancheService {
  private readonly logger = new Logger(AvalancheService.name);
  private isProcessing = false;

  constructor(
    private readonly avalancheGateway: AvalancheGateway,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  
  ) {}

  @Interval(AVALANCHE_CONSTANTS.BLOCK_TIME * 1000)
  async processNewBlocks() {
    if (this.isProcessing) {
      this.logger.log('Processing is already ongoing.');
      return;
    }
  
    this.isProcessing = true;
    this.logger.log('Starting block processing...');
  
    try {
      const START_BLOCK = 11975000; // Approximate block number for Jan 1, 2022
      const latestProcessedBlock = (await this.cacheService.getLatestBlock()) || START_BLOCK;
      this.logger.log(`Latest processed block: ${latestProcessedBlock}`);
  
      const currentBlock = await this.avalancheGateway.getLatestBlockNumber();
      this.logger.log(`Current network block: ${currentBlock}`);
  
      if (currentBlock <= latestProcessedBlock) {
        this.logger.log('No new blocks to process.');
        return;
      }
  
      const fromBlock = Math.max(latestProcessedBlock + 1, START_BLOCK);
      const toBlock = Math.min(fromBlock + AVALANCHE_CONSTANTS.RPC_BATCH_SIZE, currentBlock);
      this.logger.log(`Processing blocks from ${fromBlock} to ${toBlock}`);
  
      const events = await this.avalancheGateway.getTransferEvents({
        fromBlock,
        toBlock,
      });
      this.logger.log(`Fetched ${events.length} transfer events`);
  
      await this.processTransferEvents(events);
      this.logger.log('Transfer events processed successfully');
  
      await this.cacheService.setLatestBlock(toBlock);
      this.logger.log(`Updated cache with latest block: ${toBlock}`);
  
      await this.updateStatistics();
      this.logger.log('Statistics updated');
  
    } catch (error) {
      this.logger.error(`Error processing blocks: ${error}`);
    } finally {
      this.isProcessing = false;
      this.logger.log('Block processing completed');
    }
  }
  
  /**
   * Process a list of new transfer events.
   *
   * @param events The list of transfer events to process.
   */
  private async processTransferEvents(events: TransferEvent[]): Promise<void> {
    console.log(events)
    // Iterate over each transfer event
    for (const event of events) {
      this.logger.log(`Processing event ${event.transactionHash}`);
      const fromAccount = await this.databaseService.getOrCreateAccount(event.from);
      const toAccount = await this.databaseService.getOrCreateAccount(event.to);
      // Format the amount of USDC transferred
      const amount = formatUSDCAmount(event.amount);

      // Save a new transaction entity in the database
      await this.databaseService.saveTransaction({
        // Transaction hash
        txHash: event.transactionHash,
        // Block number
        blockNumber: event.blockNumber,
        // Timestamp of the block
        blockTimestamp: new Date(event.blockTimestamp * 1000),
        // Sender account
        from: {
          // Sender address
          address: fromAccount!.address,
          // Total volume of USDC transferred in/out of this account
          totalVolumeUSDC: 0,
          // Number of transactions in/out of this account
          totalTransactions: 0,
          // Last known balance of this account
          lastBalance: 0,
          // Timestamp of first time this account was seen
          firstSeen: new Date(),
          // Timestamp of last time this account was seen
          lastActive: new Date(),
          // List of transactions sent by this account
          sentTransactions: [],
          // List of transactions received by this account
          receivedTransactions: []
        },
        // Recipient account
        to: {
          // Recipient address
          address:toAccount!.address,
          // Total volume of USDC transferred in/out of this account
          totalVolumeUSDC: 0,
          // Number of transactions in/out of this account
          totalTransactions: 0,
          // Last known balance of this account
          lastBalance: 0,
          // Timestamp of first time this account was seen
          firstSeen: new Date(),
          // Timestamp of last time this account was seen
          lastActive: new Date(),
          // List of transactions sent by this account
          sentTransactions: [],
          // List of transactions received by this account
          receivedTransactions: []
        },
        // Amount of USDC transferred
        amount,
        // Gas used by the transaction
        gasUsed: parseFloat(ethers.formatEther(event.gasUsed)),
        // Gas price in gwei
        gasPrice: parseFloat(ethers.formatUnits(event.gasPrice, 'gwei'))
      });

       this.logger.log(`Updated sender account ${event.from}`);
      // Update the total volume and number of transactions for the sender account
      await this.databaseService.updateAccountStats(event.from, amount, false);
       this.logger.log(`Updated recipient account ${event.to}`);
      // Update the total volume and number of transactions for the recipient account
      await this.databaseService.updateAccountStats(event.to, amount, true);

      // Clear the cache for the sender and recipient accounts
      this.logger.log(`Clearing cache for sender account ${event.from}`);
      await this.cacheService.clearAccountCache(event.from);
      this.logger.log(`Clearing cache for recipient account ${event.to}`);
      await this.cacheService.clearAccountCache(event.to);
    }
  }

  private async updateStatistics(): Promise<void> {
    this.logger.log('Updating 24h volume');
    // Update 24h volume
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const volume = await this.databaseService.getTotalVolumeInTimeRange(
      oneDayAgo,
      new Date()
    );
    this.logger.log(`Updated 24h volume to ${volume}`);
    await this.cacheService.set24HVolume(volume);

    this.logger.log('Updating top accounts');
    // Update top accounts
    const topAccounts = await this.databaseService.getTopAccounts(10);
    this.logger.log(`Updated top accounts to ${topAccounts}`);
    await this.cacheService.setTopAccounts(topAccounts);
  }

 
  async getTopAccountsByVolume(): Promise<any> {
    return this.cacheService.getTopAccounts();
  }

  async get24HourVolume(): Promise<number|null> {
    return this.cacheService.get24HVolume();
  }


  async getLatestProcessedBlock(): Promise<number|null> {
    return this.cacheService.getLatestBlock() || 0;
  }

  async getSyncStatus(): Promise<any> {
    const latestProcessedBlock = await this.getLatestProcessedBlock();
    const currentNetworkBlock = await this.avalancheGateway.getLatestBlockNumber();
    
    const blocksRemaining = Math.max(0, currentNetworkBlock - latestProcessedBlock!);
    const estimatedTimeInSeconds = blocksRemaining * AVALANCHE_CONSTANTS.BLOCK_TIME;
    
    return {
      latestProcessedBlock,
      currentNetworkBlock,
      blocksRemaining,
      isSynced: blocksRemaining === 0,
      syncPercentage: latestProcessedBlock! > 0 
        ? Math.min(100, (latestProcessedBlock! / currentNetworkBlock) * 100).toFixed(2)
        : 0,
      estimatedTimeRemaining: estimatedTimeInSeconds,
    };
  }

  async checkRPCStatus(): Promise<any> {
    try {
      const startTime = Date.now();
      await this.avalancheGateway.getLatestBlockNumber();
      const latency = Date.now() - startTime;
      
      return {
        connected: true,
        latency: `${latency}ms`,
        url: AVALANCHE_CONSTANTS.EVENTS, // Assumes this method exists or needs to be implemented
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  async getAccountTransfers(address: string, limit: number = 100): Promise<AccountStatsDto> {
    const cachedStats = await this.cacheService.getAccountStats(address);
    if (cachedStats) {
        // If we have cached stats but need to adjust the limit
        if (cachedStats.transactions && cachedStats.transactions.length > limit) {
            cachedStats.transactions = cachedStats.transactions.slice(0, limit);
            return cachedStats;
        }
        return cachedStats;
    }

    const accountData = await this.databaseService.getAccountTransactionHistory(address, limit);

    // Map Transaction entities to AccountTransactionDto
    const transactions = accountData.map(transaction => ({
        txHash: transaction.txHash,
        blockNumber: transaction.blockNumber,
        timestamp: transaction.blockTimestamp,
        counterparty: transaction.from.address === address ? transaction.to.address : transaction.from.address,
        amount: transaction.amount,
        direction: transaction.from.address === address ? 'out' as 'out' : 'in' as 'in',
        fee: transaction.gasPrice * transaction.gasUsed,
    }));

    // Calculate aggregate values from transactions
    const balance = transactions.reduce((acc, transaction) => acc + (transaction.direction === 'in' ? transaction.amount : -transaction.amount), 0);
    const totalSent = transactions.reduce((acc, transaction) => acc + (transaction.direction === 'out' ? transaction.amount : 0), 0);
    const totalReceived = transactions.reduce((acc, transaction) => acc + (transaction.direction === 'in' ? transaction.amount : 0), 0);
    const transactionCount = transactions.length;
    const lastActivityTimestamp = transactions.length > 0 ? new Date(Math.max(...transactions.map(t => new Date(t.timestamp).getTime()))) : new Date();

    const stats: AccountStatsDto = {
        address,
        balance,
        totalSent,
        totalReceived,
        transactionCount,
        lastActivityTimestamp,
        transactions,
    };

    await this.cacheService.setAccountStats(address, stats);
    return stats;
}


  async getTransfersByTimeRange(
    startTime: Date,
    endTime: Date,
    limit: number = 100
  ): Promise<TransferResponseDto[]> {
    // Check if we have this in cache
    const cachedTransfers = await this.cacheService.getTransfers(startTime, endTime, limit);
    if (cachedTransfers) {
      return cachedTransfers;
    }
  
    // Fetch from database
    const transfers = await this.databaseService.getTransactionsByTimeRange(startTime, endTime, limit);
    
    // Format the response
    const response: TransferResponseDto[] = transfers.map(transfer => ({
      txHash: transfer.txHash,
      blockNumber: transfer.blockNumber,
      timestamp: transfer.blockTimestamp,
      from: transfer.from.address,
      to: transfer.to.address,
      amount: transfer.amount,
      gasUsed: transfer.gasUsed,
      gasPrice: transfer.gasPrice,
      fee: transfer.gasUsed * transfer.gasPrice,
    }));
  
    // Cache the result for future use
    await this.cacheService.setTransfers(startTime, endTime, limit, response);
    
    return response;
  }


  async getVolumeDistribution(timeframe: 'hourly' | 'daily' | 'weekly'): Promise<any[]> {
    const cachedDistribution = await this.cacheService.getVolumeDistribution(timeframe);
    if (cachedDistribution) {
      return cachedDistribution;
    }
  
    // Calculate time intervals based on timeframe
    const now = new Date();
    let intervalMs: number;
    let periods: number;
    
    switch(timeframe) {
      case 'hourly':
        intervalMs = 60 * 60 * 1000; // 1 hour
        periods = 24; // Last 24 hours
        break;
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        periods = 7; // Last 7 days
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
        periods = 8; // Last 8 weeks
        break;
    }
  
    const volumeData:any = [];
    
    // Get volume for each period
    for (let i = 0; i < periods; i++) {
      const endTime = new Date(now.getTime() - (i * intervalMs));
      const startTime = new Date(endTime.getTime() - intervalMs);
      
      const volume = await this.databaseService.getTotalVolumeInTimeRange(startTime, endTime);
      
      volumeData.unshift({
        period: this.formatPeriodLabel(startTime, timeframe),
        startTime,
        endTime,
        volume,
      });
    }
    
    // Cache the result
    await this.cacheService.setVolumeDistribution(timeframe, volumeData);
    
    return volumeData;
  }

  private formatPeriodLabel(date: Date, timeframe: string): string {
    switch(timeframe) {
      case 'hourly':
        return `${date.getHours()}:00`;
      case 'daily':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'weekly':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      default:
        return '';
    }
  }

}


