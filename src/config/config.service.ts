import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * This class provides a single source of truth for configuration values in the application.
 * It loads configuration values from an environment file based on the NODE_ENV environment variable.
 * The configuration values are then exposed as public properties of the class.
 */
@Injectable()
export class ConfigService {
  /**
   * This property holds the configuration values loaded from the environment file.
   * It is an object where the keys are the names of the configuration values and the values are the values of the configuration values.
   */
  public readonly envConfig: { [key: string]: string } = {};

  /**
   * This is the constructor for the ConfigService class.
   * It is called when an instance of the class is created.
   * It loads the configuration values from the environment file based on the NODE_ENV environment variable.
   */
  constructor() {
    /**
     * This variable is set to the path of the environment file to load.
     * The path is constructed by concatenating the base path with the NODE_ENV environment variable.
     * If the NODE_ENV environment variable is not set, it defaults to 'development'.
     */
    const envFile = `src/config/env/${process.env.NODE_ENV || 'development'}.env`;

    /**
     * This line of code reads the contents of the environment file and parses it into an object.
     * The object is then assigned to the envConfig property.
     */
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  /**
   * This property is set to the value of the AVALANCHE_RPC_URL configuration value.
   * It is a string that represents the URL of the Avalanche RPC server.
   */
  public readonly AVALANCHE_RPC_URL = this.envConfig['AVALANCHE_RPC_URL'];

  /**
   * This property is set to the value of the CONTRACT_ADDRESS configuration value.
   * It is a string that represents the address of the USDC contract on Avalanche.
   */
  public readonly CONTRACT_ADDRESS = this.envConfig['CONTRACT_ADDRESS'];

  /**
   * This property is set to the value of the DATABASE_URL configuration value.
   * It is a string that represents the URL of the database server.
   */
  public readonly DATABASE_URL = this.envConfig['DATABASE_URL'];

  /**
   * This property is set to the value of the REDIS_URL configuration value.
   * It is a string that represents the URL of the Redis server.
   */
  public readonly REDIS_HOST = this.envConfig['REDIS_HOST'];
  public readonly REDIS_PORT = this.envConfig['REDIS_PORT'];
  public readonly REDIS_PASSWORD=this.envConfig['REDIS_PASSWORD'];
  /**
   * This property is set to the value of the CACHE_TTL configuration value.
   * It is a number that represents the time to live of the cache in seconds.
   */
  public readonly CACHE_TTL = Number(this.envConfig['CACHE_TTL']);

  /**
   * This property is set to the value of the PORT configuration value.
   * It is a number that represents the port number that the application should listen on.
   */
  public readonly PORT = Number(this.envConfig['PORT']);
}

