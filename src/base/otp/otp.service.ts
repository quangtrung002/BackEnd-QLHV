import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class OtpService {
  constructor(private readonly config: ConfigService) {}

  protected aliasName: string = 'codes';

  createOtp(secretKey: string): string {
    if (!this.config.OTP_ENABLE) {
      return '111111';
    }

    authenticator.options = {
      ...this.config.OTP_OPTION,
      epoch: Date.now(),
    };
    console.log(authenticator)
    const secret = this.config.OTP_SECRET + secretKey;
    return authenticator.generate(secret);
  }

  verifyOTP(token: string, secretKey: string) {
    try {
      if (!this.config.OTP_ENABLE) {
        return '111111';
      }
      authenticator.options = {
        ...this.config.OTP_OPTION,
        epoch: Date.now(),
      };
      console.log(authenticator)
      
      const secret = this.config.OTP_SECRET + secretKey;
      return authenticator.verify({ token, secret });
    } catch (error) {
      console.error(error);
    }
  }
}
