import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  password?: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  @IsOptional()
  @ApiPropertyOptional()
  username?: string;
}
