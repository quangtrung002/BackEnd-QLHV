import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/base/validators/regex/password.regex';

export class SetPasswordDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @Length(8, 30)
  @Matches(PASSWORD_REGEX.HIGH.regex, { message: PASSWORD_REGEX.HIGH.message })
  newPassword: string;
}

export class ChangePasswordDto extends SetPasswordDto {}
