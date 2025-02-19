import { ethers } from 'ethers';
import { TransferEvent } from './avalanche.interface';


export const formatTransferData = (events: any[], decimal: number): TransferEvent[] => {
  return events.map(event => ({
    from: event.args?.from,
    to: event.args?.to,
    value: ethers.formatUnits(event.args?.value, decimal),
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }));
};

