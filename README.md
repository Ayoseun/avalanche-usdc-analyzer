# avalanche-usdc-analyzer
This is a **NestJS-based backend** service that **fetches, aggregates, and analyzes USDC transactions** on the Avalanche C-Chain in real-time. It provides RESTful APIs to retrieve **aggregated stats** and **raw transaction data**.


## Features
- **Real-time USDC transfer monitoring** (ERC-20 event logs)
- **Data aggregation** (total transfers, top accounts)
- **RESTful API** for querying historical and real-time data
- **Optimized storage & indexing** using PostgreSQL
- **Caching layer** for performance optimization (Redis)
- **Automated tests** for reliability (Unit & E2E)
- **Containerized deployment** using Docker

---

## **Architecture**
### **Tech Stack**
- **Backend:** NestJS (TypeScript)
- **Blockchain Interaction:** Ethers.js (Avalanche RPC)
- **Database:** PostgreSQL (TypeORM)
- **Caching:** Redis (for optimized queries)
- **API Docs:** Swagger / OpenAPI

### **Folder Structure**
Refer to the detailed folder structure in the repository.

---

## **Setup & Installation**
### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/yourusername/avalanche-usdc-analyzer.git
```
cd avalanche-usdc-analyzer
2️⃣ Install Dependencies
```sh
npm install
```
3️⃣ Set Up Environment Variables
Copy .env.example to .env and fill in the required values:

```sh
cp .env.example .env
```
- env variables
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
USDC_CONTRACT_ADDRESS=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
DATABASE_URL=postgres://user:password@localhost:5432/usdc_db
REDIS_URL=redis://localhost:6379

4️⃣ Run Database Migrations
```sh
npm run migration:run
```
5️⃣ Start the Server
```sh
npm run start:dev
```

The API will be available at:
http://localhost:3000/api

- API Endpoints
| Method | Endpoint               | Description                           |
|--------|------------------------|---------------------------------------|
| GET    | /api/usdc/transfers    | Fetch paginated USDC transactions     |
| GET    | /api/usdc/stats        | Get aggregated USDC transfer stats    |

API documentation is available at http://localhost:3000/api-docs

###Testing
```sh
npm run test
npm run test:e2e
```
### Deployment
#### Docker (Production)
```sh
docker-compose up --build
```
### Manual Deployment
1. Set up PostgreSQL and Redis.
2. Run the application with:
```sh
npm run start:prod
```
### Security & Best Practices
- Rate limiting & request validation to prevent abuse
- Error handling & logging using a centralized logger
- Database indexing & caching for high performance
- CI/CD pipeline for automated deployments (GitHub Actions)

### Contributing
1. Fork the repository.
2. Create a feature branch: git checkout -b feature-name
3. Commit changes: git commit -m "Add feature"
4. Push to the branch: git push origin feature-name
5. Submit a pull request.

### License
This project is licensed under the MIT License.