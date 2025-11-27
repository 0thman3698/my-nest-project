import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator';

import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  @ApiProperty()
  title: string;
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty()
  @Max(1000000)
  price: number;
  @IsString()
  @IsOptional()
  @ApiProperty()
  @Length(3, 1000)
  description: string;
}
