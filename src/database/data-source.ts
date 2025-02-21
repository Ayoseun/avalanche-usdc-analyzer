import "reflect-metadata";
import { ConfigService } from "../config/config.service";
import { DataSource } from "typeorm";
import { Account } from "./entities/account.entity";
import { Transaction } from "./entities/transaction.entity";
import { InitSchema1645567890123 } from "./migrations/001-init-schema";


const configService = new ConfigService();
// Define all your entities here
const entities = [Account, Transaction]
export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.envConfig.DB_HOST,
  port: parseInt(configService.envConfig.DB_PORT, 10),
  username: configService.envConfig.DB_USER,
  password: configService.envConfig.DB_PASSWORD,
  database: configService.envConfig.DB_NAME,
  entities:entities,
  migrations: [InitSchema1645567890123],
  migrationsTableName: "migrations",
  migrationsRun: false,
  synchronize: false, // Always false in production
  logging: configService.envConfig.NODE_ENV === "development",
});


// Initialize connection
let initialized = false

export async function initializeDatabase() {
  if (!initialized) {
    try {
      await AppDataSource.initialize()
      initialized = true
      console.log("Data Source has been initialized!")
    } catch (error) {
      console.error("Error during Data Source initialization:", error)
      throw error
    }
  }
  return AppDataSource
}