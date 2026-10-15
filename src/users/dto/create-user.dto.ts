import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Олег', description: 'Имя' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Кузнецов', description: 'Фамилия' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'Владимирович', description: 'Отчество', required: false })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: 20, description: 'Возраст' })
  @IsInt()
  @Min(14, { message: 'Банковские карты открываются с 14 лет' })
  age: number;

  @ApiProperty({ example: '2006-05-15', description: 'Дата рождения (ГГГГ-ММ-ДД)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Формат даты должен быть YYYY-MM-DD' })
  birthDate: string;

  @ApiProperty({ example: 'user@bank.ru', description: 'Электронная почта' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'superSecret123', description: 'Пароль для входа в интернет-банк' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}