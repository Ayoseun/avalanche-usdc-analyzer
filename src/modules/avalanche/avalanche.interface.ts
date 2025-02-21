

// avalanche.interface.ts
export interface TransferEvent {
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: number;
  from: string;
  to: string;
  amount: string;
  gasUsed: string;
  gasPrice: string;
}

export interface BlockInfo {
  number: number;
  timestamp: number;
}

export interface TransferEventFilters {
  fromBlock?: number;
  toBlock?: number;
  fromAddress?: string;
  toAddress?: string;
}