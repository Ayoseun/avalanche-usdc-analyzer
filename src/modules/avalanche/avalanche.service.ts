import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '../../config/config.service';
import { LoggerService } from '../../utils/logger';
import { formatTransferData } from './avalanche.utils';
import { CacheService } from '../../cache/cache.service';


@Injectable()
export class AvalancheService {
  private provider: ethers.JsonRpcProvider;
  private usdcAbi = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];

  constructor(
    private readonly configService: ConfigService,
    private cacheService:CacheService,
    private readonly logger: LoggerService,

  ) {

    this.provider = new ethers.JsonRpcProvider(this.configService.envConfig.AVALANCHE_RPC_URL);
  }

  async getUsdcTransfers(fromBlock: number, toBlock: number): Promise<any> {

    const cacheKey = `usdc_transfers_${fromBlock}_${toBlock}`;
    const cachedData = await this.cacheService.get(cacheKey);
   
    if (cachedData!==null && cachedData=== 'string') {
      this.logger.log('Returning cached USDC transfer data');
      return JSON.parse(cachedData);
    }

    try {
      this.logger.log(`Fetching USDC transfers from block ${fromBlock} to block ${toBlock}`);
      const contract = new ethers.Contract(this.configService.envConfig.CONTRACT_ADDRESS, this.usdcAbi, this.provider);
      const events = await contract.queryFilter('Transfer', fromBlock, toBlock);
      const transferData = formatTransferData(events,18);
      const serializedData = JSON.stringify(transferData);
      await this.cacheService.set(cacheKey, serializedData);
      return transferData;
    } catch (error) {
      this.logger.error('Error fetching USDC transfers', error);
      throw error;
    }
  }
}