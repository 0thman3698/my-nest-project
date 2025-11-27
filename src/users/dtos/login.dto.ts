import {
  IsEmail,
  MaxLength,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @MaxLength(250)
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
