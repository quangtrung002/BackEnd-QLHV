import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ToLowerCase, Trim } from 'src/base/validators/validator.transformer';

export class EmailUserDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsNotEmpty()
  @Trim()
  @ToLowerCase()
  @MinLength(1)
  @MaxLength(255)
  @IsEmail()
  email: string;
}
