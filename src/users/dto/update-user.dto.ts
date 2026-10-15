import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Олег', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Кузнецов', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'Владимирович', required: false })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: 21, required: false })
  @IsInt()
  @Min(14)
  @IsOptional()
  age?: number;

  @ApiProperty({ example: '2005-05-15', required: false })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Формат даты должен быть YYYY-MM-DD' })
  @IsOptional()
  birthDate?: string;
}