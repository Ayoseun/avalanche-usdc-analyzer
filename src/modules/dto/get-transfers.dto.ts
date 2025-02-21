//src/modules/dto/get-transfers.dto.ts

import { IsEthereumAddress, IsISO8601, IsNumberString, IsOptional, IsPositive } from 'class-validator';

export class GetTransfersDto {
  @IsNumberString()
  fromBlock: string;

  @IsNumberString()
  toBlock: string;

  @IsOptional()
  @IsISO8601()
  startTime?: Date;

  @IsOptional()
  @IsISO8601()
  endTime?: Date;

  @IsOptional()
  @IsEthereumAddress()
  sender?: string;

  @IsOptional()
  @IsEthereumAddress()
  receiver?: string;

  @IsOptional()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  limit?: number = 10;
}
