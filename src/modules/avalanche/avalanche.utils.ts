

// avalanche.utils.ts
import { AVALANCHE_CONSTANTS } from './avalanche.constants';
import { ethers } from 'ethers';
import { TransferEvent } from './avalanche.interface';

export const formatUSDCAmount = (amount: string): number => {
  return parseFloat(ethers.formatUnits(amount, AVALANCHE_CONSTANTS.DECIMALS));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts = AVALANCHE_CONSTANTS.RETRY_ATTEMPTS,
  delay = AVALANCHE_CONSTANTS.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, attempts - 1, delay);
  }
};

