


// avalanche.gateway.ts
import { Injectable, Logger } from '@nestjs/common';

import { ethers } from 'ethers';
import { AVALANCHE_CONSTANTS } from './avalanche.constants';
import { BlockInfo, TransferEvent, TransferEventFilters } from './avalanche.interface';
import { retry } from './avalanche.utils';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AvalancheGateway {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly logger = new Logger(AvalancheGateway.name);
  private readonly usdcContract: ethers.Contract;

  constructor(private configService: ConfigService) {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.envConfig.AVALANCHE_RPC_URL
    );
    
    this.usdcContract = new ethers.Contract(
      this.configService.envConfig.CONTRACT_ADDRESS,
      AVALANCHE_CONSTANTS.ABI,
      this.provider
    );
  }

  async getBlockInfo(blockNumber: number): Promise<BlockInfo> {
    return retry(async () => {
      const block = await this.provider.getBlock(blockNumber);
      return {
        number: block!.number,
        timestamp: block!.timestamp,
      };
    });
  }

  async getTransferEvents(filters: TransferEventFilters): Promise<TransferEvent[]> {
    const events = await retry(async () => {
      return this.usdcContract.queryFilter(
        'Transfer',
        filters.fromBlock,
        filters.toBlock
      );
    });

    const transferEvents: TransferEvent[] = [];
    
    for (const event of events) {
      const tx = await this.provider.getTransaction(event.transactionHash);
      const receipt = await this.provider.getTransactionReceipt(event.transactionHash);
   
      transferEvents.push({
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: (await this.provider.getBlock(event.blockNumber))?.timestamp || 0,
        from: (event as ethers.EventLog).args?.from,
        to: (event as ethers.EventLog).args?.to,
        amount: (event as ethers.EventLog).args?.value.toString(),
        gasUsed: receipt!.gasUsed.toString(),
        gasPrice: tx!.gasPrice?.toString() || '0',
      });
    }

    return transferEvents;
  }

  async getLatestBlockNumber(): Promise<number> {
    return retry(async () => {
      return this.provider.getBlockNumber();
    });
  }
}

