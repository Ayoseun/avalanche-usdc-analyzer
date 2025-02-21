import "reflect-metadata";
import { ConfigService } from "../config/config.service";
import { DataSource } from "typeorm";


const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.envConfig.DB_HOST,
  port: parseInt(configService.envConfig.DB_PORT, 10),
  username: configService.envConfig.DB_USER,
  password: configService.envConfig.DB_PASSWORD,
  database: configService.envConfig.DB_NAME,
  entities: ["src/entity/*.ts"],
  migrations: ["migrations/*.ts"],
  synchronize: false, // Always false in production
  logging: configService.envConfig.NODE_ENV === "development",
});


