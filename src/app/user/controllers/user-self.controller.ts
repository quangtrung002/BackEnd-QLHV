import {
  ApiOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import { UserService } from '../services/user-self.service';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import { UserEntity } from '../entities/user.entity';
import { ChangePasswordDto } from '../dtos/user.dto';

const userSelf = 'tài khoản đang sử dụng';

@ApiTagAndBearer('Tài khoản cá nhân')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Lấy thông tin ' + userSelf })
  @Get('me')
  getMe(@UserAuth() user: User): UserEntity {
    return user;
  }

  @ApiOperation({ summary: 'Đổi mật khẩu ' + userSelf })
  @Post('change-password')
  async changePassword(@UserAuth() user: User, @Body() dto: ChangePasswordDto) {
    await this.userService.changePassword(user.id, dto);
  }

  @ApiOperation({ summary: 'Thay avatar ' + userSelf })
  @Patch('set-avatar')
  async setAvatar(@UserAuth() user: User, @Body() dto) {}
}
