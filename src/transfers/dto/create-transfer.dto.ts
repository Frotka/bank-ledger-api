import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({
    description: '16-значный номер карты отправителя',
    example: '2200123456789012',
  })
  @IsString()
  @Length(16, 16, { message: 'Номер карты должен состоять из 16 цифр' })
  @IsNotEmpty()
  fromCardNumber: string;

  @ApiProperty({
    description: '16-значный номер карты получателя',
    example: '2200987654321098',
  })
  @IsString()
  @Length(16, 16, { message: 'Номер карты должен состоять из 16 цифр' })
  @IsNotEmpty()
  toCardNumber: string;

  @ApiProperty({
    description: 'Сумма перевода',
    example: 3500,
  })
  @IsNumber()
  @IsPositive({ message: 'Сумма перевода должна быть больше нуля' })
  amount: number;
}