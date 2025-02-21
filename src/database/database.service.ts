



// database.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { LoggerService } from '../utils/logger';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private readonly logger: LoggerService,
  ) {

  }
 
  async getOrCreateAccount(address: string, isReceiving: boolean = false): Promise<Account|null> {
    this.logger.log('Getting or creating account...');
    let account = await this.accountRepository.findOneBy({ address });
    
    if (!account && isReceiving) {
      // Only create a new account with initial stats if they're receiving
      account = this.accountRepository.create({
        address,
        totalVolumeUSDC: 0,
        totalTransactions: 0,
        lastBalance: 0,
        firstSeen: new Date(),
        lastActive: new Date(),
      });
      await this.accountRepository.save(account);
      this.logger.log(`Created new account for ${address} (receiving transaction)`);
    }
    
    return account;
  }

  async saveTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    this.logger.log('Saving transaction to database...');
    
    // Ensure sender account exists (but don't create if it doesn't)
    const senderAccount = await this.getOrCreateAccount(transactionData.from!.address, false);
    
    // Always create/update recipient account
    const recipientAccount = await this.getOrCreateAccount(transactionData.to!.address, true);
    
    // Create and save the transaction
    const transaction = this.transactionRepository.create(transactionData);
    const savedTransaction = await this.transactionRepository.save(transaction);
    
    // Update stats for existing accounts
    if (senderAccount) {
      await this.updateAccountStats(senderAccount.address, transactionData.amount!, false);
    }
    
    if (recipientAccount) {
      await this.updateAccountStats(recipientAccount.address, transactionData.amount!, true);
    }
    
    return savedTransaction;
  }
  async updateAccountStats(address: string, amount: number, isReceiving: boolean): Promise<void> {
    this.logger.log(`Updating account stats for ${address}...`);
    const account = await this.accountRepository.findOne({ where: { address } });
    
    if (!account) {
      this.logger.log(`Skipping stats update for non-existent account ${address}`);
      return;
    }

    // Normalize amount to handle precision
    const normalizedAmount = Math.round(amount * 1000000) / 1000000;
    
    account.totalTransactions += 1;
    account.totalVolumeUSDC += Math.abs(normalizedAmount);
    account.lastBalance = isReceiving ? 
      account.lastBalance + normalizedAmount :
      account.lastBalance - normalizedAmount;
    account.lastActive = new Date();

    this.logger.log(`Stats update for ${address}: balance=${account.lastBalance}, transactions=${account.totalTransactions}`);
    await this.accountRepository.save(account);
  }

  async getTopAccounts(limit: number = 10): Promise<Account[]> {
    this.logger.log('Fetching top accounts from database...');
    try {
      const result = await this.accountRepository.find({
        order: { totalVolumeUSDC: 'DESC' },
        take: limit,
      });
      this.logger.log(`Fetched top ${limit} accounts from database.`);
      return result;
    } catch (error) {
      this.logger.error('Error fetching top accounts:', error);
      return [];
    }
  }

  async getTransactionsByTimeRange(
    startTime: Date,
    endTime: Date,
    limit: number = 100,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: {
        blockTimestamp: Between(startTime, endTime),
      },
      relations: ['from', 'to'],
      order: { blockTimestamp: 'DESC' },
      take: limit,
    });
  }

  async getAccountTransactionHistory(
    address: string,
    limit: number = 100,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: [
        { from: { address } },
        { to: { address } },
      ],
      relations: ['from', 'to'],
      order: { blockTimestamp: 'DESC' },
      take: limit,
    });
  }

  async getTotalVolumeInTimeRange(
    startTime: Date,
    endTime: Date,
  ): Promise<number> {
    try {
      const result = await this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.blockTimestamp BETWEEN :startTime AND :endTime', {
          startTime,
          endTime,
        })
        .select('SUM(transaction.amount)', 'totalVolume')
        .getRawOne();

      return result.totalVolume || 0;
    } catch (error) {
      // Log error or handle it as needed
      this.logger.error('Error fetching total volume:', error);
      return 0;
    }
  }
}
