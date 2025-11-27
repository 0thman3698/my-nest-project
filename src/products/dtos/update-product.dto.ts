import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  Max,
  Min,
  Length,
  IsString,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(3, 150)
  @ApiPropertyOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000000)
  @ApiPropertyOptional()
  price?: number;

  @IsString()
  @IsOptional()
  @Length(3, 1000)
  @ApiPropertyOptional()
  description?: string;
}
