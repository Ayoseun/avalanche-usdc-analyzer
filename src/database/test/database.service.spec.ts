import { Test, TestingModule } from '@nestjs/testing';

import { Between, Repository, Transaction } from 'typeorm';
import { DatabaseService } from '../database.service';
import { Account } from '../entities/account.entity';
import { LoggerService } from '../../utils/logger';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let accountRepository: Repository<Account>;
  let transactionRepository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: Repository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: Repository,
          useValue: {
            createQueryBuilder: jest.fn(),
            where: jest.fn(),
            select: jest.fn(),
            getRawOne: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    accountRepository = module.get<Repository<Account>>(Repository);
    transactionRepository = module.get<Repository<Transaction>>(Repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveTransaction', () => {
    it('should save a transaction', async () => {
      const transactionData = {
        txHash: '0x123',
        blockNumber: 1,
        blockTimestamp: new Date(),
        from: {
          address: '0x1',
          totalVolumeUSDC: 0,
          totalTransactions: 0,
          lastBalance: 0,
          firstSeen: new Date(),
          lastActive: new Date(),
          sentTransactions: [],
          receivedTransactions: []
        },
        to: {
          address: '0x2',
          totalVolumeUSDC: 0,
          totalTransactions: 0,
          lastBalance: 0,
          firstSeen: new Date(),
          lastActive: new Date(),
          sentTransactions: [],
          receivedTransactions: []
        },
        amount: 1,
      };

      await service.saveTransaction(transactionData);

      expect(transactionRepository.create).toHaveBeenCalledWith(transactionData);
      expect(transactionRepository.save).toHaveBeenCalledWith(expect.any(Transaction));
    });
  });

  describe('updateAccountStats', () => {
    it('should update an account\'s stats', async () => {
      const address = '0x1';
      const amount = 1;
      const isReceiving = true;

      await service.updateAccountStats(address, amount, isReceiving);

      expect(accountRepository.findOne).toHaveBeenCalledWith({ where: { address } });
      expect(accountRepository.save).toHaveBeenCalledWith(expect.any(Account));
    });
  });

  describe('getTopAccounts', () => {
    it('should fetch top accounts', async () => {
      const limit = 10;

      await service.getTopAccounts(limit);

      expect(accountRepository.find).toHaveBeenCalledWith({
        order: { totalVolumeUSDC: 'DESC' },
        take: limit,
      });
    });
  });

  describe('getTransactionsByTimeRange', () => {
    it('should fetch transactions in a time range', async () => {
      const startTime = new Date();
      const endTime = new Date();
      const limit = 100;

      await service.getTransactionsByTimeRange(startTime, endTime, limit);

      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: {
          blockTimestamp: Between(startTime, endTime),
        },
        relations: ['from', 'to'],
        order: { blockTimestamp: 'DESC' },
        take: limit,
      });
    });
  });

  describe('getAccountTransactionHistory', () => {
    it('should fetch an account\'s transaction history', async () => {
      const address = '0x1';
      const limit = 100;

      await service.getAccountTransactionHistory(address, limit);

      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: [
          { from: { address } },
          { to: { address } },
        ],
        relations: ['from', 'to'],
        order: { blockTimestamp: 'DESC' },
        take: limit,
      });
    });
  });

  describe('getTotalVolumeInTimeRange', () => {
    it('should fetch total volume in a time range', async () => {
      const startTime = new Date();
      const endTime = new Date();

      const result = await service.getTotalVolumeInTimeRange(startTime, endTime);

      expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(transactionRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'transaction.blockTimestamp BETWEEN :startTime AND :endTime',
        {
          startTime,
          endTime,
        },
      );
      expect(transactionRepository.createQueryBuilder().select).toHaveBeenCalledWith(
        'SUM(transaction.amount)',
        'totalVolume',
      );
      expect(transactionRepository.createQueryBuilder().getRawOne).resolves.toEqual({
        totalVolume: result,
      });
    });
  });
});

