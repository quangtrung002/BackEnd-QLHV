import { Module } from '@nestjs/common';
import { AuthController, AuthPublicController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { UserModule } from '../app/user/user.module';
import { CodeModule } from '../base/otp/otp.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MailService } from 'src/base/mail/mail.service';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/user/entities/user.entity';

@Module({
  imports: [
    PassportModule,
    CodeModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: jwtConstants.expiresIn,
      },
    }),
    TypeOrmModule.forFeature([UserEntity])
  ],
  providers: [
    UserService,
    AuthService,
    JwtStrategy,
    MailService,
    // JwtRefreshStrategy
    // GoogleStrategy,
    // FacebookStrategy,
  ],
  controllers: [AuthController, AuthPublicController],
  exports: [AuthService],
})
export class AuthModule {}
