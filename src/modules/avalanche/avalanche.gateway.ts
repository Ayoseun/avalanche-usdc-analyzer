import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AvalancheService } from './avalanche.service';
import { LoggerService } from '../../utils/logger';
import { ethers } from 'ethers';
import { ConfigService } from '../../config/config.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class AvalancheGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private provider: ethers.JsonRpcProvider;
  private usdcContract: ethers.Contract;
  private listeners: Map<string, Socket> = new Map();

  constructor(
    private readonly avalancheService: AvalancheService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.provider = new ethers.JsonRpcProvider(this.configService.envConfig.AVALANCHE_RPC_URL);
    this.usdcContract = new ethers.Contract(
      this.configService.envConfig.CONTRACT_ADDRESS,
      ["event Transfer(address indexed from, address indexed to, uint256 value)"],
      this.provider
    );
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.listeners.set(client.id, client);
    
    // If this is the first client, start listening for events
    if (this.listeners.size === 1) {
      this.startListeningToTransfers();
    }
    
    // Send recent transfers as initial data
    const latestBlock = await this.provider.getBlockNumber();
    const transfers = await this.avalancheService.getUsdcTransfers(
      latestBlock - 100, // Last 100 blocks
      latestBlock
    );
    client.emit('recent-transfers', transfers);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.listeners.delete(client.id);
    
    // If no more clients, stop listening for events
    if (this.listeners.size === 0) {
      this.stopListeningToTransfers();
    }
  }

  private startListeningToTransfers() {
    this.logger.log('Started listening to USDC transfer events');
    this.usdcContract.on('Transfer', (from, to, value, event) => {
      const transferData = {
        from,
        to,
        value: ethers.formatUnits(value, 6), // USDC has 6 decimals
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: Date.now()
      };
      
      // Broadcast to all connected clients
      this.server.emit('new-transfer', transferData);
    });
  }

  private stopListeningToTransfers() {
    this.logger.log('Stopped listening to USDC transfer events');
    this.usdcContract.removeAllListeners('Transfer');
  }
}