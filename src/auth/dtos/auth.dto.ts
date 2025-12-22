import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailUserDto } from 'src/app/user/dtos/email-user.dto';
import { PASSWORD_REGEX } from 'src/base/validators/regex/password.regex';

export class ActiveRegisterDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '000000' })
  @Length(6, 6)
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}

export class LoginDto extends EmailUserDto {
  @ApiProperty({ example: 'Trungbin002@' })
  @IsNotEmpty()
  @Length(8, 255)
  @Matches(PASSWORD_REGEX.HIGH.regex, { message: PASSWORD_REGEX.HIGH.message })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export class RegisterDto extends EmailUserDto {
  @ApiProperty({ example: 'Trungbin002@' })
  @IsNotEmpty()
  @Length(8, 255)
  @Matches(PASSWORD_REGEX.HIGH.regex, { message: PASSWORD_REGEX.HIGH.message })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(4, 50)
  username: string;
}

export class UpdatePasswordDto extends EmailUserDto {
  @ApiProperty({ example: 'Trungbin002@' })
  @Matches(PASSWORD_REGEX.HIGH.regex, { message: PASSWORD_REGEX.HIGH.message })
  newPassword: string;

  @ApiProperty({ example: '000000' })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  otpCode: string;
}

export class ForgotPasswordDto extends EmailUserDto {}
export class SendEmailDto extends EmailUserDto {}
