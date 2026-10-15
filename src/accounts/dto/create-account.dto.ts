import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Начальный баланс',
    example: 50000,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  initialBalance?: number;

  @ApiProperty({
    description: 'Валюта счёта',
    example: 'RUB',
    required: false,
    default: 'RUB',
  })
  @IsString()
  @IsOptional()
  currency?: string;
}