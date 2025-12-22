import { Module } from '@nestjs/common';
import { OtpService } from 'src/base/otp/otp.service';
import { ConfigService } from 'src/configs/config.service';

@Module({
  providers: [OtpService, ConfigService],
  exports: [OtpService],
})
export class CodeModule {}
