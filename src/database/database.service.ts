



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
  ) {}

  async saveTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(transaction);
  }

  async updateAccountStats(address: string, amount: number, isReceiving: boolean): Promise<void> {
    let account = await this.accountRepository.findOne({ where: { address } });
    
    if (!account) {
      account = this.accountRepository.create({ address });
    }

    account.totalTransactions += 1;
    account.totalVolumeUSDC += Math.abs(amount);
    account.lastBalance = isReceiving ? 
      account.lastBalance + amount : 
      account.lastBalance - amount;
    account.lastActive = new Date();

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
      console.error('Error fetching total volume:', error);
      return 0;
    }
  }
}
