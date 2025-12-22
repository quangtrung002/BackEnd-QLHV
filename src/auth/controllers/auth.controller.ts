import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiLanguageHeader,
  ApiOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import {
  ActiveRegisterDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  SendEmailDto,
  UpdatePasswordDto,
} from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SkipAuth, UserAuth } from '../decorator/jwt.decorator';

@SkipAuth()
@ApiTags('Xác thực')
@ApiLanguageHeader()
@Controller('auth')
export class AuthPublicController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Đăng nhập' })
  async login(@Body() data: LoginDto): Promise<any> {
    return await this.authService.login(data);
  }

  @Post('/register')
  @ApiOperation({ summary: 'Đăng kí tài khoản mới' })
  async register(@Body() data: RegisterDto): Promise<any> {
    return await this.authService.register(data);
  }

  @Post('/verify-otp')
  @ApiOperation({ summary: 'Xác nhận email bằng OTP' })
  async activeRegister(@Body() data: ActiveRegisterDto): Promise<any> {
    return await this.authService.verifyOtp(data);
  }

  @Post('/send-otp')
  @ApiOperation({ summary: 'Gửi mã OTP xác nhận email' })
  async sendOtp(@Body() data: SendEmailDto): Promise<any> {
    return await this.authService.sendOtp(data);
  }

  @Post('/refresh-token')
  @ApiOperation({ summary: 'Lấy lại token' })
  async refresh(@Body() data: RefreshTokenDto): Promise<any> {
    return await this.authService.refresh(data);
  }

  @ApiOperation({ summary: 'Gửi OTP đổi mật khẩu tới email' })
  @Post('/forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto): Promise<any> {
    return await this.authService.forgotPassword(data);
  }

  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng mã OTP' })
  @Post('/recover-password')
  async updatePassword(@Body() data: UpdatePasswordDto): Promise<any> {
    return await this.authService.recoverPassword(data);
  }
}

@ApiTagAndBearer('Xác thực')
@UseGuards(JwtAuthGuard)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  async getProfile(@UserAuth() user): Promise<any> {
    return await user;
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(@UserAuth() user): Promise<any> {
    console.log(user);
    return await this.authService.logout(user);
  }
}
