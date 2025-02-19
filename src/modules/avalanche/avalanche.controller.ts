import { Controller, Get, Query, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { AvalancheService } from './avalanche.service';
import { GetTransfersDto } from '../dto/get-transfers.dto';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@ApiTags('avalanche')
@Controller('avalanche')
@UseFilters(HttpExceptionFilter) 
export class AvalancheController {
  constructor(private readonly avalancheService: AvalancheService) {}

  @Get('usdc-transfers')
  @ApiOperation({ summary: 'Get USDC transfers within a block range' })
  @ApiResponse({ status: 200, description: 'USDC transfers retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid block range' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTransfers(@Query() query: GetTransfersDto) {
    return this.avalancheService.getUsdcTransfers(Number(query.fromBlock), Number(query.toBlock));
  }

  @ApiOperation({ 
    summary: 'WebSocket endpoint for real-time USDC transfers',
    description: `
    Connect to WebSocket at ws://<your-server-url>/socket.io
    
    Events:
    - 'recent-transfers': Emitted on connection with recent transfers
    - 'new-transfer': Emitted whenever a new USDC transfer occurs
    
    Example client code:
    \`\`\`javascript
    const socket = io('ws://<your-server-url>');
    socket.on('recent-transfers', (data) => console.log('Recent transfers:', data));
    socket.on('new-transfer', (data) => console.log('New transfer:', data));
    \`\`\`
    `
  })
  @Get('transfers/realtime')
  getRealtimeInfo() {
    return {
      message: 'This endpoint is for documentation only. Please connect via WebSocket to receive real-time transfer data.',
      websocketUrl: 'ws://<your-server-url>/socket.io',
      events: {
        'recent-transfers': 'Emitted on connection with recent transfers',
        'new-transfer': 'Emitted whenever a new USDC transfer occurs'
      }
    };
  }
}
