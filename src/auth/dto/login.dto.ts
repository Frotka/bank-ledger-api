import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@bank.ru', description: 'Электронная почта' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'superSecret123', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  password: string;
}