// avalanche.constants.ts
export const AVALANCHE_CONSTANTS = {
  ABI:[
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ],
    USDC_CONTRACT: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC Contract on Avalanche
    BLOCK_TIME: 2, // Average block time in seconds
    DECIMALS: 6, // USDC decimals
    EVENTS: {
      TRANSFER: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
    },
    RPC_BATCH_SIZE: 100,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // ms
  };
  