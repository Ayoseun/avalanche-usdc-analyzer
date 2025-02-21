# Avalanche USDC Transaction Tracker

A NestJS-based service that tracks and analyzes USDC transfers on the Avalanche network. This service provides real-time monitoring, historical data analysis, and API endpoints for querying transaction statistics.

## Features

- Real-time USDC transfer monitoring on Avalanche
- Historical transaction data tracking and analysis
- Account statistics and balance tracking
- Volume distribution analysis (hourly/daily/weekly)
- Caching system for improved performance
- RESTful API endpoints for data access
- Transaction sync status monitoring

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Blockchain Interaction**: ethers.js
- **Task Scheduling**: @nestjs/schedule
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- Access to an Avalanche RPC node

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=avalanche_tracker

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Avalanche RPC Configuration
AVALANCHE_RPC_URL=your_rpc_url
CONTRACT_ADDRESS=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E

# Application Configuration
PORT=3000
NODE_ENV=development
```

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/avalanche-usdc-tracker.git

# Install dependencies
cd avalanche-usdc-tracker
npm install

# Setup database
npm run typeorm:migration:run

# Start the application
npm run start:dev
```

## Quick start
To get started quickly run the following make command

```sh

make run

```

## Architecture Overview

### Core Components

1. **AvalancheService (`avalanche.service.ts`)**
   - Manages block processing and event tracking
   - Handles transaction synchronization
   - Updates account statistics and volume metrics
   - Key methods:
     - `processNewBlocks()`: Processes new blocks for USDC transfers
     - `getAccountTransfers()`: Retrieves transfer history for an account
     - `getVolumeDistribution()`: Gets volume distribution over time
     - `getSyncStatus()`: Checks current sync status

2. **DatabaseService (`database.service.ts`)**
   - Handles all database operations
   - Manages account and transaction records
   - Provides data aggregation functions

3. **CacheService**
   - Implements caching strategy for frequently accessed data
   - Reduces database load
   - Improves API response times

### Data Flow

```
Block Event → AvalancheGateway → AvalancheService → DatabaseService
                                        ↓
                                  CacheService
                                        ↓
                                   API Endpoints
```

## API Endpoints

### Account Operations

```typescript
GET /api/accounts/:address
```
Returns account statistics and transfer history

**Response:**
```json
{
  "address": "0x...",
  "balance": 1000.00,
  "totalSent": 500.00,
  "totalReceived": 1500.00,
  "transactionCount": 10,
  "lastActivityTimestamp": "2024-02-21T04:46:59.000Z",
  "transactions": [...]
}
```

### Volume Statistics

```typescript
GET /api/stats/volume/:timeframe
```
Returns volume distribution (hourly/daily/weekly)

**Parameters:**
- timeframe: 'hourly' | 'daily' | 'weekly'

### Sync Status

```typescript
GET /api/status/sync
```
Returns current synchronization status

**Response:**
```json
{
  "latestProcessedBlock": 12345678,
  "currentNetworkBlock": 12345700,
  "blocksRemaining": 22,
  "isSynced": false,
  "syncPercentage": "99.98",
  "estimatedTimeRemaining": 440
}
```

## Block Processing Logic

The service processes USDC transfers using the following strategy:

1. **Block Scanning**
   - Starts from block 11975000 (Jan 1, 2022)
   - Processes blocks in batches for efficiency
   - Maintains sync state in cache

2. **Event Processing**
   - Monitors USDC transfer events
   - Updates account balances and statistics
   - Maintains transaction history

3. **Statistics Updates**
   - Updates 24-hour volume metrics
   - Refreshes top accounts list
   - Updates volume distribution data

## Performance Considerations

- Uses batch processing for block scanning
- Implements caching for frequently accessed data
- Maintains indexes on critical database columns
- Uses database transactions for data integrity

## Monitoring and Maintenance

The service provides several monitoring endpoints:

```typescript
GET /api/status/health
GET /api/status/rpc
GET /api/status/cache
```

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Migrations

```bash
# Generate a migration
npm run typeorm:migration:generate -- -n MigrationName

# Run migrations
npm run typeorm:migration:run
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.